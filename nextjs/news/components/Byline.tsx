import Link from "next/link";
import type { Card } from "@/lib/content";
import { ago } from "@/lib/format";

export function Byline({ post, when = true }: { post: Card; when?: boolean }) {
  return (
    <p className="byline">
      {post.author ? <Link href={`/author/${post.author.slug}`}>{post.author.name}</Link> : "Dispatch"}
      {when && post.publishedAt ? <> · {ago(post.publishedAt)}</> : null}
    </p>
  );
}

export function Kicker({ post }: { post: Card }) {
  return post.category ? (
    <Link href={`/category/${post.category.slug}`} className="kicker">
      {post.category.name}
    </Link>
  ) : null;
}
