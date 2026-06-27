"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRecord, deleteRecord, saveRecord } from "@/lib/storage";
import { WineRecord } from "@/lib/types";
import NotebookPage from "@/components/NotebookPage";
import ColorPicker from "@/components/ColorPicker";
import AromaPicker from "@/components/AromaPicker";
import TastePicker from "@/components/TastePicker";
import StarRating from "@/components/StarRating";
import { LoadingPage } from "@/components/LoadingScreen";

const hw = { fontFamily: "'Klee One', cursive" } as const;
const btnBase = "transition-all duration-100 active:scale-[0.96] active:translate-y-px select-none";
const btnPrimary = `${btnBase} bg-amber-900 text-amber-50 shadow-[0_4px_0_#5a3010] active:shadow-[0_1px_0_#5a3010] hover:bg-amber-800 font-bold`;
const btnSecondary = `${btnBase} bg-amber-100 text-amber-900 border border-amber-300 shadow-[0_3px_0_#c8a060] active:shadow-[0_1px_0_#c8a060] hover:bg-amber-200`;

const SectionTitle = ({ children }: { children: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="text-xs font-bold tracking-widest text-amber-500 uppercase" style={hw}>{children}</span>
    <div className="flex-1 h-px bg-amber-200" />
  </div>
);

export default function WineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<WineRecord | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<WineRecord | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) getRecord(id).then(setRecord);
  }, [id]);

  if (!record) {
    return <LoadingPage />;
  }

  const handleDelete = async () => {
    if (confirm("このワインの記録を削除しますか？")) {
      await deleteRecord(record.id!);
      router.push("/collection");
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch("/api/generate-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wineInfo: {
            name: record.name || "Wine",
            producer: record.producer || "Unknown",
            vintage: record.vintage || "",
            region: record.region || "",
            grape: record.grape || "",
          },
          imageBase64: record.originalImageBase64 || undefined,
          mimeType: record.originalImageMime || "image/jpeg",
        }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (data.imageUrl) {
        const updated = await saveRecord({ ...record, illustrationUrl: data.imageUrl });
        setRecord(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRegenerating(false);
    }
  };

  const handleEditStart = () => {
    setForm({ ...record });
    setEditing(true);
  };

  const handleEditSave = async () => {
    if (!form) return;
    setSaving(true);
    const updated = await saveRecord(form);
    setRecord(updated);
    setEditing(false);
    setSaving(false);
  };

  const handleEditCancel = () => {
    setEditing(false);
    setForm(null);
  };

  const field = (label: string, key: keyof WineRecord, placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold text-amber-700 mb-1.5 tracking-wide uppercase" style={hw}>
        {label}
      </label>
      <input
        type="text"
        value={(form![key] as string) || ""}
        onChange={(e) => setForm((f) => f ? { ...f, [key]: e.target.value } : f)}
        placeholder={placeholder}
        className="w-full border-b-2 border-amber-300 bg-transparent px-1 py-2 text-sm text-amber-950 placeholder-amber-300 focus:outline-none focus:border-amber-700 transition-colors"
        style={hw}
      />
    </div>
  );

  return (
    <main className="min-h-screen p-4" style={{ background: "#D4B07A", paddingTop: "max(16px, env(safe-area-inset-top))", paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          {/* 戻るボタン */}
          <button
            onClick={() => router.push("/collection")}
            title="コレクションへ"
            className={`${btnBase} w-10 h-10 flex items-center justify-center rounded-full bg-amber-900/10 hover:bg-amber-900/20`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 4L7 10L13 16" stroke="#5A3A18" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {!editing && (
              <>
                {/* 編集 */}
                <button
                  onClick={handleEditStart}
                  title="編集"
                  className={`${btnBase} w-10 h-10 flex items-center justify-center rounded-full bg-amber-900/10 hover:bg-amber-900/20`}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M12.5 2.5L15.5 5.5L6.5 14.5L2.5 15.5L3.5 11.5L12.5 2.5Z" stroke="#5A3A18" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* イラスト再生成 */}
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  title="イラスト再生成"
                  className={`${btnBase} w-10 h-10 flex items-center justify-center rounded-full bg-amber-900/10 hover:bg-amber-900/20 disabled:opacity-30`}
                >
                  <svg
                    width="18" height="18" viewBox="0 0 18 18" fill="none"
                    className={regenerating ? "animate-spin" : ""}
                  >
                    <path d="M15 9A6 6 0 1 1 9 3" stroke="#5A3A18" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M9 1L9 5L13 3L9 1Z" fill="#5A3A18"/>
                  </svg>
                </button>

                {/* 削除 */}
                <button
                  onClick={handleDelete}
                  title="削除"
                  className={`${btnBase} w-10 h-10 flex items-center justify-center rounded-full bg-red-800/10 hover:bg-red-800/20`}
                >
                  <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                    <path d="M1 4H15M6 4V2H10V4M3 4L4 16H12L13 4" stroke="#9B1C1C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 閲覧モード */}
        {!editing && <NotebookPage record={record} />}

        {/* 編集モード */}
        {editing && form && (
          <div className="bg-amber-50/90 rounded-2xl shadow-xl p-6 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-amber-950" style={hw}>記録を編集</h2>
              <button onClick={handleEditCancel} className={`${btnBase} text-amber-600 text-sm hover:text-amber-900`} style={hw}>
                キャンセル
              </button>
            </div>

            <section>
              <SectionTitle>基本情報</SectionTitle>
              <div className="space-y-4">
                {field("ワイン名", "name", "例：Château Margaux")}
                {field("生産者", "producer", "例：Château Margaux")}
                <div className="grid grid-cols-2 gap-4">
                  {field("ヴィンテージ", "vintage", "例：2018")}
                  {field("ブドウ品種", "grape", "例：Cabernet Sauvignon")}
                </div>
                {field("生産国・地域", "region", "例：フランス / ボルドー")}
              </div>
            </section>

            <section>
              <SectionTitle>外観（色調）</SectionTitle>
              <ColorPicker value={form.color} onChange={(c) => setForm((f) => f ? { ...f, color: c } : f)} />
              <label className="flex items-center gap-3 mt-4 cursor-pointer select-none group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={!!form.sparkling}
                    onChange={(e) => setForm((f) => f ? { ...f, sparkling: e.target.checked } : f)}
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${form.sparkling ? "bg-amber-700 border-amber-700" : "bg-transparent border-amber-400 group-hover:border-amber-600"}`}>
                    {form.sparkling && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                </div>
                <span className="text-sm text-amber-800" style={hw}>発泡あり（スパークリング）</span>
              </label>
            </section>

            <section>
              <SectionTitle>香り</SectionTitle>
              <AromaPicker value={form.aromas} onChange={(a) => setForm((f) => f ? { ...f, aromas: a } : f)} />
            </section>

            <section>
              <SectionTitle>味わい</SectionTitle>
              <TastePicker value={form.taste} onChange={(t) => setForm((f) => f ? { ...f, taste: t } : f)} />
            </section>

            <section>
              <SectionTitle>総合評価</SectionTitle>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-700 mb-2 tracking-wide uppercase" style={hw}>好み度</label>
                  <StarRating value={form.rating} onChange={(v) => setForm((f) => f ? { ...f, rating: v } : f)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-700 mb-1.5 tracking-wide uppercase" style={hw}>ペアリング料理</label>
                  <textarea
                    value={form.pairing}
                    onChange={(e) => setForm((f) => f ? { ...f, pairing: e.target.value } : f)}
                    placeholder="例：牛ステーキ、チーズの盛り合わせ"
                    rows={2}
                    className="w-full border-b-2 border-amber-300 bg-transparent px-1 py-2 text-sm text-amber-950 placeholder-amber-300 focus:outline-none focus:border-amber-700 transition-colors resize-none"
                    style={hw}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-700 mb-1.5 tracking-wide uppercase" style={hw}>メモ・感想</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => f ? { ...f, notes: e.target.value } : f)}
                    placeholder="自由記述..."
                    rows={3}
                    className="w-full border-b-2 border-amber-300 bg-transparent px-1 py-2 text-sm text-amber-950 placeholder-amber-300 focus:outline-none focus:border-amber-700 transition-colors resize-none"
                    style={hw}
                  />
                </div>
              </div>
            </section>

            <button
              onClick={handleEditSave}
              disabled={saving}
              className={`${btnPrimary} w-full py-4 rounded-xl text-base disabled:opacity-40 disabled:shadow-none`}
              style={hw}
            >
              {saving ? "保存中..." : "変更を保存する"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
