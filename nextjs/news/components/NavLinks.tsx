"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Links that mark the current page (the rest of the masthead is rendered on the server). */
export function NavLinks({
  links,
  className,
}: {
  links: { href: string; label: string }[];
  className?: string;
}) {
  const path = usePathname();
  return (
    <nav className={className} aria-label="Sections">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={
            path === l.href || (l.href !== "/" && l.href !== "/admin" && path.startsWith(`${l.href}/`))
              ? "page"
              : undefined
          }
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
