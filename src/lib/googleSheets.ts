import { google } from "googleapis";
import { createSheetsJwt } from "./googleAuth";
import { getClassesSheetName, getSchoolsSheetName, getSpreadsheetId } from "./env";

export type SchoolEntry = {
  name: string;
  location: string;
  time: string;
  instructor: string;
};

export async function getSchools(): Promise<SchoolEntry[]> {
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
  const col = (key: string) => header.indexOf(key);
  const nameIdx = col("name");
  if (nameIdx < 0) {
    throw new Error(`Could not find "Name" column in ${sheetName}`);
  }
  const locationIdx = col("location");
  const timeIdx = col("time");
  const instructorIdx = col("instructor");

  const seen = new Set<string>();
  const entries: SchoolEntry[] = [];

  for (const row of rows.slice(1)) {
    const name = String(row[nameIdx] || "").trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    entries.push({
      name,
      location: locationIdx >= 0 ? String(row[locationIdx] || "").trim() : "",
      time: timeIdx >= 0 ? String(row[timeIdx] || "").trim() : "",
      instructor: instructorIdx >= 0 ? String(row[instructorIdx] || "").trim() : "",
    });
  }

  return entries;
}

export async function getSchoolNames(): Promise<string[]> {
  const schools = await getSchools();
  return schools.map((s) => s.name);
}

export type ClassEntry = {
  schoolName: string;
  date: string;
  location: string;
  time: string;
  instructor: string;
};

export async function getClassesEntries(): Promise<ClassEntry[]> {
  const auth = createSheetsJwt();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = getSpreadsheetId();
  const classesSheet = getClassesSheetName();

  const [classResp, schoolList] = await Promise.all([
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${classesSheet}!A:B`,
    }),
    getSchools(),
  ]);

  const schoolMap = new Map(schoolList.map((s) => [s.name.toLowerCase(), s]));

  const rows = classResp.data.values || [];
  if (rows.length === 0) return [];

  const first = rows[0].map((v) => String(v).trim().toLowerCase());
  const hasHeader =
    first.includes("schoolname") || first.includes("name") || first.includes("date");
  const dataRows = hasHeader ? rows.slice(1) : rows;

  const entries: ClassEntry[] = [];
  for (const row of dataRows) {
    const schoolName = String(row[0] || "").trim();
    const date = String(row[1] || "").trim();
    if (!schoolName || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

    const school = schoolMap.get(schoolName.toLowerCase());
    entries.push({
      schoolName,
      date,
      location: school?.location ?? "",
      time: school?.time ?? "",
      instructor: school?.instructor ?? "",
    });
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
