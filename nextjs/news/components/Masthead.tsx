import Link from "next/link";
import { getCategories } from "@/lib/content";
import { edition } from "@/lib/format";
import { NavLinks } from "./NavLinks";

export async function Masthead() {
  const categories = await getCategories();
  return (
    <header className="masthead">
      <div className="wrap">
        <div className="mast-top">
          <Link href="/" className="logo" aria-label="Dispatch, home">
            Dispatch<em>.</em>
          </Link>
          <div className="mast-meta">
            <span className="mast-date">{edition(Date.now())}</span>
            <span className="mast-links">
              <Link href="/search">Search</Link>
              <Link href="/about" className="mast-more">
                About
              </Link>
              <Link href="/contact" className="mast-more">
                Contact
              </Link>
            </span>
          </div>
        </div>
        <NavLinks
          className="nav"
          links={[
            { href: "/", label: "Front page" },
            ...categories.map((c) => ({ href: `/category/${c.slug}`, label: c.name })),
          ]}
        />
      </div>
    </header>
  );
}

export async function Footer() {
  const categories = await getCategories();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-inner">
          <div className="footer-brand">
            <Link href="/" className="logo">
              Dispatch<em>.</em>
            </Link>
            <p>
              A demo newsroom running on swarza: Next.js pages cached at the edge, a database for the stories,
              a storage bucket for the images and scheduled jobs that publish them. The stories are made up.
            </p>
          </div>
          <ul>
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
          <ul>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/search">Search</Link>
            </li>
            <li>
              <a href="/rss.xml">RSS</a>
            </li>
            <li>
              <Link href="/admin">Newsroom sign-in</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
