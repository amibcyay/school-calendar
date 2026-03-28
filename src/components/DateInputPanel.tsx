"use client";

import { useState } from "react";
import { normalizeDdMm } from "@/lib/dateNormalization";

type Props = {
  selectedSchool: string;
  onDatesSaved: (dates: string[]) => void;
};

export function DateInputPanel({ selectedSchool, onDatesSaved }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [manualText, setManualText] = useState("");
  const [pickedDates, setPickedDates] = useState<string[]>([]);
  const [parsedDates, setParsedDates] = useState<string[]>([]);

  async function parseImage(file: File | null) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("image", file);
      const res = await fetch("/api/parse-dates", { method: "POST", body: fd });
      const data = (await res.json()) as { dates?: string[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to parse image");
      setParsedDates(data.dates || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse image");
    } finally {
      setBusy(false);
    }
  }

  async function parseManualText() {
    setError("");
    setBusy(true);
    try {
      const lines = manualText
        .split(/\r?\n/)
        .map((v) => v.trim())
        .filter(Boolean);
      const normalized = lines.map((l) => normalizeDdMm(l)).filter((d): d is string => Boolean(d));
      const merged = [...new Set([...parsedDates, ...normalized])].sort();
      setParsedDates(merged);
    } finally {
      setBusy(false);
    }
  }

  function addPickedDate(value: string) {
    if (!value) return;
    setPickedDates((prev) => {
      if (prev.includes(value)) return prev;
      return [...prev, value].sort();
    });
  }

  async function saveAll() {
    if (!selectedSchool) {
      setError("Please select a school first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const allDates = [...new Set([...parsedDates, ...pickedDates])].sort();
      if (allDates.length === 0) {
        setError("Please provide at least one date.");
        return;
      }
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolName: selectedSchool, dates: allDates }),
      });
      const data = (await res.json()) as { error?: string; dates?: string[] };
      if (!res.ok) throw new Error(data.error || "Failed to save classes");
      onDatesSaved(data.dates || allDates);
      setManualText("");
      setPickedDates([]);
      setParsedDates([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save classes");
    } finally {
      setBusy(false);
    }
  }

  const allPreview = [...new Set([...parsedDates, ...pickedDates])].sort();

  return (
    <section style={{ width: "100%", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 10, padding: 10 }}>
      <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 13, fontWeight: 700 }}>Add Dates</h3>
      <div style={{ display: "grid", gap: 8 }}>
        <label style={{ display: "grid", gap: 3 }}>
          <span style={{ fontSize: 11, color: "#334155" }}>Upload image (AI recognition)</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ fontSize: 11 }}
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              e.currentTarget.value = "";
              void parseImage(file);
            }}
            disabled={busy}
          />
        </label>

        <label style={{ display: "grid", gap: 3 }}>
          <span style={{ fontSize: 11, color: "#334155" }}>Manual DD/MM (one per line)</span>
          <textarea
            rows={3}
            placeholder={"15/03\n19/03"}
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: 5, fontSize: 12, resize: "vertical" }}
          />
        </label>
        <button onClick={() => void parseManualText()} disabled={busy} style={btnStyle}>
          Parse Dates
        </button>

        <label style={{ display: "grid", gap: 3 }}>
          <span style={{ fontSize: 11, color: "#334155" }}>Date picker</span>
          <input type="date" style={{ fontSize: 12 }} onChange={(e) => addPickedDate(e.target.value)} />
        </label>

        <div>
          <div style={{ fontSize: 11, color: "#334155", marginBottom: 3 }}>Dates to save</div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, minHeight: 36, padding: 5, fontSize: 11, color: "#334155" }}>
            {allPreview.length === 0 ? "None yet" : allPreview.join(", ")}
          </div>
        </div>

        <button onClick={() => void saveAll()} disabled={busy} style={primaryBtnStyle}>
          {busy ? "Saving…" : "Save to Sheet"}
        </button>
        {error ? <div style={{ color: "#b91c1c", fontSize: 11 }}>{error}</div> : null}
      </div>
    </section>
  );
}

const btnStyle = {
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  borderRadius: 6,
  padding: "5px 8px",
  cursor: "pointer",
  fontSize: 12,
};

const primaryBtnStyle = {
  ...btnStyle,
  background: "#2563eb",
  border: "1px solid #2563eb",
  color: "#fff",
};
