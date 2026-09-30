import type { Metadata } from "next";
import { Card } from "@/components/Cards";
import { search } from "@/lib/content";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").slice(0, 100);
  const results = q ? await search(q) : [];
  return (
    <div className="page">
      <div className="page-head">
        <span className="kicker">Search</span>
        <h1>Find a story.</h1>
        <form className="form" action="/search" role="search">
          <label>
            Headlines, standfirsts and stories
            <input type="search" name="q" defaultValue={q} placeholder="heat pumps" autoFocus />
          </label>
        </form>
      </div>
      {q ? (
        <p className="result-count">
          {results.length} result{results.length === 1 ? "" : "s"} for “{q}”
        </p>
      ) : null}
      <div className="river narrow">
        {results.map((p) => (
          <Card key={p.id} post={p} variant="row" dek />
        ))}
      </div>
    </div>
  );
}
