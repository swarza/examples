import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import type { ReactNode } from "react";
import { Footer, Masthead } from "@/components/Site";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});
const serif = IBM_Plex_Serif({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  weight: ["400", "500"],
  style: ["normal", "italic"],
});
const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: { default: "Hydrate 26, a one-day web conference", template: "%s · Hydrate 26" },
  description:
    "A made-up conference site that shows Next.js on swarza: static and ISR pages, streaming, Server Actions, images, a database and a storage bucket.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <Masthead />
        <main className="wrap">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
