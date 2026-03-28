"use client";

import { useEffect, useMemo, useState } from "react";
import { MonthCalendar } from "@/components/MonthCalendar";
import { SchoolSelect } from "@/components/SchoolSelect";
import { DateInputPanel } from "@/components/DateInputPanel";

type SchoolEntry = { name: string; location: string; time: string; instructor: string };
type ClassEntry = { schoolName: string; date: string; location: string; time: string; instructor: string };

export default function HomePage() {
  const [schools, setSchools] = useState<SchoolEntry[]>([]);
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
        const data = (await res.json()) as { schools?: SchoolEntry[]; error?: string };
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

    return () => { active = false; };
  }, []);

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

  // Map date -> array of event objects for that day
  const dateEvents = useMemo(() => {
    const map: Record<string, Array<{ schoolName: string; location: string; time: string; instructor: string }>> = {};
    for (const e of monthEntries) {
      if (!map[e.date]) map[e.date] = [];
      const alreadyIn = map[e.date].some((x) => x.schoolName === e.schoolName);
      if (!alreadyIn) {
        map[e.date].push({
          schoolName: e.schoolName,
          location: e.location,
          time: e.time,
          instructor: e.instructor,
        });
      }
    }
    return map;
  }, [monthEntries]);

  function onDatesSaved(dates: string[]) {
    if (!selectedSchool) return;
    const school = schools.find((s) => s.name === selectedSchool);
    const newEntries: ClassEntry[] = dates.map((d) => ({
      schoolName: selectedSchool,
      date: d,
      location: school?.location ?? "",
      time: school?.time ?? "",
      instructor: school?.instructor ?? "",
    }));
    setClassEntries((prev) => {
      const existing = new Set(prev.map((e) => `${e.schoolName}||${e.date}`));
      const toAdd = newEntries.filter((e) => !existing.has(`${e.schoolName}||${e.date}`));
      return [...prev, ...toAdd].sort((a, b) => a.date.localeCompare(b.date));
    });
  }

  const schoolNames = useMemo(() => schools.map((s) => s.name), [schools]);

  return (
    <main style={{ minHeight: "100vh", padding: "12px 12px 24px" }}>
      <div style={{ margin: "0 auto", maxWidth: 1280 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Calendar: fills remaining space */}
          <div style={{ flex: "1 1 0", minWidth: 0 }}>
            {loadingClasses ? (
              <p style={{ color: "#64748b", marginTop: 40 }}>Loading calendar…</p>
            ) : (
              <MonthCalendar
                monthDate={currentMonth}
                markedDates={monthDates}
                dateEvents={dateEvents}
                onPreviousMonth={() =>
                  setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
                }
                onNextMonth={() =>
                  setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
                }
              />
            )}
          </div>

          {/* Sidebar: fixed narrow width */}
          <div style={{ flex: "0 0 200px", width: 200, display: "flex", flexDirection: "column", gap: 10 }}>
            <SchoolSelect schools={schoolNames} value={selectedSchool} onChange={setSelectedSchool} />
            <DateInputPanel selectedSchool={selectedSchool} onDatesSaved={onDatesSaved} />
          </div>
        </div>

        {error ? <p style={{ color: "#b91c1c", marginTop: 12 }}>{error}</p> : null}
      </div>
    </main>
  );
}
