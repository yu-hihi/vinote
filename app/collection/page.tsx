"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VinoteLogo from "@/components/VinoteLogo";
import { loadRecords } from "@/lib/storage";
import { WineRecord, WineCategory, getWineCategory, CATEGORY_LABELS } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import WineGlassLoader from "@/components/WineGlassLoader";

const hw = { fontFamily: "'Klee One', cursive" } as const;

type SortKey = "date_desc" | "date_asc" | "rating_desc" | "rating_asc";

const SORT_LABELS: Record<SortKey, string> = {
  date_desc: "新しい順",
  date_asc:  "古い順",
  rating_desc: "評価が高い順",
  rating_asc:  "評価が低い順",
};

const FILTER_TABS: { key: WineCategory | "all"; label: string }[] = [
  { key: "all",       label: "すべて" },
  { key: "sparkling", label: "泡" },
  { key: "red",       label: "赤" },
  { key: "white",     label: "白" },
  { key: "orange",    label: "オレンジ" },
  { key: "rose",      label: "ロゼ" },
];

export default function Home() {
  const [records, setRecords] = useState<WineRecord[]>([]);
  const [filter, setFilter] = useState<WineCategory | "all">("all");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setLoadError(null);
      const data = await loadRecords();
      setRecords(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setLoadError(msg);
      // 認証エラーならログインへ
      if (msg.includes("JWT") || msg.includes("auth") || msg.includes("401")) {
        location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    createClient().auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const handleLogout = async () => {
    await createClient().auth.signOut();
    location.href = "/login";
  };

  const filtered = records
    .filter((r) => filter === "all" || getWineCategory(r) === filter)
    .sort((a, b) => {
      if (sort === "date_desc") return (b.createdAt ?? "") > (a.createdAt ?? "") ? 1 : -1;
      if (sort === "date_asc")  return (a.createdAt ?? "") > (b.createdAt ?? "") ? 1 : -1;
      if (sort === "rating_desc") return (b.rating ?? 0) - (a.rating ?? 0);
      if (sort === "rating_asc")  return (a.rating ?? 0) - (b.rating ?? 0);
      return 0;
    });

  return (
    <main className="min-h-screen px-4 pb-4 md:px-6 md:pb-6 page-fade-in" style={{ background: "#D4B07A", paddingTop: "0px", paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-2">
          <div className="flex items-center justify-between gap-3">
            <VinoteLogo style={{ width: "52vw", maxWidth: "280px", height: "auto", display: "block", marginLeft: "-6px", marginBottom: "0px" }} />
            <Link
              href="/add"
              title="新しいワインを記録"
              className="flex items-center justify-center rounded-full shadow-[0_4px_0_#4a0a0a] active:shadow-[0_1px_0_#4a0a0a] active:translate-y-px transition-all select-none flex-shrink-0 self-end mb-3" style={{ background: "#7B1515", width: "44px", height: "44px" }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 4V18M4 11H18" stroke="#FDF6EC" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* フィルタータブ */}
        <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all select-none whitespace-nowrap flex-shrink-0 ${
                filter === key
                  ? "text-amber-50 shadow-[0_2px_0_#4a0a0a]"
                  : "bg-amber-100/70 text-amber-800 hover:bg-amber-200"
              }`}
              style={{ ...hw, ...(filter === key ? { background: "#7B1515" } : {}) }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ソート */}
        <div className="flex items-center gap-2 mb-5">
<select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="text-xs text-amber-900 bg-amber-50/70 border border-amber-300 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-600"
            style={hw}
          >
            {(Object.entries(SORT_LABELS) as [SortKey, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          {filter !== "all" && (
            <span className="text-xs text-amber-600" style={hw}>
              {filtered.length} 件表示
            </span>
          )}
        </div>

        {/* コレクション一覧 */}
        {loadError ? (
          <div className="text-center py-24 text-red-700 bg-red-50/60 rounded-2xl px-6" style={hw}>
            <p className="text-lg font-bold mb-2">データの読み込みに失敗しました</p>
            <p className="text-sm mb-4 text-red-600">{loadError}</p>
            <button
              onClick={refresh}
              className="px-6 py-2 bg-amber-900 text-amber-50 rounded-full text-sm hover:bg-amber-800"
              style={hw}
            >
              再読み込み
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <WineGlassLoader />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-24 text-amber-600" style={hw}>
            <p className="text-5xl mb-4">🍾</p>
            <p className="text-lg">まだワインが記録されていません</p>
            <p className="text-sm mt-2">「新しいワインを記録」から最初の1本を追加しましょう</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-amber-600" style={hw}>
            <p className="text-lg">該当するワインがありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((record) => {
              const category = getWineCategory(record);
              return (
                <Link key={record.id} href={`/wine/${record.id}`}>
                  <div className="bg-amber-50/80 rounded-xl p-4 shadow hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer border border-amber-200">
                    {record.illustrationUrl ? (
                      <img
                        src={record.illustrationUrl}
                        alt={record.name}
                        className="w-full h-40 object-contain mb-3"
                      />
                    ) : (
                      <div className="w-full h-40 bg-amber-100 rounded flex items-center justify-center mb-3">
                        <span className="text-4xl">🍾</span>
                      </div>
                    )}
                    {/* カテゴリバッジ */}
                    {category !== "unknown" && (
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 mb-1" style={hw}>
                        {CATEGORY_LABELS[category]}
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-amber-950 truncate" style={hw}>
                      {record.name || "名称未設定"}
                    </h3>
                    <p className="text-xs text-amber-700 truncate" style={hw}>
                      {record.producer}
                    </p>
                    {record.vintage && (
                      <p className="text-xs text-amber-500 mt-0.5" style={hw}>{record.vintage}年</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => {
                          const full = i + 1;
                          const half = i + 0.5;
                          const filled = record.rating >= full ? "100%" : record.rating >= half ? "50%" : "0%";
                          return (
                            <div key={i} className="relative text-base leading-none">
                              <span style={{ color: "#C8B89A" }}>★</span>
                              <span className="absolute inset-0 overflow-hidden" style={{ width: filled, color: "#7A5C30" }}>★</span>
                            </div>
                          );
                        })}
                      </div>
                      {record.createdAt && (
                        <span className="text-xs text-amber-500" style={hw}>
                          {new Date(record.createdAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ログイン情報（ページ最下部） */}
      {userEmail && (
        <div className="flex items-center justify-center gap-3 pt-6 pb-4 px-4">
          <span className="text-xs text-amber-700/70" style={hw}>{userEmail}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-amber-600 hover:text-amber-900 underline"
            style={hw}
          >
            ログアウト
          </button>
        </div>
      )}
    </main>
  );
}
