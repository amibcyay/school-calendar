function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toIso(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) {
    return null;
  }
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function normalizeDdMm(
  input: string,
  now = new Date(),
): string | null {
  const text = input.trim();
  if (!text) return null;

  const fullMatch = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (fullMatch) {
    const day = Number(fullMatch[1]);
    const month = Number(fullMatch[2]);
    const yRaw = Number(fullMatch[3]);
    const year = yRaw < 100 ? 2000 + yRaw : yRaw;
    return toIso(year, month, day);
  }

  const shortMatch = text.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
  if (!shortMatch) return null;

  const day = Number(shortMatch[1]);
  const month = Number(shortMatch[2]);
  let year = now.getFullYear();
  // Requested business rule:
  // if current month is April and parsed month is March, assume next year.
  if (now.getMonth() + 1 === 4 && month === 3) {
    year = year + 1;
  }
  return toIso(year, month, day);
}

export function extractDatesFromText(raw: string, now = new Date()): string[] {
  const matches = raw.match(/\b\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?\b/g) || [];
  const set = new Set<string>();
  for (const m of matches) {
    const iso = normalizeDdMm(m, now);
    if (iso) set.add(iso);
  }
  return [...set].sort();
}
