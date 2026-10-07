/**
 * Questions CSV import: parse, validate and diff against stored rows.
 *
 * Nothing here writes to the database. The admin page shows the report and
 * diff first, then sends only the create/update rows.
 */

export const QUESTION_HEADERS = ['category', 'challenge_group', 'number', 'question', 'answer', 'why', 'power_move'] as const;
export const PUBLISH_TARGET = 125;
const MAX_FIELD_LENGTH = 2000;

export type ParseError = { record: number; line: number; message: string };
export type ParsedCsv = { rows: string[][]; lines: number[]; errors: ParseError[] };

/**
 * RFC 4180 parser. Handles a UTF-8 BOM, CRLF or LF, quoted commas, quoted
 * newlines and doubled quotes. `rows[i]` is record i (0 is the header) and
 * `lines[i]` is the physical line where that record starts.
 */
export function parseCsv(text: string): ParsedCsv {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  const lines: number[] = [];
  const errors: ParseError[] = [];

  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  let quoteStartLine = 0;
  let line = 1;
  let recordLine = 1;

  const endField = () => {
    row.push(field);
    field = '';
  };
  const endRow = () => {
    endField();
    if (!(row.length === 1 && row[0] === '')) {
      rows.push(row);
      lines.push(recordLine);
    }
    row = [];
  };

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        if (ch === '\n') line++;
        field += ch;
      }
      continue;
    }
    if (ch === '"' && field === '') {
      inQuotes = true;
      quoteStartLine = line;
    } else if (ch === ',') {
      endField();
    } else if (ch === '\r') {
      // handled with the following \n
    } else if (ch === '\n') {
      endRow();
      line++;
      recordLine = line;
    } else {
      field += ch;
    }
  }

  if (inQuotes) {
    errors.push({ record: rows.length, line: quoteStartLine, message: 'Unclosed quote: the field never ends before the file does' });
  } else if (field !== '' || row.length > 0) {
    endRow();
  }

  return { rows, lines, errors };
}

export type QuestionInput = {
  category_slug: string;
  challenge_group: string;
  number: number;
  question: string;
  answer: string;
  why: string;
  power_move: string;
};

export type ValidationReport = {
  valid: QuestionInput[];
  errors: string[];
  distinctValid: number;
  meetsTarget: boolean;
  categoryTotals: Record<string, number>;
};

/**
 * Validates the parsed file against the template headers and the configured
 * categories. `categories` maps display name or slug (any case) to slug.
 */
export function validateQuestionsCsv(text: string, categories: Map<string, string>): ValidationReport {
  const parsed = parseCsv(text);
  const errors: string[] = parsed.errors.map((e) => `Line ${e.line}: ${e.message}`);
  const valid: QuestionInput[] = [];
  const seen = new Map<string, number>();

  if (parsed.rows.length === 0) {
    errors.push('The file is empty.');
    return { valid, errors, distinctValid: 0, meetsTarget: false, categoryTotals: {} };
  }

  const header = parsed.rows[0].map((h) => h.trim());
  const headerCounts = new Map<string, number>();
  header.forEach((h) => headerCounts.set(h, (headerCounts.get(h) ?? 0) + 1));
  for (const required of QUESTION_HEADERS) {
    if (!headerCounts.has(required)) errors.push(`Missing column: ${required}`);
  }
  for (const [name, count] of headerCounts) {
    if (count > 1) errors.push(`Duplicate column: ${name}`);
    if (!(QUESTION_HEADERS as readonly string[]).includes(name)) errors.push(`Unmapped column: ${name}`);
  }
  if (errors.length > 0) {
    return { valid, errors, distinctValid: 0, meetsTarget: false, categoryTotals: {} };
  }

  const col = (name: string) => header.indexOf(name);
  const categoryTotals: Record<string, number> = {};

  for (let r = 1; r < parsed.rows.length; r++) {
    const cells = parsed.rows[r];
    const where = `Row ${r} (line ${parsed.lines[r]})`;
    const get = (name: (typeof QUESTION_HEADERS)[number]) => (cells[col(name)] ?? '').trim();
    const before = errors.length;

    const categoryRaw = get('category');
    const slug = categories.get(categoryRaw.toLowerCase());
    if (!categoryRaw) errors.push(`${where}: category is empty`);
    else if (!slug) errors.push(`${where}: category "${categoryRaw}" is not configured`);

    const group = get('challenge_group').replace(/\s+/g, ' ');
    if (!group) errors.push(`${where}: challenge_group is empty`);

    const numberRaw = get('number');
    const number = Number(numberRaw);
    if (!/^\d+$/.test(numberRaw) || number < 1) errors.push(`${where}: number "${numberRaw}" must be a positive whole number`);

    const fields = { question: get('question'), answer: get('answer'), why: get('why'), power_move: get('power_move') };
    for (const [name, value] of Object.entries(fields)) {
      if (!value) errors.push(`${where}: ${name} is empty`);
      else if (value.length > MAX_FIELD_LENGTH) errors.push(`${where}: ${name} is longer than ${MAX_FIELD_LENGTH} characters`);
    }

    if (errors.length > before) continue;

    const key = `${slug}|${group.toLowerCase()}|${number}`;
    const firstRow = seen.get(key);
    if (firstRow !== undefined) {
      errors.push(`${where}: duplicates row ${firstRow} (${categoryRaw} / ${group} / ${number})`);
      continue;
    }
    seen.set(key, r);

    valid.push({ category_slug: slug!, challenge_group: group, number, ...fields });
    categoryTotals[slug!] = (categoryTotals[slug!] ?? 0) + 1;
  }

  const distinctValid = valid.length;
  if (distinctValid !== PUBLISH_TARGET) {
    errors.push(`${distinctValid} distinct valid rows; ${PUBLISH_TARGET} required for publication`);
  }

  return { valid, errors, distinctValid, meetsTarget: distinctValid === PUBLISH_TARGET, categoryTotals };
}

export type StoredQuestion = QuestionInput & { id: string };
export type ImportDiff = {
  create: QuestionInput[];
  update: (QuestionInput & { id: string })[];
  unchanged: number;
};

/** Matches incoming rows to stored rows by natural key and skips identical content. */
export function diffQuestions(incoming: QuestionInput[], stored: StoredQuestion[]): ImportDiff {
  const key = (q: QuestionInput) => `${q.category_slug}|${q.challenge_group.toLowerCase()}|${q.number}`;
  const byKey = new Map(stored.map((s) => [key(s), s]));
  const create: QuestionInput[] = [];
  const update: (QuestionInput & { id: string })[] = [];
  let unchanged = 0;

  for (const q of incoming) {
    const match = byKey.get(key(q));
    if (!match) {
      create.push(q);
      continue;
    }
    const same = match.challenge_group === q.challenge_group && match.question === q.question && match.answer === q.answer && match.why === q.why && match.power_move === q.power_move;
    if (same) unchanged++;
    else update.push({ ...q, id: match.id });
  }
  return { create, update, unchanged };
}
