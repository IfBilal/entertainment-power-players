import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { supabase } from '../lib/supabase';
import {
  KNOWN_COLUMNS,
  chunk,
  duplicateKey,
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

const STEPS: Array<{ key: Stage | 'validate'; label: string }> = [
  { key: 'pick', label: 'Upload' },
  { key: 'map', label: 'Map & preview' },
  { key: 'validate', label: 'Validate' },
  { key: 'importing', label: 'Import' },
  { key: 'done', label: 'Results' },
];

function stepIndex(stage: Stage): number {
  if (stage === 'pick') return 0;
  if (stage === 'map') return 2; // mapping + preview + validation render together on this stage
  if (stage === 'importing') return 3;
  return 4;
}

function ImportStepper({ stage }: { stage: Stage }) {
  const current = stepIndex(stage);
  return (
    <div className="stepper">
      {STEPS.map((step, i) => (
        <div key={step.key} className={`stepper-item${i === current ? ' active' : ''}${i < current ? ' done' : ''}`}>
          <span className="stepper-dot">{i < current ? '✓' : i + 1}</span>
          <span className="stepper-label">{step.label}</span>
          {i < STEPS.length - 1 ? <span className="stepper-line" /> : null}
        </div>
      ))}
    </div>
  );
}

type ImportResult = { imported: number; failed: ValidationReport['skipped'] };

export function ImportPage() {
  const [stage, setStage] = useState<Stage>('pick');
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [categorySlugs, setCategorySlugs] = useState<Set<string>>(new Set());
  const [existingKeys, setExistingKeys] = useState<Set<string>>(new Set());
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  // How many of this session's import rows are already written. A chunk
  // failure stops here rather than at zero, so "Resume" never re-sends rows
  // that already succeeded.
  const [importedOffset, setImportedOffset] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setFileName(file.name);
    // The gap between picking a file and reaching the mapping screen has a
    // real network call in it (loading categories below) -- without a
    // visible loading state here, the dropzone just sits there for a few
    // seconds looking like the file was never picked up at all.
    setProcessing(true);

    try {
      const text = await file.text();
      const parsedCsv = parseCsv(text);
      if (parsedCsv.headers.length === 0) {
        setError('That file has no readable header row.');
        return;
      }

      // Load valid categories so unknown ones are caught at validation time,
      // not by a foreign-key error mid-import. Also load existing contacts'
      // name+category so the duplicate report can compare against the real
      // directory, not just the file being uploaded.
      const [{ data: categories }, { data: existing }] = await Promise.all([
        supabase.from('categories').select('slug'),
        supabase.from('contacts').select('name_lower, category_slug'),
      ]);
      setCategorySlugs(new Set((categories ?? []).map((c: { slug: string }) => c.slug)));
      setExistingKeys(new Set((existing ?? []).map((c: { name_lower: string; category_slug: string }) => duplicateKey(c.name_lower, c.category_slug))));

      setImportedOffset(0);
      setParsed(parsedCsv);
      setMapping(suggestMapping(parsedCsv.headers));
      setStage('map');
    } finally {
      setProcessing(false);
    }
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
    parsed && stage !== 'pick'
      ? validateRows(parsed, mapping, categorySlugs.size > 0 ? categorySlugs : undefined, existingKeys)
      : null;
  const duplicateCount = report ? report.valid.filter((c) => c.isDuplicate).length : 0;
  // What would actually be sent, given the current skip-duplicates choice.
  // `handleImport` and the button label both read this so they never disagree.
  const toImport = report ? report.valid.filter((c) => !skipDuplicates || !c.isDuplicate) : [];

  async function handleImport() {
    if (!report) return;
    setStage('importing');
    setError(null);

    // Resume from where a previous attempt stopped, so a retry after a
    // partial failure never re-sends rows that already succeeded.
    const remaining = toImport.slice(importedOffset).map(({ row: _row, isDuplicate: _isDuplicate, duplicateReason: _duplicateReason, ...insertable }) => insertable);
    let justImported = 0;
    for (const batch of chunk(remaining, BATCH_SIZE)) {
      const { error: insertError } = await supabase.from('contacts').insert(batch);
      if (insertError) {
        setImportedOffset((offset) => offset + justImported);
        setError(`Import stopped after ${importedOffset + justImported} of ${toImport.length} rows: ${insertError.message}. Resuming will continue from there, not start over.`);
        setStage('map');
        return;
      }
      justImported += batch.length;
    }

    setResult({ imported: importedOffset + justImported, failed: report.skipped });
    setImportedOffset(0);
    setStage('done');
  }

  function reset() {
    setStage('pick');
    setParsed(null);
    setMapping({});
    setResult(null);
    setError(null);
    setFileName('');
    setImportedOffset(0);
    setSkipDuplicates(true);
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

      <ImportStepper stage={stage} />

      {stage === 'pick' ? (
        <div className="card stack">
          <label
            htmlFor="csv"
            className={`dropzone${dragOver ? ' dragover' : ''}`}
            style={{ marginBottom: 0, cursor: processing ? 'default' : 'pointer' }}
            onDragOver={(e) => {
              if (processing) return;
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={processing ? undefined : onDrop}
          >
            {processing ? (
              <>
                <div className="pill-icon spin">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-9-9" />
                  </svg>
                </div>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Reading {fileName}…</p>
                <p className="muted small">Checking columns against your categories</p>
              </>
            ) : (
              <>
                <div className="pill-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                </div>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Drag & drop your CSV here</p>
                <p className="muted small">or click to browse</p>
              </>
            )}
            <input id="csv" ref={fileInput} type="file" accept=".csv,text/csv" onChange={onInputChange} disabled={processing} />
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
            <p className="muted small">{fileName} · {report ? report.valid.length + report.skipped.length : parsed.rows.length} rows</p>

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
              <strong className="success">{toImport.length} row{toImport.length === 1 ? '' : 's'} ready to import</strong>
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

            {duplicateCount > 0 ? (
              <div className="stack" style={{ gap: '0.5rem' }}>
                <p>
                  <strong className="error">{duplicateCount} probable duplicate{duplicateCount === 1 ? '' : 's'}</strong>
                  {' '}-- same name and category as another row in this file or a contact already in the directory.
                </p>
                <label className="row small" style={{ gap: '0.4rem' }}>
                  <input type="checkbox" checked={skipDuplicates} onChange={(e) => setSkipDuplicates(e.target.checked)} />
                  Skip probable duplicates (recommended)
                </label>
                <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Row</th>
                        <th>Name</th>
                        <th>Why it's probably a duplicate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.valid.filter((c) => c.isDuplicate).map((c) => (
                        <tr key={c.row}>
                          <td>{c.row}</td>
                          <td>{c.name}</td>
                          <td className="muted small">{c.duplicateReason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {error ? <p className="error small">{error}</p> : null}

            <div className="row">
              <button onClick={handleImport} disabled={stage === 'importing' || toImport.length === 0 || importedOffset >= toImport.length}>
                {stage === 'importing'
                  ? 'Importing…'
                  : importedOffset > 0
                    ? `Resume import (${toImport.length - importedOffset} left)`
                    : `Import ${toImport.length} contact${toImport.length === 1 ? '' : 's'}`}
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
