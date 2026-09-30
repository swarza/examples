import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/Cards";
import { getCategoryPage, PAGE_SIZE } from "@/lib/content";

/** Rendered per request (it reads ?page=), from the data cache. */
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getCategoryPage((await params).slug, 1);
  return data ? { title: data.category.name, description: data.category.description } : {};
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const data = await getCategoryPage(slug, page);
  if (!data) notFound();
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  return (
    <div className="page">
      <div className="page-head">
        <span className="kicker">
          Section · {data.total} {data.total === 1 ? "story" : "stories"}
        </span>
        <h1>{data.category.name}</h1>
        {data.category.description ? <p className="dek">{data.category.description}</p> : null}
      </div>
      {data.posts.length ? (
        <div className="river narrow">
          {data.posts.map((p) => (
            <Card key={p.id} post={p} variant="row" dek />
          ))}
        </div>
      ) : (
        <p className="dek">Nothing here yet.</p>
      )}
      {pages > 1 ? (
        <nav className="pager" aria-label="Pages">
          {page > 1 ? <Link href={`/category/${slug}?page=${page - 1}`}>← Newer</Link> : <span />}
          <span>
            Page {page} of {pages}
          </span>
          {page < pages ? <Link href={`/category/${slug}?page=${page + 1}`}>Older →</Link> : <span />}
        </nav>
      ) : null}
    </div>
  );
}
