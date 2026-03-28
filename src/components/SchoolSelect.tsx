"use client";

type Props = {
  schools: string[];
  value: string;
  onChange: (value: string) => void;
};

export function SchoolSelect({ schools, value, onChange }: Props) {
  return (
    <label style={{ display: "grid", gap: 6, width: "100%" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>School</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }}
      >
        <option value="">Select a school</option>
        {schools.map((school) => (
          <option key={school} value={school}>
            {school}
          </option>
        ))}
      </select>
    </label>
  );
}
