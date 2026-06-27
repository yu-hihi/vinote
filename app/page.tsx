"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import VinoteLogo from "@/components/VinoteLogo";

export default function SplashPage() {
  const router = useRouter();
  const [fading, setFading] = useState(false);

  const handleTap = async () => {
    if (fading) return;
    setFading(true);
    const { data: { user } } = await createClient().auth.getUser();
    setTimeout(() => {
      router.push(user ? "/collection" : "/login");
    }, 800);
  };

  return (
    <main
      onClick={handleTap}
      className="h-screen flex items-center justify-center cursor-pointer select-none"
      style={{
        background: "#D4B07A",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.8s ease",
      }}
    >
      <div className="flex flex-col items-center" style={{ marginTop: "-100px" }}>
        <VinoteLogo style={{ width: "70vw", maxWidth: "360px", height: "auto" }} />
        <p style={{ marginTop: "-104px", fontFamily: "var(--font-fredoka), sans-serif", color: "#7B1515", fontSize: "0.85rem", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
          Take your note for your wine life
        </p>
      </div>
    </main>
  );
}
