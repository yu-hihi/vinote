import WineGlassLoader from "./WineGlassLoader";

const hw = { fontFamily: "'Klee One', cursive" } as const;

/** インライン用（フォームの中など小スペース） */
export function LoadingInline({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <WineGlassLoader />
      <p className="text-sm text-amber-700/70" style={hw}>{label}</p>
    </div>
  );
}

/** フルページ用（画面全体を占有するローディング） */
export function LoadingPage({ label = "読み込み中..." }: { label?: string }) {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-5"
      style={{ background: "#D4B07A" }}
    >
      <WineGlassLoader />
      <p className="text-sm text-amber-700/70" style={hw}>{label}</p>
    </main>
  );
}
