import type { Metadata } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/Navbar";

const banglaFont = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-bn",
});

export const metadata: Metadata = {
  title: {
    default: "NWU IAN — ব্লগ",
    template: "%s — NWU IAN",
  },
  description:
    "NWU ইসলামিক অ্যাওয়ারনেস নেটওয়ার্ক (NWU IAN) — ইসলামি সচেতনতা, দাওয়াহ, সমাজ উন্নয়ন ও নৈতিক শিক্ষার বাংলা ব্লগ।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={banglaFont.variable}>
      <body className="min-h-dvh font-sans">
        <div className="min-h-dvh bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-slate-950 dark:to-slate-950">
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
          <footer className="border-t border-[rgb(var(--border))] bg-white/60 py-8 text-center text-sm text-slate-600 dark:bg-slate-950/40 dark:text-slate-300">
            <div className="mx-auto max-w-6xl px-4">
              © {new Date().getFullYear()} NWU ইসলামিক অ্যাওয়ারনেস নেটওয়ার্ক (NWU IAN) — সর্বস্বত্ব সংরক্ষিত
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
