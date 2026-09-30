import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/Cards";
import { getAuthor } from "@/lib/content";

export const revalidate = 300;
export const generateStaticParams = async () => [];

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getAuthor((await params).slug);
  return data ? { title: data.author.name } : {};
}

export default async function AuthorPage({ params }: Props) {
  const data = await getAuthor((await params).slug);
  if (!data) notFound();
  return (
    <div className="page">
      <div className="page-head">
        <span className="kicker">
          Writer · {data.posts.length} {data.posts.length === 1 ? "story" : "stories"}
        </span>
        <h1>{data.author.name}</h1>
        {data.author.bio ? <p className="dek">{data.author.bio}</p> : null}
      </div>
      <div className="river narrow">
        {data.posts.map((p) => (
          <Card key={p.id} post={p} variant="row" dek />
        ))}
      </div>
    </div>
  );
}
