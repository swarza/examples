import Link from "next/link";
import type { Card as Post } from "@/lib/content";
import { Byline, Kicker } from "./Byline";
import { Cover } from "./Cover";

/** Keeps hyphenated words such as "late-night" on one line in headlines. */
const keepHyphens = (title: string) =>
  title.split(/(\S+-\S+)/).map((part, i) =>
    i % 2 ? (
      <span key={i} className="nobr">
        {part}
      </span>
    ) : (
      part
    ),
  );

type Variant = "card" | "row" | "lead" | "big";

/**
 * One anatomy for every story: cover, kicker, headline, (standfirst), byline.
 * card: cover above. row: cover to the right. lead: the front page's big story. big: the large
 * card of a section. `wide` gives a card the 2:1 cover instead of 3:2.
 */
export function Card({
  post,
  variant = "card",
  dek = false,
  wide = false,
  sizes,
}: {
  post: Post;
  variant?: Variant;
  dek?: boolean;
  wide?: boolean;
  sizes?: string;
}) {
  const lead = variant === "lead";
  const Title = lead ? "h1" : "h3";
  return (
    <article className={`card card-${variant}`}>
      <Link href={`/post/${post.slug}`} className="media" tabIndex={-1} aria-hidden>
        <Cover
          coverKey={post.coverKey}
          alt={post.coverAlt}
          title={post.title}
          wide={lead || wide}
          priority={lead}
          sizes={
            sizes ??
            (lead
              ? "(max-width: 900px) 100vw, 75vw"
              : variant === "big"
                ? "(max-width: 900px) 100vw, 66vw"
                : variant === "row"
                  ? "240px"
                  : undefined)
          }
        />
      </Link>
      <div className="body">
        <Kicker post={post} />
        <Title className="title">
          <Link href={`/post/${post.slug}`}>{keepHyphens(post.title)}</Link>
        </Title>
        {dek || lead || variant === "big" ? <p className="dek">{post.dek}</p> : null}
        <Byline post={post} />
      </div>
    </article>
  );
}

/** The heading every module starts with: a rule, a title and, optionally, a count and a link. */
export function SectionHead({
  title,
  href,
  more,
  count,
}: {
  title: string;
  href?: string;
  more?: string;
  count?: number;
}) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {href ? (
        <p className="section-more">
          {count ? (
            <span className="count">
              {count} {count === 1 ? "story" : "stories"} ·{" "}
            </span>
          ) : null}
          <Link href={href}>{more}</Link>
        </p>
      ) : null}
    </div>
  );
}

/**
 * A numbered list of headlines: the lead's top stories and the most read. `row` lays the list out
 * in three columns, for the lead across the page.
 */
export function Ranked({
  title,
  posts,
  reads = false,
  row = false,
}: {
  title: string;
  posts: Post[];
  reads?: boolean;
  row?: boolean;
}) {
  // Most read ends each story with a bar: its reads as a share of the top story's.
  const most = Math.max(1, ...posts.map((p) => p.reads7d));
  const cls = `ranked${reads ? " ranked-reads" : ""}${row ? " ranked-row" : ""}`;
  return (
    <section className={cls} aria-busy={posts.length ? undefined : true}>
      <SectionHead title={title} />
      <ol>
        {posts.map((p) => (
          <li key={p.id}>
            <div className="body">
              {reads ? null : <Kicker post={p} />}
              <h3 className="title">
                <Link href={`/post/${p.slug}`}>{keepHyphens(p.title)}</Link>
              </h3>
              {reads ? (
                <>
                  <p className="byline">{p.reads7d.toLocaleString("en-GB")} reads this week</p>
                  <span className="bar" aria-hidden>
                    <span style={{ width: `${Math.round((p.reads7d / most) * 100)}%` }} />
                  </span>
                </>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
