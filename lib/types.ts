export const WINE_COLORS = {
  red: [
    { name: "紫", hex: "#5A244E" },
    { name: "青みがかった赤", hex: "#942327" },
    { name: "チェリーレッド", hex: "#A72026" },
    { name: "ルビー色", hex: "#C61118" },
    { name: "赤色", hex: "#E50012" },
    { name: "ガーネット", hex: "#8A2A1A" },
    { name: "れんが色", hex: "#BA461D" },
    { name: "マホガニー色", hex: "#752321" },
  ],
  rose: [
    { name: "灰色", hex: "#D9D4D1" },
    { name: "ベージュ", hex: "#EAD5C3" },
    { name: "明るいピンク", hex: "#F7C1C5" },
    { name: "オレンジピンク", hex: "#F7C9A4" },
    { name: "サーモンピンク", hex: "#EFA37F" },
    { name: "玉ねぎ色", hex: "#D38D53" },
    { name: "濃いピンク", hex: "#F08390" },
    { name: "明るいれんが色", hex: "#CE7A5C" },
  ],
  white: [
    { name: "無色", hex: "#ECEBE4" },
    { name: "グリーン", hex: "#D5E0BF" },
    { name: "レモンイエロー", hex: "#E6EEB4" },
    { name: "麦わら色", hex: "#ECE19A" },
    { name: "黄色", hex: "#F4E47A" },
    { name: "黄金色", hex: "#E8D465" },
    { name: "金色", hex: "#C9B341" },
    { name: "トパーズ色", hex: "#BC9A2C" },
    { name: "琥珀色", hex: "#C38515" },
  ],
  orange: [
    { name: "淡いオレンジ", hex: "#F5C97A" },
    { name: "蛍黄", hex: "#EFC84A" },
    { name: "黄橙色", hex: "#E8A832" },
    { name: "明るい琥珀", hex: "#D4922A" },
    { name: "アンバー", hex: "#C07820" },
    { name: "濃い琥珀", hex: "#A86018" },
    { name: "銅色", hex: "#B5541A" },
    { name: "鮮やかな銅色", hex: "#C84A14" },
    { name: "れんが橙", hex: "#B8401A" },
    { name: "赤みがかった琥珀", hex: "#9E3A18" },
    { name: "赤橙色", hex: "#B43018" },
    { name: "黄褐色", hex: "#9E7040" },
    { name: "赤褐色", hex: "#8A3820" },
    { name: "蜂蜜色", hex: "#D4962A" },
    { name: "ピンクがかったオレンジ", hex: "#D4886A" },
  ],
} as const;

export const AROMA_CATEGORIES = [
  {
    name: "フルーツ系（フレッシュ）",
    items: ["レモン","ライム","グレープフルーツ","オレンジ","ミカン","ラズベリー","ブラックベリー","ブルーベリー","カシス","イチゴ","赤リンゴ","青リンゴ","梅","洋梨","白桃","黄桃","プラム","サクランボ","ダークチェリー","マスカット","アンズ","メロン","ライチ","パイナップル","キウイ","パパイヤ","バナナ"],
  },
  {
    name: "フルーツ系（加熱乾燥）",
    items: ["ジャム","マーマレード","フルーツグミ","フルーツキャンディー","干しぶどう","干しイチジク","プルーン","コンポート"],
  },
  {
    name: "フラワー系",
    items: ["スミレ","バラ","ジャスミン","アカシア","ライラック","菩提樹","ラベンダー","スズラン","カモミール","ユリ","木蓮","クチナシ","オレンジの花","キンモクセイ"],
  },
  {
    name: "植物系",
    items: ["ピーマン","干し草","玉ネギ","オリーブ","芝生","ペパーミント","タイム","ローズマリー","オレガノ","セージ","レモングラス"],
  },
  {
    name: "樹木系（含ロースト香）",
    items: ["松","杉","樫","松ヤニ","コーヒー","白檀","チョコレート","アーモンド","ヘーゼルナッツ","キャラメル","スモーク","お香","炭","葉巻","鉛筆の削りカス","ハチミツ"],
  },
  {
    name: "動物系",
    items: ["生肉","ジビエ","ベーコン","ムスク","革","醤油"],
  },
  {
    name: "香辛料系",
    items: ["ブラックペッパー","ホワイトペッパー","グリーンペッパー","ピンクペッパー","ゴマ","甘草","ナツメグ","カレー粉","シナモン","ショウガ","丁子（クローブ）","八角","バニラ"],
  },
  {
    name: "化学系",
    items: ["石油","ゴム","石鹸","金属","火打石","プラスチック","ろう","ワックス","アスファルト","ミネラル（鉱物）","白粉（おしろい）","インク","ヨード"],
  },
  {
    name: "土系",
    items: ["タバコ","枯葉","苔","マッシュルーム","トリュフ","腐葉土"],
  },
  {
    name: "微生物系",
    items: ["バター","ヨーグルト","チーズ","イースト（酵母）","食パン","ビスケット","ブリオッシュ","バターケーキ","トースト"],
  },
] as const;

export interface TasteProfile {
  sweetness: number;   // 甘味 0-5
  acidity: number;     // 酸味 0-5
  finish: number;      // 余韻の長さ 0-5
  tannin: number;      // 渋み・苦味 0-5
  body: number;        // ボディ 0-5
}

export interface WineColor {
  name: string;
  hex: string;
}

export type WineCategory = "sparkling" | "red" | "white" | "orange" | "rose" | "unknown";

export function getWineCategory(record: { color: WineColor | null; sparkling?: boolean }): WineCategory {
  if (record.sparkling) return "sparkling";
  if (!record.color) return "unknown";
  const hex = record.color.hex;
  for (const [cat, colors] of Object.entries(WINE_COLORS)) {
    if ((colors as readonly { hex: string }[]).some((c) => c.hex === hex)) {
      return cat as WineCategory;
    }
  }
  return "unknown";
}

export const CATEGORY_LABELS: Record<WineCategory, string> = {
  sparkling: "泡",
  red: "赤",
  white: "白",
  orange: "オレンジ",
  rose: "ロゼ",
  unknown: "未分類",
};

export interface WineRecord {
  id?: string;
  // 基本情報
  name: string;
  producer: string;
  region: string;
  grape: string;
  vintage: string;
  // 外観
  color: WineColor | null;
  sparkling?: boolean;
  // 香り
  aromas: string[];
  // 味わい
  taste: TasteProfile;
  // 総合評価
  rating: number;       // 1-5 (0.5刻み)
  pairing: string;
  // 画像
  originalImageUrl?: string;
  originalImageBase64?: string;
  originalImageMime?: string;
  illustrationUrl?: string;
  wineInfo?: {
    name: string;
    producer: string;
    vintage: string;
    region: string;
    grape: string;
  };
  // メモ
  notes?: string;
  createdAt?: string;
}
