import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { supabase } from '../lib/supabase';
import {
  KNOWN_COLUMNS,
  chunk,
  parseCsv,
  suggestMapping,
  validateRows,
  type ColumnMapping,
  type KnownColumn,
  type ParsedCsv,
  type ValidationReport,
} from '../lib/csvImport';

const BATCH_SIZE = 500;
const PREVIEW_ROWS = 10;

type Stage = 'pick' | 'map' | 'importing' | 'done';

type ImportResult = { imported: number; failed: ValidationReport['skipped'] };

export function ImportPage() {
  const [stage, setStage] = useState<Stage>('pick');
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [categorySlugs, setCategorySlugs] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setFileName(file.name);

    const text = await file.text();
    const parsedCsv = parseCsv(text);
    if (parsedCsv.headers.length === 0) {
      setError('That file has no readable header row.');
      return;
    }

    // Load valid categories so unknown ones are caught at validation time,
    // not by a foreign-key error mid-import.
    const { data } = await supabase.from('categories').select('slug');
    setCategorySlugs(new Set((data ?? []).map((c: { slug: string }) => c.slug)));

    setParsed(parsedCsv);
    setMapping(suggestMapping(parsedCsv.headers));
    setStage('map');
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const report: ValidationReport | null =
    parsed && stage !== 'pick' ? validateRows(parsed, mapping, categorySlugs.size > 0 ? categorySlugs : undefined) : null;

  async function handleImport() {
    if (!report) return;
    setStage('importing');
    setError(null);

    let imported = 0;
    // Valid rows import even if others fail (handbook §5), in batches of 500.
    for (const batch of chunk(report.valid, BATCH_SIZE)) {
      const { error: insertError } = await supabase.from('contacts').insert(batch);
      if (insertError) {
        setError(`Import stopped after ${imported} rows: ${insertError.message}`);
        setStage('map');
        return;
      }
      imported += batch.length;
    }

    setResult({ imported, failed: report.skipped });
    setStage('done');
  }

  function reset() {
    setStage('pick');
    setParsed(null);
    setMapping({});
    setResult(null);
    setError(null);
    setFileName('');
    if (fileInput.current) fileInput.current.value = '';
  }

  return (
    <div className="stack">
      <div>
        <h1>Bulk upload</h1>
        <p className="muted small">
          Upload a CSV, map its columns, review the first {PREVIEW_ROWS} rows, then import. Valid rows import even if
          others fail.
        </p>
      </div>

      {stage === 'pick' ? (
        <div className="card stack">
          <label
            htmlFor="csv"
            className={`dropzone${dragOver ? ' dragover' : ''}`}
            style={{ marginBottom: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <div className="pill-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M17 8l-5-5-5 5M12 3v12" />
              </svg>
            </div>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Drag & drop your CSV here</p>
            <p className="muted small">or click to browse</p>
            <input id="csv" ref={fileInput} type="file" accept=".csv,text/csv" onChange={onInputChange} />
          </label>
          {error ? <p className="error small">{error}</p> : null}
          <p className="muted small">
            Expected columns: {KNOWN_COLUMNS.join(', ')}. Anything else is reported as unmapped rather than silently
            dropped.
          </p>
        </div>
      ) : null}

      {stage !== 'pick' && parsed && report ? (
        <>
          <div className="card stack">
            <div className="row between">
              <h2>Map columns</h2>
              <button className="ghost small" onClick={reset}>Start over</button>
            </div>
            <p className="muted small">{fileName} · {parsed.rows.length} rows</p>

            <table>
              <thead>
                <tr>
                  <th>CSV column</th>
                  <th>Maps to</th>
                </tr>
              </thead>
              <tbody>
                {parsed.headers.map((header) => (
                  <tr key={header}>
                    <td>{header}</td>
                    <td>
                      <select
                        value={mapping[header] ?? ''}
                        onChange={(e) =>
                          setMapping({ ...mapping, [header]: (e.target.value || null) as KnownColumn | null })
                        }
                        disabled={stage === 'importing'}
                      >
                        <option value="">— ignore —</option>
                        {KNOWN_COLUMNS.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {report.unmappedColumns.length > 0 ? (
              <p className="muted small">
                Unmapped (will be ignored): {report.unmappedColumns.join(', ')}
              </p>
            ) : null}
          </div>

          <div className="card stack">
            <h2>Preview</h2>
            <p className="muted small">First {Math.min(PREVIEW_ROWS, parsed.rows.length)} rows as they'll be imported.</p>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    {KNOWN_COLUMNS.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, PREVIEW_ROWS).map((raw, i) => {
                    const cellFor = (target: KnownColumn) => {
                      const header = parsed.headers.find((h) => mapping[h] === target);
                      return header ? raw[header] : '';
                    };
                    return (
                      <tr key={i}>
                        <td className="muted">{i + 2}</td>
                        {KNOWN_COLUMNS.map((col) => (
                          <td key={col}>{cellFor(col) || <span className="muted">—</span>}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card stack">
            <h2>Validation</h2>
            <p>
              <strong className="success">{report.valid.length} rows ready</strong>
              {report.skipped.length > 0 ? (
                <>
                  {' · '}
                  <strong className="error">{report.skipped.length} will be skipped</strong>
                </>
              ) : null}
            </p>

            {report.skipped.length > 0 ? (
              <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Problem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.skipped.map((s) => (
                      <tr key={s.row}>
                        <td>{s.row}</td>
                        <td className="error">{s.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {error ? <p className="error small">{error}</p> : null}

            <div className="row">
              <button onClick={handleImport} disabled={stage === 'importing' || report.valid.length === 0}>
                {stage === 'importing' ? 'Importing…' : `Import ${report.valid.length} contacts`}
              </button>
              <button className="secondary" onClick={reset} disabled={stage === 'importing'}>Cancel</button>
            </div>
          </div>
        </>
      ) : null}

      {stage === 'done' && result ? (
        <div className="card stack">
          <div className="row" style={{ gap: '0.75rem' }}>
            <div className="pill-icon" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="success" style={{ margin: 0 }}>Imported {result.imported} contacts</h2>
          </div>
          {result.failed.length > 0 ? (
            <>
              <p className="muted small">{result.failed.length} rows were skipped:</p>
              <table>
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Problem</th>
                  </tr>
                </thead>
                <tbody>
                  {result.failed.map((s) => (
                    <tr key={s.row}>
                      <td>{s.row}</td>
                      <td className="error">{s.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="muted small">Every row imported cleanly.</p>
          )}
          <div className="row">
            <button onClick={reset}>Import another file</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
