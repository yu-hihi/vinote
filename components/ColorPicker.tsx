"use client";

import { WINE_COLORS, WineColor } from "@/lib/types";

interface Props {
  value: WineColor | null;
  onChange: (color: WineColor) => void;
}

const CATEGORY_LABELS = { red: "赤ワイン", rose: "ロゼワイン", white: "白ワイン", orange: "オレンジワイン" };

export default function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      {(Object.entries(WINE_COLORS) as [keyof typeof WINE_COLORS, readonly { name: string; hex: string }[]][]).map(([cat, colors]) => (
        <div key={cat}>
          <p className="text-xs text-amber-800 mb-1 font-medium" style={{ fontFamily: "'Klee One', cursive" }}>
            {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c.hex}
                type="button"
                title={c.name}
                onClick={() => onChange(c)}
                className="relative group"
              >
                <div
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: value?.hex === c.hex ? "#5C3A1E" : "#C4A882",
                    transform: value?.hex === c.hex ? "scale(1.2)" : undefined,
                    boxShadow: value?.hex === c.hex ? "0 0 0 2px #5C3A1E" : undefined,
                  }}
                />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-amber-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
      {value && (
        <p className="text-sm text-amber-900 flex items-center gap-2" style={{ fontFamily: "'Klee One', cursive" }}>
          <span className="inline-block w-4 h-4 rounded-full border border-amber-700" style={{ backgroundColor: value.hex }} />
          選択中：{value.name}
        </p>
      )}
    </div>
  );
}
