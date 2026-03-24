type ServiceAccountJson = {
  client_email?: string;
  private_key?: string;
  project_id?: string;
};

export function getSpreadsheetId(): string {
  const value =
    process.env.GOOGLE_SHEETS_ID?.trim() || process.env.GOOGLE_SPREADSHEET_ID?.trim();
  if (!value) {
    throw new Error("Missing GOOGLE_SHEETS_ID");
  }
  return value;
}

export function getSchoolsSheetName(): string {
  return process.env.GOOGLE_SCHOOLS_SHEET_NAME?.trim() || "Schools";
}

export function getClassesSheetName(): string {
  return process.env.GOOGLE_CLASSES_SHEET_NAME?.trim() || "Classes";
}

export function getServiceAccountJson(): ServiceAccountJson {
  const saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const saPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    ?.replace(/\\n/g, "\n")
    .trim();
  if (saEmail && saPrivateKey) {
    return { client_email: saEmail, private_key: saPrivateKey };
  }

  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (inline) {
    return parseServiceAccount(inline);
  }
  throw new Error(
    "Missing service account env vars. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.",
  );
}

function parseServiceAccount(raw: string): ServiceAccountJson {
  try {
    return JSON.parse(raw) as ServiceAccountJson;
  } catch {
    throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON");
  }
}
