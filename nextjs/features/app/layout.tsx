import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: { default: "swarza + Next.js", template: "%s · swarza" } };

const pages = [
  ["/", "Home"],
  ["/ssr", "SSR"],
  ["/isr", "ISR"],
  ["/blog/hello", "Blog"],
  ["/streaming", "Streaming"],
  ["/actions", "Server Actions"],
  ["/image", "Image"],
  ["/api/hello", "API"],
  ["/guestbook", "Guestbook (database)"],
  ["/db", "Database timings"],
  ["/api/db", "Database timings (JSON)"],
  ["/uploads", "Uploads (storage)"],
  ["/api/storage", "Storage timings (JSON)"],
] as const;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}
      >
        <nav style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          {pages.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        {children}
      </body>
    </html>
  );
}
