import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { ReactNode } from "react";
import { Toaster } from "./_components/ui/sonner";
import { TooltipProvider } from "./_components/ui/tooltip";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Dispatch admin", template: "%s · Dispatch admin" },
  robots: { index: false, follow: false },
};

/** Applies the saved or system colour scheme before first paint, so pages never flash. */
const themeScript = `try{var t=localStorage.getItem("admin-theme");document.documentElement.classList.toggle("dark",t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))}catch(e){}`;

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-svh font-sans">
        <TooltipProvider delay={300}>{children}</TooltipProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
