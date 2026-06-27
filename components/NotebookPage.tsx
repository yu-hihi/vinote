"use client";

import { WineRecord } from "@/lib/types";
import RadarChart from "./RadarChart";

interface Props {
  record: WineRecord;
}

const PENCIL_FILTER = "pencil-texture";

export default function NotebookPage({ record }: Props) {
  const pencilFilter = `url(#${PENCIL_FILTER})`;
  const pencil      = { fontFamily: "'Klee One', cursive", color: "#3A3028", fontWeight: "600", filter: pencilFilter } as const;
  const pencilSub   = { fontFamily: "'Klee One', cursive", color: "#4A3A2A", fontWeight: "600", filter: pencilFilter } as const;
  const pencilMuted = { fontFamily: "'Klee One', cursive", color: "#5A4A38", fontWeight: "600", filter: pencilFilter } as const;
  const pencilLabel = { fontFamily: "'Klee One', cursive", color: "#5A4A38", fontWeight: "600", fontSize: "0.7rem", letterSpacing: "0.08em" } as const;

  return (
    <div
      className="relative w-full max-w-4xl mx-auto rounded-lg shadow-2xl overflow-hidden"
      style={{ background: "#D4B07A", minHeight: "600px" }}
    >
      {/* SVGフィルター定義（鉛筆質感・強め） */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={PENCIL_FILTER} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.08" numOctaves="4" seed="5" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
            <feGaussianBlur in="displaced" stdDeviation="0.5" result="blurred"/>
            <feComposite in="blurred" in2="SourceGraphic" operator="in"/>
          </filter>
        </defs>
      </svg>

      {/* 紙テクスチャ層1: 細かい粒子ノイズ */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0.2'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.18, mixBlendMode: "multiply",
      }} />
      {/* 紙テクスチャ層2: 横方向の繊維 */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='200'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02 0.4' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0.1'/%3E%3C/filter%3E%3Crect width='600' height='200' filter='url(%23f)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.12, mixBlendMode: "multiply",
      }} />
      {/* 紙テクスチャ層3: ハイライト＋周辺暗化 */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 40% 35%, rgba(255,240,200,0.22) 0%, transparent 55%), radial-gradient(ellipse at 70% 75%, rgba(120,80,20,0.12) 0%, transparent 50%)",
      }} />
      {/* 紙テクスチャ層4: 端の焼け */}
      <div className="absolute inset-0 pointer-events-none rounded-lg" style={{
        boxShadow: "inset 0 0 60px rgba(100,60,10,0.18)",
      }} />


      {/* モバイル：縦積み / デスクトップ：左右2カラム */}
      <div className="relative flex flex-col md:flex-row md:divide-x md:divide-amber-800/20 min-h-[600px]">

        {/* 左ページ（上段）：水彩イラスト */}
        <div className="md:w-[45%] flex flex-col items-center justify-center p-5 gap-3 border-b border-amber-800/20 md:border-b-0">
          {record.illustrationUrl ? (
            <img
              src={record.illustrationUrl}
              alt={record.name}
              className="max-h-72 md:max-h-[480px] w-auto object-contain"
            />
          ) : (
            <div className="w-32 h-56 bg-amber-100/50 rounded border-2 border-dashed border-amber-400 flex items-center justify-center">
              <span className="text-amber-500 text-xs" style={pencilSub}>イラスト生成中...</span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {record.color && (
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded-full border-2"
                  style={{ backgroundColor: record.color.hex, borderColor: "#5A4A3A" }}
                />
                <span className="text-sm" style={pencilSub}>{record.color.name}</span>
              </div>
            )}
            {record.sparkling && (
              <span className="text-xs px-2 py-0.5 rounded-full border" style={{ ...pencilSub, borderColor: "#5A4A3A", fontSize: "0.7rem" }}>
                スパークリング
              </span>
            )}
          </div>

          {record.rating > 0 && (
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => {
                const full = i + 1;
                const half = i + 0.5;
                const filled = record.rating >= full ? "100%" : record.rating >= half ? "50%" : "0%";
                return (
                  <div key={i} className="relative text-xl leading-none">
                    <span style={{ color: "#B8A88A" }}>★</span>
                    <span className="absolute inset-0 overflow-hidden" style={{ width: filled, color: "#5A4030" }}>★</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 右ページ（下段）：テキスト情報 */}
        <div
          className="relative md:w-[55%] p-5 md:p-8 space-y-3"
          style={{
            backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 32px, rgba(80,50,20,0.13) 32px, rgba(80,50,20,0.13) 33px)",
            backgroundPositionY: "8px",
          }}
        >
          <div className="relative space-y-3">
            <div>
              <h2 className="leading-snug break-words" style={{ ...pencil, fontWeight: "700", fontSize: "1.3rem" }}>
                {record.name || "（ワイン名未入力）"}
              </h2>
              {record.producer && (
                <p className="text-sm mt-0.5 break-words" style={pencilSub}>{record.producer}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm" style={pencilSub}>
              {record.vintage && <span>{record.vintage}年</span>}
              {record.region && <span className="break-words">{record.region}</span>}
              {record.grape && <span className="w-full break-words">{record.grape}</span>}
            </div>

            {record.aromas.length > 0 && (
              <div>
                <p className="mb-1" style={pencilLabel}>— 香り —</p>
                <p className="text-sm leading-relaxed break-words" style={pencilSub}>
                  {record.aromas.join("　")}
                </p>
              </div>
            )}

            <div className="flex justify-center py-1">
              <RadarChart taste={record.taste} size={160} />
            </div>

            {record.pairing && (
              <div>
                <p className="mb-0.5" style={pencilLabel}>— ペアリング —</p>
                <p className="text-sm break-words" style={pencilSub}>{record.pairing}</p>
              </div>
            )}

            {record.notes && (
              <div>
                <p className="mb-0.5" style={pencilLabel}>— メモ —</p>
                <p className="text-sm whitespace-pre-wrap break-words" style={pencilSub}>{record.notes}</p>
              </div>
            )}

            {record.createdAt && (
              <p className="text-right mt-4" style={pencilLabel}>
                {new Date(record.createdAt).toLocaleDateString("ja-JP")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
