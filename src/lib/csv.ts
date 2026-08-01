/** Minimal RFC-4180-ish CSV parsing and serialisation used by the dataset importer. */

export type CsvRow = Record<string, string>;

/** Parse CSV text into header + row objects. Handles quotes, escaped quotes and CRLF. */
export const parseCsv = (text: string): { headers: string[]; rows: CsvRow[] } => {
  const src = text.replace(/^\uFEFF/, '');
  const matrix: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((c) => c.trim() !== '')) matrix.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((c) => c.trim() !== '')) matrix.push(row);

  if (!matrix.length) return { headers: [], rows: [] };
  const headers = matrix[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const rows = matrix.slice(1).map((cells) => {
    const obj: CsvRow = {};
    headers.forEach((h, i) => {
      obj[h] = (cells[i] ?? '').trim();
    });
    return obj;
  });
  return { headers, rows };
};

const escapeCell = (value: unknown) => {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCsv = (headers: string[], rows: (string | number)[][]): string =>
  [headers, ...rows].map((r) => r.map(escapeCell).join(',')).join('\r\n');

export const downloadBlob = (filename: string, mime: string, content: BlobPart) => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export const num = (v: string | undefined, fallback = 0) => {
  const n = Number(String(v ?? '').replace(/[, ]/g, ''));
  return Number.isFinite(n) ? n : fallback;
};
