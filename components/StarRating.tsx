"use client";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export default function StarRating({ value, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const full = i + 1;
        const half = i + 0.5;
        return (
          <div key={i} className="relative w-7 h-7 cursor-pointer">
            {/* 空星 */}
            <span className="text-2xl text-amber-200 select-none">★</span>
            {/* 半星 */}
            <span
              className="absolute inset-0 text-2xl text-amber-500 overflow-hidden select-none"
              style={{ width: value >= full ? "100%" : value >= half ? "50%" : "0%" }}
            >
              ★
            </span>
            {/* クリック領域 左半分 */}
            <div
              className="absolute inset-0 w-1/2"
              onClick={() => onChange(half)}
            />
            {/* クリック領域 右半分 */}
            <div
              className="absolute inset-0 left-1/2 w-1/2"
              onClick={() => onChange(full)}
            />
          </div>
        );
      })}
      <span className="ml-1 text-sm text-amber-800 self-center" style={{ fontFamily: "'Klee One', cursive" }}>
        {value > 0 ? `${value} / 5` : ""}
      </span>
    </div>
  );
}
