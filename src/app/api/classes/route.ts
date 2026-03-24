import { NextRequest, NextResponse } from "next/server";
import { appendClassesRows } from "@/lib/googleSheets";
import { normalizeDdMm } from "@/lib/dateNormalization";

export const runtime = "nodejs";

type Payload = {
  schoolName?: string;
  dates?: string[];
};

function normalizeIncomingDate(value: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return normalizeDdMm(value);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Payload;
    const schoolName = body.schoolName?.trim() || "";
    if (!schoolName) {
      return NextResponse.json({ error: "schoolName is required" }, { status: 400 });
    }

    const rawDates = Array.isArray(body.dates) ? body.dates : [];
    const normalized = rawDates
      .map((d) => normalizeIncomingDate(String(d).trim()))
      .filter((d): d is string => Boolean(d));
    const dates = [...new Set(normalized)].sort();

    if (dates.length === 0) {
      return NextResponse.json({ error: "No valid dates to save" }, { status: 400 });
    }

    const saved = await appendClassesRows(schoolName, dates);
    return NextResponse.json({ saved, dates });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save classes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
