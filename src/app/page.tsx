"use client";

import { useEffect, useMemo, useState } from "react";
import { MonthCalendar } from "@/components/MonthCalendar";
import { SchoolSelect } from "@/components/SchoolSelect";
import { DateInputPanel } from "@/components/DateInputPanel";

export default function HomePage() {
  const [schools, setSchools] = useState<string[]>([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [calendarDates, setCalendarDates] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadSchools() {
      try {
        const res = await fetch("/api/schools");
        const data = (await res.json()) as { schools?: string[]; error?: string };
        if (!res.ok) throw new Error(data.error || "Failed to load schools");
        if (!active) return;
        setSchools(data.schools || []);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load schools");
      }
    }
    void loadSchools();
    return () => {
      active = false;
    };
  }, []);

  const monthDates = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    return calendarDates.filter((iso) => {
      const [yy, mm] = iso.split("-").map(Number);
      return yy === y && mm === m + 1;
    });
  }, [calendarDates, currentMonth]);

  return (
    <main style={{ minHeight: "100vh", padding: "20px 16px 36px" }}>
      <div style={{ margin: "0 auto", maxWidth: 1100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <SchoolSelect schools={schools} value={selectedSchool} onChange={setSelectedSchool} />
          <DateInputPanel
            selectedSchool={selectedSchool}
            onDatesSaved={(dates) => {
              setCalendarDates((prev) => [...new Set([...prev, ...dates])].sort());
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <MonthCalendar
            monthDate={currentMonth}
            markedDates={monthDates}
            onPreviousMonth={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            onNextMonth={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          />
        </div>
        {error ? <p style={{ color: "#b91c1c", marginTop: 12 }}>{error}</p> : null}
      </div>
    </main>
  );
}
