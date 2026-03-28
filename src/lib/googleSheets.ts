import { google } from "googleapis";
import { createSheetsJwt } from "./googleAuth";
import { getClassesSheetName, getSchoolsSheetName, getSpreadsheetId } from "./env";

export async function getSchoolNames(): Promise<string[]> {
  const auth = createSheetsJwt();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = getSpreadsheetId();
  const sheetName = getSchoolsSheetName();

  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  });
  const rows = resp.data.values || [];
  if (rows.length === 0) return [];

  const header = rows[0].map((v) => String(v).trim().toLowerCase());
  const nameIndex = header.indexOf("name");
  if (nameIndex < 0) {
    throw new Error(`Could not find "Name" column in ${sheetName}`);
  }

  const names = rows
    .slice(1)
    .map((row) => String(row[nameIndex] || "").trim())
    .filter(Boolean);

  return [...new Set(names)];
}

export type ClassEntry = { schoolName: string; date: string };

export async function getClassesEntries(): Promise<ClassEntry[]> {
  const auth = createSheetsJwt();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = getSpreadsheetId();
  const classesSheet = getClassesSheetName();

  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${classesSheet}!A:B`,
  });
  const rows = resp.data.values || [];
  if (rows.length === 0) return [];

  const first = rows[0].map((v) => String(v).trim().toLowerCase());
  const hasHeader = first.includes("schoolname") || first.includes("name") || first.includes("date");
  const dataRows = hasHeader ? rows.slice(1) : rows;

  const entries: ClassEntry[] = [];
  for (const row of dataRows) {
    const schoolName = String(row[0] || "").trim();
    const date = String(row[1] || "").trim();
    if (schoolName && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      entries.push({ schoolName, date });
    }
  }
  return entries;
}

export async function appendClassesRows(schoolName: string, dates: string[]): Promise<number> {
  if (!schoolName.trim() || dates.length === 0) return 0;

  const auth = createSheetsJwt();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = getSpreadsheetId();
  const classesSheet = getClassesSheetName();

  const values = dates.map((d) => [schoolName.trim(), d]);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${classesSheet}!A:B`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });

  return values.length;
}
