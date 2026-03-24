import { JWT } from "google-auth-library";
import { getServiceAccountJson } from "./env";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

export function createSheetsJwt(): JWT {
  const creds = getServiceAccountJson();
  const email = creds.client_email as string;
  const key = creds.private_key as string;
  if (!email || !key) {
    throw new Error("Service account JSON must include client_email and private_key");
  }
  return new JWT({
    email,
    key,
    scopes: [SHEETS_SCOPE],
  });
}
