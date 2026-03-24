# School calendar

Next.js app: month calendar, Google Sheets (schools + classes), and **Gemini multimodal AI text recognition** for reading dates from photos (no traditional OCR library).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_SHEETS_ID` | Yes | Spreadsheet ID from the URL |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Yes | Service account client email |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Yes | Service account private key (preserve newlines) |
| `GEMINI_API_KEY` | Yes (for uploads) | From [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | No | Default: `gemini-1.5-flash` |
| `GOOGLE_SCHOOLS_SHEET_NAME` | No | Default: `Schools` |
| `GOOGLE_CLASSES_SHEET_NAME` | No | Default: `Classes` |

Enable **Google Sheets API** for the service account project. Dates are read with Gemini multimodal parsing only.

## Local development

```bash
npm install
cp .env.example .env
# Set GOOGLE_SPREADSHEET_ID, credentials, and GEMINI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push the repo to GitHub/GitLab/Bitbucket.
2. Import on Vercel; set **Root Directory** to `school-calendar` if the app is in that subfolder.
3. **Environment variables:** `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `GEMINI_API_KEY`.
4. Share the spreadsheet with the service account email (Editor).
5. Deploy.

### Troubleshooting

- **Build fails:** Run `npm run build` locally first.
- **`unrs-resolver` / `napi-postinstall` / `libatomic` on Vercel:** This project does **not** ship ESLint in `package.json` (those packages came from `eslint-config-next` → `eslint-import-resolver-typescript` → `unrs-resolver`). Use **Node.js 20.x** on Vercel (Project → Settings → General). Re-add ESLint locally only if you need `npm run lint` and accept the heavier install.
- **API errors:** Check Vercel function logs; verify env vars and sheet sharing.
- **Gemini errors:** Confirm `GEMINI_API_KEY` and that the AI Studio key allows Generative Language API usage.

If your repo still contains `eslint.config.mjs` from an older setup, delete it after removing ESLint deps, or restore full ESLint and use `overrides` / newer lockfile at your own risk.
