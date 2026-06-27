"use client";

import { useState } from "react";
import { AROMA_CATEGORIES } from "@/lib/types";

interface Props {
  value: string[];
  onChange: (aromas: string[]) => void;
}

export default function AromaPicker({ value, onChange }: Props) {
  const [openCat, setOpenCat] = useState<string | null>(null);

  const toggle = (item: string) => {
    if (value.includes(item)) {
      onChange(value.filter((a) => a !== item));
    } else {
      onChange([...value, item]);
    }
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {value.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 border border-amber-400 rounded-full text-xs text-amber-900 cursor-pointer"
              style={{ fontFamily: "'Klee One', cursive" }}
              onClick={() => toggle(a)}
            >
              {a} ×
            </span>
          ))}
        </div>
      )}

      {AROMA_CATEGORIES.map((cat) => (
        <div key={cat.name} className="border border-amber-200 rounded-lg overflow-hidden">
          <button
            type="button"
            className="w-full text-left px-3 py-2 bg-amber-50 hover:bg-amber-100 flex justify-between items-center"
            onClick={() => setOpenCat(openCat === cat.name ? null : cat.name)}
          >
            <span className="text-sm font-medium text-amber-900" style={{ fontFamily: "'Klee One', cursive" }}>
              {cat.name}
            </span>
            <span className="text-amber-600 text-xs">
              {cat.items.filter((i) => value.includes(i)).length > 0
                ? `${cat.items.filter((i) => value.includes(i)).length}選択`
                : openCat === cat.name ? "▲" : "▼"}
            </span>
          </button>
          {openCat === cat.name && (
            <div className="p-2 flex flex-wrap gap-1.5 bg-white">
              {cat.items.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggle(item)}
                  className="px-2 py-1 rounded-full text-xs border transition-colors"
                  style={{
                    fontFamily: "'Klee One', cursive",
                    backgroundColor: value.includes(item) ? "#7B3F5E" : "#FFF8F0",
                    borderColor: value.includes(item) ? "#7B3F5E" : "#C4A882",
                    color: value.includes(item) ? "#fff" : "#5C3A1E",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
