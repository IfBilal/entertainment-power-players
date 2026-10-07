import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  diffQuestions,
  PUBLISH_TARGET,
  QUESTION_HEADERS,
  validateQuestionsCsv,
  type ImportDiff,
  type QuestionInput,
  type StoredQuestion,
  type ValidationReport,
} from '../lib/questionsCsv';

const CHUNK = 100;
const COUNT_MESSAGE = `required for publication`;

type Category = { slug: string; name: string };
type ImportResult = { created: number; updated: number; failed: string[] };

export function QuestionsImportPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [diff, setDiff] = useState<ImportDiff | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReferenceData()
      .then((ref) => {
        setCategories(ref.categories);
        })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load data'));
    // loadReferenceData is stable for this page's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadReferenceData() {
    const [cats, qs] = await Promise.all([
      supabase.from('categories').select('slug, name'),
      supabase.from('questions').select('id, category_slug, challenge_group, number, question, answer, why, power_move'),
    ]);
    if (cats.error || qs.error) throw new Error(cats.error?.message ?? qs.error?.message ?? 'Could not load data');
    return { categories: (cats.data ?? []) as Category[], stored: (qs.data ?? []) as StoredQuestion[] };
  }

  async function handleFile(file: File) {
    setResult(null);
    setError(null);
    setFileName(file.name);
    try {
      // Read fresh data at selection time, so a file chosen early never validates against an empty list.
      const [text, ref] = await Promise.all([file.text(), loadReferenceData()]);
      const map = new Map<string, string>();
      for (const c of ref.categories) {
        map.set(c.slug.toLowerCase(), c.slug);
        map.set(c.name.toLowerCase(), c.slug);
      }
      setCategories(ref.categories);
      const next = validateQuestionsCsv(text, map);
      setReport(next);
      setDiff(next.valid.length ? diffQuestions(next.valid, ref.stored) : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read the file');
    }
  }

  // Count shortfall is a publication gate, not a reason to refuse a dev import.
  const blocking = report?.errors.filter((e) => !e.endsWith(COUNT_MESSAGE)) ?? [];
  const canImport = !!report && !!diff && blocking.length === 0 && (diff.create.length + diff.update.length) > 0 && !importing;

  async function runImport() {
    if (!diff) return;
    setImporting(true);
    setError(null);
    const out: ImportResult = { created: 0, updated: 0, failed: [] };

    for (let i = 0; i < diff.create.length; i += CHUNK) {
      const chunk: QuestionInput[] = diff.create.slice(i, i + CHUNK);
      const { error: insertError } = await supabase.from('questions').insert(chunk);
      if (insertError) out.failed.push(`Create rows ${i + 1}-${i + chunk.length}: ${insertError.message}`);
      else out.created += chunk.length;
    }

    for (let i = 0; i < diff.update.length; i += CHUNK) {
      const chunk = diff.update.slice(i, i + CHUNK);
      const outcomes = await Promise.all(
        chunk.map(async ({ id, ...fields }) => {
          const { error: updateError } = await supabase.from('questions').update(fields).eq('id', id);
          return updateError ? `${fields.category_slug} / ${fields.challenge_group} / ${fields.number}: ${updateError.message}` : null;
        }),
      );
      for (const failure of outcomes) if (failure) out.failed.push(failure);
      out.updated += chunk.length - outcomes.filter(Boolean).length;
    }

    setResult(out);
    setImporting(false);
  }

  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <div className="stack">
      <div>
        <h1>Questions import</h1>
        <p className="muted small">
          Template columns: {QUESTION_HEADERS.join(', ')}. Re-importing the same file changes nothing. Member progress is kept, because
          rows are matched by category, group and number.
        </p>
      </div>

      <div className="card stack">
        <label htmlFor="questions-csv">CSV file</label>
        <input
          id="questions-csv"
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
            <strong>{report.distinctValid}</strong> valid rows of {PUBLISH_TARGET} required for publication.
          </p>
          {Object.keys(report.categoryTotals).length ? (
            <ul>
              {Object.entries(report.categoryTotals).map(([slug, n]) => (
                <li key={slug}>
                  {categoryName(slug)}: {n}
                </li>
              ))}
            </ul>
          ) : null}
          {report.errors.length ? (
            <div>
              <p className="error small">{report.errors.length} issue(s):</p>
              <ul className="small">
                {report.errors.map((e, i) => (
                  <li key={i} className={e.endsWith(COUNT_MESSAGE) ? 'muted' : 'error'}>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="small">No issues.</p>
          )}

          {diff ? (
            <p className="small">
              Will create {diff.create.length}, update {diff.update.length}, unchanged {diff.unchanged}.
            </p>
          ) : null}

          {report.valid.length ? (
            <div>
              <h3>First rows</h3>
              <ol className="small">
                {report.valid.slice(0, 10).map((q, i) => (
                  <li key={i}>
                    {categoryName(q.category_slug)} / {q.challenge_group} / {q.number}: {q.question}
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
            Created {result.created}, updated {result.updated}, failed {result.failed.length}.
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
