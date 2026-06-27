"use client";

import { TasteProfile } from "@/lib/types";

interface Props {
  taste: TasteProfile;
  size?: number;
}

const LABELS = ["甘味", "酸味", "余韻", "渋み・苦味", "ボディ"];
const MAX = 5;

export default function RadarChart({ taste, size = 200 }: Props) {
  const values = [
    taste.sweetness,
    taste.acidity,
    taste.finish,
    taste.tannin,
    taste.body,
  ];

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.35;

  // 5頂点の角度（上から時計回り、頂点を上に）
  const angles = Array.from({ length: 5 }, (_, i) => (i * 72 - 90) * (Math.PI / 180));

  const toXY = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  });

  // グリッド線（1〜5）
  const gridLines = [1, 2, 3, 4, 5].map((level) => {
    const pts = angles.map((a) => {
      const p = toXY(a, (r * level) / MAX);
      return `${p.x},${p.y}`;
    });
    return pts.join(" ");
  });

  // データポリゴン
  const dataPoints = angles.map((a, i) => {
    const p = toXY(a, (r * values[i]) / MAX);
    return `${p.x},${p.y}`;
  });

  // ラベル位置（外側に少し離す）
  const labelOffset = r * 1.32;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: "visible" }}
    >
      {/* グリッド */}
      {gridLines.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="#7A5C30"
          strokeWidth={i === 4 ? 1.4 : 0.9}
          strokeOpacity={i === 4 ? 0.55 : 0.30}
          strokeDasharray={i === 4 ? "none" : "3,3"}
        />
      ))}

      {/* 軸線 */}
      {angles.map((a, i) => {
        const end = toXY(a, r);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke="#7A5C30"
            strokeWidth="1.0"
            strokeOpacity={0.45}
          />
        );
      })}

      {/* データエリア */}
      <polygon
        points={dataPoints.join(" ")}
        fill="#7B3F5E"
        fillOpacity={0.18}
        stroke="#7B3F5E"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeDasharray="1,0"
      />

      {/* データ点 */}
      {angles.map((a, i) => {
        const p = toXY(a, (r * values[i]) / MAX);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="#7B3F5E"
            fillOpacity={0.8}
          />
        );
      })}

      {/* ラベル */}
      {angles.map((a, i) => {
        const p = toXY(a, labelOffset);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={size * 0.07}
            fill="#5C3A1E"
            fontFamily="'Klee One', cursive"
          >
            {LABELS[i]}
          </text>
        );
      })}
    </svg>
  );
}
