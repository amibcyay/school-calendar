"use client";

import { useEffect, useMemo, useState } from "react";
import { MonthCalendar } from "@/components/MonthCalendar";
import { SchoolSelect } from "@/components/SchoolSelect";
import { DateInputPanel } from "@/components/DateInputPanel";

type ClassEntry = { schoolName: string; date: string };

export default function HomePage() {
  const [schools, setSchools] = useState<string[]>([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [classEntries, setClassEntries] = useState<ClassEntry[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
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

    async function loadClasses() {
      try {
        const res = await fetch("/api/classes");
        const data = (await res.json()) as { entries?: ClassEntry[]; error?: string };
        if (!res.ok) throw new Error(data.error || "Failed to load classes");
        if (!active) return;
        setClassEntries(data.entries || []);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load classes");
      } finally {
        if (active) setLoadingClasses(false);
      }
    }

    void loadSchools();
    void loadClasses();

    return () => {
      active = false;
    };
  }, []);

  const calendarDates = useMemo(() => classEntries.map((e) => e.date), [classEntries]);

  const monthEntries = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    return classEntries.filter((e) => {
      const [yy, mm] = e.date.split("-").map(Number);
      return yy === y && mm === m + 1;
    });
  }, [classEntries, currentMonth]);

  const monthDates = useMemo(
    () => [...new Set(monthEntries.map((e) => e.date))],
    [monthEntries],
  );

  const dateLabels = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const e of monthEntries) {
      if (!map[e.date]) map[e.date] = [];
      if (!map[e.date].includes(e.schoolName)) map[e.date].push(e.schoolName);
    }
    return map;
  }, [monthEntries]);

  function onDatesSaved(dates: string[]) {
    if (!selectedSchool) return;
    const newEntries: ClassEntry[] = dates.map((d) => ({
      schoolName: selectedSchool,
      date: d,
    }));
    setClassEntries((prev) => {
      const existing = new Set(prev.map((e) => `${e.schoolName}||${e.date}`));
      const toAdd = newEntries.filter((e) => !existing.has(`${e.schoolName}||${e.date}`));
      return [...prev, ...toAdd].sort((a, b) => a.date.localeCompare(b.date));
    });
  }

  return (
    <main style={{ minHeight: "100vh", padding: "20px 16px 36px" }}>
      <div style={{ margin: "0 auto", maxWidth: 1100 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <SchoolSelect schools={schools} value={selectedSchool} onChange={setSelectedSchool} />
          <DateInputPanel selectedSchool={selectedSchool} onDatesSaved={onDatesSaved} />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {loadingClasses ? (
            <p style={{ color: "#64748b", marginTop: 40 }}>Loading calendar…</p>
          ) : (
            <MonthCalendar
              monthDate={currentMonth}
              markedDates={monthDates}
              dateLabels={dateLabels}
              onPreviousMonth={() =>
                setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
              }
              onNextMonth={() =>
                setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
              }
            />
          )}
        </div>
        {error ? <p style={{ color: "#b91c1c", marginTop: 12 }}>{error}</p> : null}
      </div>
    </main>
  );
}
