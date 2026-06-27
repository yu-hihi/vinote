import type { Metadata, Viewport } from "next";
import { Klee_One, Playfair_Display, Great_Vibes, Fredoka } from "next/font/google";
import "./globals.css";

const kleeOne = Klee_One({ subsets: ["latin"], weight: "400", variable: "--font-klee" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-playfair" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-great-vibes" });
const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-fredoka" });

export const metadata: Metadata = {
  title: "Vinote",
  description: "ワインの記録を、あなただけのノートに。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vinote",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#5C3A1E",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${kleeOne.variable} ${playfair.variable} ${greatVibes.variable} ${fredoka.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Klee One', cursive" }}>
        {children}
      </body>
    </html>
  );
}
