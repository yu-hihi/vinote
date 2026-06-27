"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CameraCapture from "@/components/CameraCapture";
import ColorPicker from "@/components/ColorPicker";
import AromaPicker from "@/components/AromaPicker";
import TastePicker from "@/components/TastePicker";
import StarRating from "@/components/StarRating";
import { WineRecord, TasteProfile } from "@/lib/types";
import { saveRecord } from "@/lib/storage";
import { compressImage } from "@/lib/compressImage";
import { LoadingInline } from "@/components/LoadingScreen";

const defaultTaste: TasteProfile = { sweetness: 0, acidity: 0, finish: 0, tannin: 0, body: 0 };

const hw = { fontFamily: "'Klee One', cursive" } as const;

/* 押した感のあるボタン共通クラス */
const btnBase =
  "transition-all duration-100 active:scale-[0.96] active:translate-y-px select-none";
const btnPrimary =
  `${btnBase} bg-amber-900 text-amber-50 shadow-[0_4px_0_#5a3010] active:shadow-[0_1px_0_#5a3010] hover:bg-amber-800 font-bold`;
const btnSecondary =
  `${btnBase} bg-amber-100 text-amber-900 border border-amber-300 shadow-[0_3px_0_#c8a060] active:shadow-[0_1px_0_#c8a060] hover:bg-amber-200`;

export default function AddPage() {
  const router = useRouter();
  const [step, setStep] = useState<"camera" | "form" | "saving">("camera");
  const [identifying, setIdentifying] = useState(false);
  const [identifyResult, setIdentifyResult] = useState<"ok" | "fail" | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [capturedMime, setCapturedMime] = useState("image/jpeg");
  const [illustrationUrl, setIllustrationUrl] = useState<string | null>(null);

  const [form, setForm] = useState<WineRecord>({
    name: "", producer: "", region: "", grape: "", vintage: "",
    color: null, aromas: [], taste: defaultTaste, rating: 0, pairing: "", notes: "",
  });

  const handleCapture = async (base64: string, mimeType: string) => {
    const compressed = await compressImage(base64, mimeType);
    setCapturedBase64(compressed.base64);
    setCapturedMime(compressed.mimeType);
    setIdentifying(true);
    try {
      const res = await fetch("/api/identify-wine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = await res.json();
      if (data.success && data.wine && Object.values(data.wine).some(Boolean)) {
        setForm((f) => ({
          ...f,
          name: data.wine.name || f.name,
          producer: data.wine.producer || f.producer,
          vintage: data.wine.vintage || f.vintage,
          region: data.wine.region || f.region,
          grape: data.wine.grape || f.grape,
        }));
        setIdentifyResult("ok");
      } else {
        setIdentifyResult("fail");
      }
    } catch (e) {
      console.error(e);
      setIdentifyResult("fail");
    } finally {
      setIdentifying(false);
      setStep("form");
    }
  };

  const handleGenerateArt = async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/generate-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wineInfo: {
            name: form.name || "Wine",
            producer: form.producer || "Unknown",
            vintage: form.vintage || "",
            region: form.region || "",
            grape: form.grape || "",
          },
          imageBase64: capturedBase64 || undefined,
          mimeType: capturedMime || "image/jpeg",
        }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (data.imageUrl) {
        setIllustrationUrl(data.imageUrl);
      } else if (data.error) {
        setGenerateError(data.error);
      }
    } catch (e) {
      setGenerateError(String(e));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setStep("saving");
    const record = await saveRecord({
      ...form,
      illustrationUrl: illustrationUrl || undefined,
      originalImageBase64: capturedBase64 || undefined,
      originalImageMime: capturedMime || undefined,
    });
    router.push(`/wine/${record.id}`);
  };

  const field = (label: string, key: keyof WineRecord, placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold text-amber-700 mb-1.5 tracking-wide uppercase" style={hw}>
        {label}
      </label>
      <input
        type="text"
        value={(form[key] as string) || ""}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full border-b-2 border-amber-300 bg-transparent px-1 py-2 text-sm text-amber-950 placeholder-amber-300 focus:outline-none focus:border-amber-700 transition-colors"
        style={hw}
      />
    </div>
  );

  const SectionTitle = ({ children }: { children: string }) => (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-bold tracking-widest text-amber-500 uppercase" style={hw}>{children}</span>
      <div className="flex-1 h-px bg-amber-200" />
    </div>
  );

  return (
    <main className="min-h-screen p-4" style={{ background: "#D4B07A", paddingTop: "max(16px, env(safe-area-inset-top))", paddingBottom: "max(80px, env(safe-area-inset-bottom))" }}>
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/collection")}
            className={`${btnBase} text-amber-800 hover:text-amber-950 text-sm`}
            style={hw}
          >
            ← 戻る
          </button>
          <h1 className="text-2xl font-bold text-amber-950" style={hw}>新しいワインを記録</h1>
        </div>

        <div className="bg-amber-50/90 rounded-2xl shadow-xl p-6 space-y-8">

          {/* ステップ1: カメラ */}
          {step === "camera" && (
            <div className="space-y-4">
              <SectionTitle>ボトルを撮影</SectionTitle>
              <p className="text-sm text-amber-700" style={hw}>
                ラベルが見えるように撮影してください。AIが情報を自動入力します。
              </p>
              <CameraCapture onCapture={handleCapture} />
              {identifying && <LoadingInline label="ワインを認識中..." />}
              <button
                onClick={() => setStep("form")}
                className={`${btnSecondary} w-full py-2.5 rounded-xl text-sm`}
                style={hw}
              >
                撮影をスキップして手動入力
              </button>
            </div>
          )}

          {/* 認識結果バナー */}
          {identifyResult === "ok" && (
            <div className="bg-green-50 border border-green-300 rounded-xl px-4 py-3 text-sm text-green-800" style={hw}>
              ワインを認識しました。内容を確認・修正してください。
            </div>
          )}
          {identifyResult === "fail" && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-sm text-amber-800" style={hw}>
              自動認識できませんでした。手動で入力してください。
            </div>
          )}

          {/* ステップ2: フォーム */}
          {step === "form" && (
            <div className="space-y-8">

              {/* 水彩イラスト（最上部） */}
              <section>
                <SectionTitle>水彩イラスト</SectionTitle>
                {illustrationUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={illustrationUrl} alt="illustration" className="max-h-64 object-contain rounded-xl shadow-md" />
                    <button
                      onClick={handleGenerateArt}
                      disabled={generating}
                      className={`${btnSecondary} px-5 py-2 rounded-xl text-sm disabled:opacity-40`}
                      style={hw}
                    >
                      再生成する
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <button
                      onClick={handleGenerateArt}
                      disabled={generating || !form.name}
                      className={`${btnPrimary} px-8 py-3 rounded-xl disabled:opacity-40 disabled:shadow-none disabled:translate-y-0`}
                      style={hw}
                    >
                      {generating ? "生成中... (30秒ほどかかります)" : "水彩イラストを生成する"}
                    </button>
                    {!form.name && (
                      <p className="text-xs text-amber-400" style={hw}>ワイン名を入力してから生成できます</p>
                    )}
                    {generateError && (
                      <p className="text-xs text-red-600 max-w-xs mx-auto" style={hw}>
                        エラー: {generateError}
                      </p>
                    )}
                  </div>
                )}
              </section>

              {/* 基本情報 */}
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

              {/* 外観 */}
              <section>
                <SectionTitle>外観（色調）</SectionTitle>
                <ColorPicker value={form.color} onChange={(c) => setForm((f) => ({ ...f, color: c }))} />
                <label className="flex items-center gap-3 mt-4 cursor-pointer select-none group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={!!form.sparkling}
                      onChange={(e) => setForm((f) => ({ ...f, sparkling: e.target.checked }))}
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${form.sparkling ? "bg-amber-700 border-amber-700" : "bg-transparent border-amber-400 group-hover:border-amber-600"}`}>
                      {form.sparkling && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  </div>
                  <span className="text-sm text-amber-800" style={hw}>発泡あり（スパークリング）</span>
                </label>
              </section>

              {/* 香り */}
              <section>
                <SectionTitle>香り</SectionTitle>
                <AromaPicker value={form.aromas} onChange={(a) => setForm((f) => ({ ...f, aromas: a }))} />
              </section>

              {/* 味わい */}
              <section>
                <SectionTitle>味わい</SectionTitle>
                <TastePicker value={form.taste} onChange={(t) => setForm((f) => ({ ...f, taste: t }))} />
              </section>

              {/* 総合評価 */}
              <section>
                <SectionTitle>総合評価</SectionTitle>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-amber-700 mb-2 tracking-wide uppercase" style={hw}>好み度</label>
                    <StarRating value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-700 mb-1.5 tracking-wide uppercase" style={hw}>ペアリング料理</label>
                    <textarea
                      value={form.pairing}
                      onChange={(e) => setForm((f) => ({ ...f, pairing: e.target.value }))}
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
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="自由記述..."
                      rows={3}
                      className="w-full border-b-2 border-amber-300 bg-transparent px-1 py-2 text-sm text-amber-950 placeholder-amber-300 focus:outline-none focus:border-amber-700 transition-colors resize-none"
                      style={hw}
                    />
                  </div>
                </div>
              </section>

              {/* 保存ボタン */}
              <button
                onClick={handleSave}
                className={`${btnPrimary} w-full py-4 rounded-xl text-base`}
                style={hw}
              >
                ノートに保存する
              </button>
            </div>
          )}

          {step === "saving" && <LoadingInline label="保存中..." />}
        </div>
      </div>
    </main>
  );
}
