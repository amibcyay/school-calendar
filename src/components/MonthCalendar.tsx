"use client";
import type { CSSProperties } from "react";

type Props = {
  monthDate: Date;
  markedDates: string[];
  dateLabels?: Record<string, string[]>;
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
  dateLabels = {},
  onPreviousMonth,
  onNextMonth,
}: Props) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
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
        maxWidth: 860,
        border: "1px solid #cbd5e1",
        borderRadius: 14,
        background: "#ffffff",
        boxShadow: "0 8px 18px rgba(15,23,42,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <button onClick={onPreviousMonth} style={navBtnStyle} aria-label="Show previous month">
          Previous
        </button>
        <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
        <button onClick={onNextMonth} style={navBtnStyle} aria-label="Show next month">
          Next
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0 }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            style={{ textAlign: "center", padding: "8px 0", color: "#475569", fontWeight: 600 }}
          >
            {d}
          </div>
        ))}
        {cells.map((dt, idx) => {
          if (!dt) {
            return (
              <div
                key={`empty-${idx}`}
                style={{ minHeight: 84, borderTop: "1px solid #f1f5f9" }}
              />
            );
          }
          const key = ymd(dt);
          const marked = markedSet.has(key);
          const labels = dateLabels[key] || [];
          return (
            <div
              key={key}
              style={{
                minHeight: 84,
                padding: 8,
                borderTop: "1px solid #f1f5f9",
                borderLeft: idx % 7 === 0 ? "none" : "1px solid #f8fafc",
                background: marked ? "#dbeafe" : "#ffffff",
              }}
            >
              <div style={{ fontWeight: 700 }}>{dt.getDate()}</div>
              {labels.length > 0
                ? labels.map((label) => (
                    <div
                      key={label}
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                        color: "#1d4ed8",
                        background: "#eff6ff",
                        borderRadius: 4,
                        padding: "2px 4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={label}
                    >
                      {label}
                    </div>
                  ))
                : marked
                  ? <div style={{ marginTop: 6, fontSize: 12, color: "#1d4ed8" }}>Class</div>
                  : null}
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
  padding: "7px 12px",
  cursor: "pointer",
};
