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
  const [pickedDate, setPickedDate] = useState("");
  // Editable list of dates to save (YYYY-MM-DD strings)
  const [dates, setDates] = useState<string[]>([]);

  async function parseImage(file: File | null) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("image", file);
      const res = await fetch("/api/parse-dates", { method: "POST", body: fd });
      const data = (await res.json()) as { dates?: string[]; error?: string };
      if (!res.ok) throw new Error(data.error || "圖片解析失敗");
      mergeDates(data.dates || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "圖片解析失敗");
    } finally {
      setBusy(false);
    }
  }

  function parseManualText() {
    setError("");
    const lines = manualText
      .split(/\r?\n/)
      .map((v) => v.trim())
      .filter(Boolean);
    const normalized = lines
      .map((l) => normalizeDdMm(l))
      .filter((d): d is string => Boolean(d));
    if (normalized.length === 0) {
      setError("沒有找到有效日期，請使用 DD/MM 格式");
      return;
    }
    mergeDates(normalized);
    setManualText("");
  }

  function addPickedDate() {
    if (!pickedDate) return;
    mergeDates([pickedDate]);
    setPickedDate("");
  }

  function mergeDates(incoming: string[]) {
    setDates((prev) => {
      const set = new Set(prev);
      incoming.forEach((d) => set.add(d));
      return [...set].sort();
    });
  }

  function updateDate(idx: number, value: string) {
    setDates((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }

  function removeDate(idx: number) {
    setDates((prev) => prev.filter((_, i) => i !== idx));
  }

  async function saveAll() {
    if (!selectedSchool) {
      setError("請先選擇學校");
      return;
    }
    if (dates.length === 0) {
      setError("請至少輸入一個日期");
      return;
    }
    // Validate all dates before saving
    const valid = dates.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.trim()));
    if (valid.length !== dates.length) {
      setError("部分日期格式不正確，請確認所有日期為 YYYY-MM-DD 格式");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolName: selectedSchool, dates: valid }),
      });
      const data = (await res.json()) as { error?: string; dates?: string[] };
      if (!res.ok) throw new Error(data.error || "儲存失敗");
      onDatesSaved(data.dates || valid);
      setDates([]);
      setManualText("");
      setPickedDate("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "儲存失敗");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={{ width: "100%", boxSizing: "border-box", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 10, padding: 10, overflow: "hidden" }}>
      <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 13, fontWeight: 700 }}>新增課堂日期</h3>
      <div style={{ display: "grid", gap: 8 }}>

        {/* Image upload */}
        <label style={{ display: "grid", gap: 3 }}>
          <span style={{ fontSize: 11, color: "#334155" }}>上傳圖片（AI 辨識日期）</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ fontSize: 11, width: "100%", boxSizing: "border-box" }}
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              e.currentTarget.value = "";
              void parseImage(file);
            }}
            disabled={busy}
          />
        </label>

        {/* Manual text input */}
        <label style={{ display: "grid", gap: 3 }}>
          <span style={{ fontSize: 11, color: "#334155" }}>手動輸入 DD/MM（每行一個）</span>
          <textarea
            rows={3}
            placeholder={"15/03\n19/03"}
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: 6, padding: 5, fontSize: 12, resize: "none" }}
          />
        </label>
        <button onClick={parseManualText} disabled={busy} style={btnStyle}>
          解析日期
        </button>

        {/* Date picker */}
        <label style={{ display: "grid", gap: 3 }}>
          <span style={{ fontSize: 11, color: "#334155" }}>日期選擇器</span>
          <div style={{ display: "flex", gap: 4 }}>
            <input
              type="date"
              value={pickedDate}
              onChange={(e) => setPickedDate(e.target.value)}
              style={{ flex: 1, fontSize: 12, width: "100%", boxSizing: "border-box" }}
            />
            <button onClick={addPickedDate} disabled={!pickedDate || busy} style={{ ...btnStyle, whiteSpace: "nowrap" }}>
              加入
            </button>
          </div>
        </label>

        {/* Editable dates list */}
        <div>
          <div style={{ fontSize: 11, color: "#334155", marginBottom: 4, fontWeight: 600 }}>
            待儲存日期（可編輯／刪除）
          </div>
          {dates.length === 0 ? (
            <div style={{ fontSize: 11, color: "#94a3b8", padding: "6px 0" }}>尚無日期</div>
          ) : (
            <div style={{ display: "grid", gap: 4 }}>
              {dates.map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <input
                    type="text"
                    value={d}
                    onChange={(e) => updateDate(i, e.target.value)}
                    placeholder="YYYY-MM-DD"
                    style={{
                      flex: 1,
                      fontSize: 11,
                      border: "1px solid #cbd5e1",
                      borderRadius: 5,
                      padding: "3px 5px",
                      width: "100%",
                      boxSizing: "border-box",
                      fontFamily: "monospace",
                    }}
                  />
                  <button
                    onClick={() => removeDate(i)}
                    style={{ ...btnStyle, padding: "3px 6px", fontSize: 11, color: "#b91c1c", borderColor: "#fca5a5" }}
                    title="刪除"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => void saveAll()} disabled={busy || dates.length === 0} style={primaryBtnStyle}>
          {busy ? "儲存中…" : "儲存至試算表"}
        </button>
        {error ? <div style={{ color: "#b91c1c", fontSize: 11, wordBreak: "break-word" }}>{error}</div> : null}
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
