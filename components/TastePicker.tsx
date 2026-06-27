"use client";

import { TasteProfile } from "@/lib/types";

interface Props {
  value: TasteProfile;
  onChange: (t: TasteProfile) => void;
}

const ITEMS: { key: keyof TasteProfile; label: string }[] = [
  { key: "sweetness", label: "甘味" },
  { key: "acidity", label: "酸味" },
  { key: "finish", label: "余韻の長さ" },
  { key: "tannin", label: "渋み・苦味" },
  { key: "body", label: "ボディ" },
];

export default function TastePicker({ value, onChange }: Props) {
  const set = (key: keyof TasteProfile, v: number) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="space-y-3">
      {ITEMS.map(({ key, label }) => (
        <div key={key}>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-amber-900" style={{ fontFamily: "'Klee One', cursive" }}>{label}</span>
            <span className="text-sm text-amber-700 tabular-nums" style={{ fontFamily: "'Klee One', cursive" }}>{value[key].toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={value[key]}
            onChange={(e) => set(key, parseFloat(e.target.value))}
            className="w-full accent-amber-700"
          />
          <div className="flex justify-between text-xs text-amber-400 mt-0.5">
            <span>0</span><span>5</span>
          </div>
        </div>
      ))}
    </div>
  );
}
