"use client";

type Props = {
  schools: string[];
  value: string;
  onChange: (value: string) => void;
};

export function SchoolSelect({ schools, value, onChange }: Props) {
  return (
    <label style={{ display: "grid", gap: 4, width: "100%" }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#334155" }}>學校</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 6, padding: "5px 8px", fontSize: 12 }}
      >
        <option value="">請選擇學校</option>
        {schools.map((school) => (
          <option key={school} value={school}>
            {school}
          </option>
        ))}
      </select>
    </label>
  );
}
