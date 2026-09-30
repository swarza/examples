import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { Footer, Header } from "@/components/Site";
import { HINTS_KEY } from "@/lib/features";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});
const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: { default: "Hydrate 26, a one-day web conference", template: "%s · Hydrate 26" },
  description:
    "A made-up conference site that shows Next.js on swarza: static and ISR pages, streaming, Server Actions, images, a database and a storage bucket.",
};

// Hides the feature dots before the first paint when the visitor turned them off last time.
const hintsPref = `try{if(localStorage.getItem(${JSON.stringify(HINTS_KEY)})==="off")document.documentElement.dataset.hints="off"}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: hintsPref }} />
      </head>
      <body>
        <Header />
        <main className="wrap">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
