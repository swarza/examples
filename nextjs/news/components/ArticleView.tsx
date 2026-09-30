import Link from "next/link";
import type { Article, Card as Post } from "@/lib/content";
import { longDate } from "@/lib/format";
import { readingMinutes, renderMarkdown } from "@/lib/markdown";
import { Kicker } from "./Byline";
import { Card, SectionHead } from "./Cards";
import { Cover } from "./Cover";

/** A story as its page shows it: used by /post/[slug] and by the editors' preview. */
export function ArticleView({ post, related }: { post: Article; related: Post[] }) {
  return (
    <article className="article">
      <header className="article-head">
        <Kicker post={post} />
        <h1>{post.title}</h1>
        <p className="dek">{post.dek}</p>
      </header>
      <Cover
        coverKey={post.coverKey}
        alt={post.coverAlt}
        title={post.title}
        priority
        wide
        sizes="(max-width: 1280px) 100vw, 1280px"
      />
      <div className="article-body">
        <dl className="article-meta">
          <div>
            <dt>By</dt>
            <dd>
              {post.author ? (
                <Link href={`/author/${post.author.slug}`}>{post.author.name}</Link>
              ) : (
                "Dispatch"
              )}
            </dd>
          </div>
          <div>
            <dt>Published</dt>
            <dd>{post.publishedAt ? longDate(post.publishedAt) : "Not yet"}</dd>
          </div>
          <div>
            <dt>Length</dt>
            <dd>{readingMinutes(post.body)} min read</dd>
          </div>
        </dl>
        <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
      </div>
      {related.length ? (
        <section className="related">
          <SectionHead title="Read next" />
          <div className="cards three compact">
            {related.map((p) => (
              <Card key={p.id} post={p} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
