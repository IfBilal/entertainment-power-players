import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { diffQuotes, PUBLISH_TARGET, QUOTE_HEADERS, validateQuotesCsv, type QuoteDiff, type QuoteInput, type QuoteValidationReport } from '../lib/quotesCsv';

const CHUNK = 100;

type Category = { slug: string; name: string };
type ImportResult = { created: number; failed: string[] };

export function QuotesImportPage() {
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [report, setReport] = useState<QuoteValidationReport | null>(null);
  const [diff, setDiff] = useState<QuoteDiff | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadReferenceData() {
    const [cats, quotes, active] = await Promise.all([
      supabase.from('categories').select('slug, name'),
      supabase.from('quotes').select('content_fingerprint'),
      supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('active', true),
    ]);
    if (cats.error || quotes.error || active.error) throw new Error(cats.error?.message ?? quotes.error?.message ?? active.error?.message ?? 'Could not load data');
    return {
      categories: (cats.data ?? []) as Category[],
      fingerprints: new Set((quotes.data ?? []).map((row) => row.content_fingerprint as string)),
      activeCount: active.count ?? 0,
    };
  }

  useEffect(() => {
    loadReferenceData()
      .then((ref) => setActiveCount(ref.activeCount))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load data'));
  }, []);

  async function handleFile(file: File) {
    setResult(null);
    setError(null);
    setFileName(file.name);
    try {
      const [text, ref] = await Promise.all([file.text(), loadReferenceData()]);
      const map = new Map<string, string>();
      for (const c of ref.categories) map.set(c.name.toLowerCase(), c.slug);
      setActiveCount(ref.activeCount);
      const next = validateQuotesCsv(text, map);
      setReport(next);
      setDiff(next.valid.length ? diffQuotes(next.valid, ref.fingerprints) : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read the file');
    }
  }

  const blocking = report?.errors ?? [];
  const canImport = !!report && !!diff && blocking.length === 0 && diff.create.length > 0 && !importing;

  async function runImport() {
    if (!diff) return;
    setImporting(true);
    setError(null);
    const out: ImportResult = { created: 0, failed: [] };
    const stamp = Date.now();

    for (let i = 0; i < diff.create.length; i += CHUNK) {
      const chunk = diff.create.slice(i, i + CHUNK).map((q: QuoteInput, j: number) => ({
        id: `quote_${stamp}_${i + j}`,
        text: q.text,
        author: q.author,
        order: q.order ?? 1000 + i + j,
        active: true,
        category_slug: q.categorySlug,
        source: q.source,
      }));
      const { error: insertError } = await supabase.from('quotes').insert(chunk);
      if (insertError) out.failed.push(`Rows ${i + 1}-${i + chunk.length}: ${insertError.message}`);
      else out.created += chunk.length;
    }

    const refreshed = await loadReferenceData();
    setActiveCount(refreshed.activeCount);
    setResult(out);
    setImporting(false);
  }

  return (
    <div className="stack">
      <div>
        <h1>Quotes import</h1>
        <p className="muted small">
          Template columns: {QUOTE_HEADERS.join(', ')}. Text and author are required; order, category and source are
          optional. A quote already stored with the same text and author is skipped, not duplicated. To edit an
          existing quote's wording, use the <Link to="/quotes">Quotes</Link> page directly -- that keeps its saved
          links and favourites attached.
        </p>
        {activeCount !== null ? (
          <p className="small">
            <strong>{activeCount}</strong> active quote{activeCount === 1 ? '' : 's'} of {PUBLISH_TARGET} needed to launch.
          </p>
        ) : null}
      </div>

      <div className="card stack">
        <label htmlFor="quotes-csv">CSV file</label>
        <input
          id="quotes-csv"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {fileName ? <p className="muted small">{fileName}</p> : null}
        {error ? <p className="error small">{error}</p> : null}
      </div>

      {report ? (
        <div className="card stack">
          <h2>Validation</h2>
          <p>
            <strong>{report.distinctValid}</strong> valid row{report.distinctValid === 1 ? '' : 's'} in this file.
          </p>
          {report.errors.length ? (
            <div>
              <p className="error small">{report.errors.length} issue(s):</p>
              <ul className="small">
                {report.errors.map((e, i) => (
                  <li key={i} className="error">{e}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="small">No issues.</p>
          )}

          {diff ? (
            <p className="small">
              Will create {diff.create.length}, skip {diff.duplicate.length} already stored.
            </p>
          ) : null}

          {report.valid.length ? (
            <div>
              <h3>First rows</h3>
              <ol className="small">
                {report.valid.slice(0, 10).map((q, i) => (
                  <li key={i}>
                    "{q.text}" — {q.author}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <div>
            <button onClick={runImport} disabled={!canImport}>
              {importing ? 'Importing…' : 'Import'}
            </button>
            {blocking.length ? <p className="muted small">Fix the issues above before importing.</p> : null}
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="card stack">
          <h2>Result</h2>
          <p>
            Created {result.created}, failed {result.failed.length}.
          </p>
          {result.failed.length ? (
            <ul className="small error">
              {result.failed.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
