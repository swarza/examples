"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** The section links; the one for the current page is marked (the rest of the header renders on the server). */
export function NavLinks({ links }: { links: { href: string; label: string; match?: string }[] }) {
  const path = usePathname();
  const nav = useRef<HTMLElement>(null);
  // On a phone the nav scrolls sideways: bring the current section into view.
  useEffect(() => {
    const el = nav.current;
    const current = el?.querySelector<HTMLElement>('[aria-current="page"]');
    if (el && current) el.scrollLeft = current.offsetLeft - el.offsetLeft - 16;
  }, [path]);
  return (
    <nav className="nav" aria-label="Sections" ref={nav}>
      {links.map((l) => {
        const base = l.match ?? l.href;
        const current = path === base || (base !== "/" && path.startsWith(`${base}/`));
        return (
          <Link key={l.href} href={l.href} aria-current={current ? "page" : undefined}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
