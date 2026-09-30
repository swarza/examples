import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import { Footer, Masthead } from "@/components/Masthead";
import "./globals.css";

const serif = Newsreader({ subsets: ["latin"], variable: "--font-serif", style: ["normal", "italic"] });
const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { default: "Dispatch", template: "%s · Dispatch" },
  description: "A demo newsroom on swarza: Next.js, a database, a storage bucket and scheduled jobs.",
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <Masthead />
        <main className="wrap">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
