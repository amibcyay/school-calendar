"use client";
import type { CSSProperties } from "react";

type DayEvent = {
  schoolName: string;
  location: string;
  time: string;
  instructor: string;
};

type Props = {
  monthDate: Date;
  markedDates: string[];
  dateEvents?: Record<string, DayEvent[]>;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

function ymd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function MonthCalendar({
  monthDate,
  markedDates,
  dateEvents = {},
  onPreviousMonth,
  onNextMonth,
}: Props) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  const markedSet = new Set(markedDates);
  const title = monthDate.toLocaleDateString(undefined, { year: "numeric", month: "long" });

  return (
    <section
      style={{
        width: "100%",
        border: "1px solid #cbd5e1",
        borderRadius: 14,
        background: "#ffffff",
        boxShadow: "0 8px 18px rgba(15,23,42,0.08)",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <button onClick={onPreviousMonth} style={navBtnStyle} aria-label="上個月">
          ‹ 上個月
        </button>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{title}</h2>
        <button onClick={onNextMonth} style={navBtnStyle} aria-label="下個月">
          下個月 ›
        </button>
      </div>

      {/* Day-of-week labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              padding: "8px 0",
              color: "#475569",
              fontWeight: 600,
              fontSize: 13,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            {d}
          </div>
        ))}

        {/* Day cells */}
        {cells.map((dt, idx) => {
          if (!dt) {
            return (
              <div
                key={`empty-${idx}`}
                style={{
                  minHeight: 110,
                  borderTop: "1px solid #f1f5f9",
                  background: "#fafafa",
                }}
              />
            );
          }
          const key = ymd(dt);
          const marked = markedSet.has(key);
          const events = dateEvents[key] || [];
          return (
            <div
              key={key}
              style={{
                minHeight: 110,
                padding: "6px 7px",
                borderTop: "1px solid #f1f5f9",
                borderLeft: idx % 7 === 0 ? "none" : "1px solid #f1f5f9",
                background: marked ? "#eff6ff" : "#ffffff",
                verticalAlign: "top",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{dt.getDate()}</div>
              {events.map((ev, i) => (
                <div
                  key={`${ev.schoolName}-${i}`}
                  style={{
                    marginBottom: 4,
                    background: "#dbeafe",
                    borderRadius: 5,
                    padding: "3px 5px",
                    fontSize: 11,
                    lineHeight: 1.4,
                    color: "#1e3a8a",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ fontWeight: 700, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }} title={ev.schoolName}>
                    {ev.schoolName}
                  </div>
                  {ev.location && (
                    <div style={{ color: "#1d4ed8" }}>📍 {ev.location}</div>
                  )}
                  {ev.time && (
                    <div style={{ color: "#1d4ed8" }}>🕐 {ev.time}</div>
                  )}
                  {ev.instructor && (
                    <div style={{ color: "#1d4ed8" }}>👤 {ev.instructor}</div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

const navBtnStyle: CSSProperties = {
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  borderRadius: 8,
  padding: "7px 14px",
  cursor: "pointer",
  fontSize: 14,
};
