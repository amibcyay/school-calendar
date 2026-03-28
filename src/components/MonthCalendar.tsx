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

  const gridCols = "repeat(7, minmax(0, 1fr))";

  return (
    <section
      style={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        overflow: "hidden",
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
          gap: 8,
          padding: "10px 12px",
          borderBottom: "1px solid #e2e8f0",
          minWidth: 0,
        }}
      >
        <button onClick={onPreviousMonth} style={navBtnStyle} aria-label="上個月">
          ‹ 上個月
        </button>
        <h2 style={{ margin: 0, fontSize: "clamp(14px, 4vw, 22px)", fontWeight: 700, minWidth: 0, textAlign: "center", flex: "1 1 auto" }}>{title}</h2>
        <button onClick={onNextMonth} style={navBtnStyle} aria-label="下個月">
          下個月 ›
        </button>
      </div>

      {/* Day-of-week labels — minmax(0,1fr) keeps all 7 columns inside the card on narrow screens */}
      <div style={{ display: "grid", gridTemplateColumns: gridCols, width: "100%", minWidth: 0 }}>
        {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              padding: "6px 2px",
              color: "#475569",
              fontWeight: 600,
              fontSize: "clamp(10px, 2.8vw, 13px)",
              borderBottom: "1px solid #e2e8f0",
              minWidth: 0,
              overflow: "hidden",
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
                  minWidth: 0,
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
                minWidth: 0,
                padding: "4px 3px",
                borderTop: "1px solid #f1f5f9",
                borderLeft: idx % 7 === 0 ? "none" : "1px solid #f1f5f9",
                background: marked ? "#eff6ff" : "#ffffff",
                verticalAlign: "top",
                overflow: "hidden",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "clamp(11px, 3vw, 14px)", marginBottom: 2 }}>{dt.getDate()}</div>
              {events.map((ev, i) => (
                <div
                  key={`${ev.schoolName}-${i}`}
                  style={{
                    marginBottom: 3,
                    background: "#dbeafe",
                    borderRadius: 4,
                    padding: "2px 3px",
                    fontSize: "clamp(9px, 2.4vw, 11px)",
                    lineHeight: 1.35,
                    color: "#1e3a8a",
                    overflow: "hidden",
                    minWidth: 0,
                    maxWidth: "100%",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      wordBreak: "break-word",
                    }}
                    title={ev.schoolName}
                  >
                    {ev.schoolName}
                  </div>
                  {ev.location && (
                    <div style={{ color: "#1d4ed8", wordBreak: "break-word", overflow: "hidden" }}>📍 {ev.location}</div>
                  )}
                  {ev.time && (
                    <div style={{ color: "#1d4ed8", wordBreak: "break-word", overflow: "hidden" }}>🕐 {ev.time}</div>
                  )}
                  {ev.instructor && (
                    <div style={{ color: "#1d4ed8", wordBreak: "break-word", overflow: "hidden" }}>👤 {ev.instructor}</div>
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
