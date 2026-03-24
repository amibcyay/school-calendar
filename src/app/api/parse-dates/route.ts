import { NextRequest, NextResponse } from "next/server";
import { extractDatesFromImageGemini } from "@/lib/geminiVision";
import { extractDatesFromText } from "@/lib/dateNormalization";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("image");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Missing image field" }, { status: 400 });
      }
      if (!ALLOWED.has(file.type)) {
        return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      if (buffer.length > MAX_BYTES) {
        return NextResponse.json({ error: "Image too large (max 5MB)" }, { status: 400 });
      }
      const result = await extractDatesFromImageGemini(buffer, file.type);
      return NextResponse.json(result);
    }

    const body = (await request.json()) as { text?: string };
    const text = body.text?.trim() || "";
    const dates = extractDatesFromText(text);
    return NextResponse.json({ rawText: text, dates });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse dates";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
