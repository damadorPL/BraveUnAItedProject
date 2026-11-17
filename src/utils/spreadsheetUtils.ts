/**
 * Shared spreadsheet reading utilities backed by `read-excel-file` (.xlsx)
 * and a lightweight RFC-4180 CSV parser (.csv).
 */

function detectCsvDelimiter(text: string): string {
  let inQuotes = false;
  let commaCount = 0;
  let semicolonCount = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      break;
    }
    if (!inQuotes) {
      if (ch === ";") semicolonCount++;
      else if (ch === ",") commaCount++;
    }
  }

  return semicolonCount > commaCount ? ";" : ",";
}

/**
 * Parses CSV text (auto-detecting `,` or `;` delimiter and stripping UTF-8 BOM)
 * into a 2D array of string cells.
 */
export function parseCsvRows(rawText: string): string[][] {
  const text = rawText.replace(/^\uFEFF/, "");
  if (!text.trim()) return [];

  const delimiter = detectCsvDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\r" || ch === "\n") {
      if (ch === "\r" && text[i + 1] === "\n") {
        i++;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  // Drop trailing empty row caused by a final newline
  if (rows.length > 0 && rows[rows.length - 1].every((c) => c === "")) {
    rows.pop();
  }

  return rows;
}

async function readInputAsText(input: ArrayBuffer | Blob | File): Promise<string> {
  if (input instanceof ArrayBuffer) {
    return new TextDecoder("utf-8").decode(input);
  }
  return input.text();
}

/**
 * Reads the first sheet of an `.xlsx` or `.csv` spreadsheet into a 2D array,
 * normalizing `null`/`undefined` cells to `""`.
 */
export async function readSpreadsheetRows(
  input: ArrayBuffer | Blob | File,
  fileName?: string
): Promise<unknown[][]> {
  const name = (fileName ?? (input instanceof File ? input.name : "")).toLowerCase();

  if (name.endsWith(".xls")) {
    throw new Error("Starszy format .xls nie jest obsługiwany. Zapisz plik jako .xlsx lub .csv.");
  }

  if (name.endsWith(".csv")) {
    const text = await readInputAsText(input);
    return parseCsvRows(text);
  }

  const { readSheet } = await import("read-excel-file/browser");
  const rows = await readSheet(input);
  return rows.map((row) => row.map((cell) => (cell == null ? "" : cell)));
}
