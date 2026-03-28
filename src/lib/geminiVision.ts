import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractDatesFromText } from "./dateNormalization";

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Missing GEMINI_API_KEY. Create a key in Google AI Studio and add it to your environment.",
    );
  }
  return key;
}

function stripJsonFence(s: string): string {
  const t = s.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(t);
  if (fence) return fence[1].trim();
  return t;
}

/**
 * Reads an image with Gemini and returns calendar dates as YYYY-MM-DD strings.
 */
export async function extractDatesFromImageGemini(
  buffer: Buffer,
  mimeType: string,
): Promise<{ rawText: string; dates: string[] }> {
  const genAI = new GoogleGenerativeAI(getApiKey());
  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  const year = new Date().getFullYear();
  const prompt = `You are reading a photo that may contain handwritten or printed dates (schedule, list of days, etc.).

Extract every calendar date you can identify from this image. Prefer day/month input style.
If only day/month appears, use year ${year} unless the image clearly shows another year.

Respond with ONLY valid JSON (no markdown, no explanation) in this exact shape:
{"dates":["YYYY-MM-DD",...]}

If you cannot find any dates, respond: {"dates":[]}
Use ISO date strings only. Do not invent dates you cannot read.
Do not use OCR tools. Use your own multimodal image understanding.`;

  const imagePart = {
    inlineData: {
      mimeType: mimeType || "image/jpeg",
      data: buffer.toString("base64"),
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text().trim();
  const rawText = text;

  let dates: string[] = [];
  try {
    const jsonStr = stripJsonFence(text);
    const parsed = JSON.parse(jsonStr) as { dates?: unknown };
    if (Array.isArray(parsed.dates)) {
      dates = parsed.dates
        .filter((d): d is string => typeof d === "string")
        .map((d) => d.trim())
        .filter(Boolean);
    }
  } catch {
    dates = extractDatesFromText(text);
  }

  const extra = extractDatesFromText(rawText);
  const merged = new Set<string>([...dates, ...extra]);
  const sorted = [...merged].sort();

  return { rawText, dates: sorted };
}
