import { NextResponse } from "next/server";
import { getSchoolNames } from "@/lib/googleSheets";

export const runtime = "nodejs";

export async function GET() {
  try {
    const schools = await getSchoolNames();
    return NextResponse.json({ schools });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch schools";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
