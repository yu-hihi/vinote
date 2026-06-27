"use client";

import { useRef, useState } from "react";

interface Props {
  onCapture: (base64: string, mimeType: string) => void;
}

/** どんな画像フォーマットでもCanvas経由でJPEGに変換 */
function toJpeg(file: File): Promise<{ base64: string; preview: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const maxW = 1600;
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      resolve({ base64: dataUrl.split(",")[1], preview: dataUrl });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function CameraCapture({ onCapture }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    try {
      const { base64, preview } = await toJpeg(file);
      setPreview(preview);
      onCapture(base64, "image/jpeg");
    } catch {
      alert("画像の読み込みに失敗しました。別の画像をお試しください。");
    }
  };

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-dashed border-amber-400 rounded-xl p-6 text-center cursor-pointer hover:bg-amber-50 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="preview" className="max-h-48 mx-auto rounded object-contain" />
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📷</div>
            <p className="text-amber-800 text-sm" style={{ fontFamily: "'Klee One', cursive" }}>
              ワインボトルを撮影 / 画像を選択
            </p>
            <p className="text-amber-500 text-xs">HEIC・JPG・PNG・どの形式でも対応</p>
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {preview && (
        <button
          type="button"
          className="text-xs text-amber-600 underline"
          onClick={() => {
            setPreview(null);
            if (fileRef.current) fileRef.current.value = "";
          }}
        >
          画像をリセット
        </button>
      )}
    </div>
  );
}
