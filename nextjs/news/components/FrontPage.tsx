import { Suspense } from "react";
import type { Card as Post, Home } from "@/lib/content";
import type {
  FeaturedModule,
  LatestModule,
  LeadModule,
  Module,
  RowLayout,
  SectionModule,
} from "@/lib/front-page";
import { Card, Ranked, SectionHead } from "./Cards";

/**
 * The front page for an arrangement (lib/front-page.ts) and the stories chosen for it (getHome).
 * Pure, so the newsroom can preview an arrangement before it is saved. Most read arrives as a
 * promise and streams in after the rest of the page.
 */
export function FrontPage({
  home,
  modules,
  mostRead,
}: {
  home: Home;
  modules: Module[];
  mostRead: Promise<Post[]> | Post[];
}) {
  return (
    <div className="home">
      {modules
        .filter((m) => !m.hidden)
        .map((m) => {
          if (m.kind === "lead") return <Lead key={m.id} module={m} home={home} />;
          if (m.kind === "featured") return <Featured key={m.id} module={m} posts={home.featured} />;
          if (m.kind === "latest")
            return <Latest key={m.id} module={m} posts={home.latest} mostRead={mostRead} />;
          return <Section key={m.id} module={m} home={home} />;
        })}
    </div>
  );
}

/** Each module is an anchor, so the newsroom's preview can scroll to the block being edited. */
const anchor = (m: Module) => ({ id: m.id, style: { scrollMarginTop: "1.5rem" } });

/** A black module sits on a full-width band. */
const tone = (m: Module, cls = "") =>
  [cls, m.tone === "black" ? "band inverse" : ""].filter(Boolean).join(" ") || undefined;

function Lead({ module: m, home }: { module: LeadModule; home: Home }) {
  if (!home.lead) return null;
  if (m.layout === "wide")
    return (
      <section {...anchor(m)} className={tone(m, "lead-module lead-wide")}>
        <Card post={home.lead} variant="lead" sizes="100vw" />
        {home.top.length ? <Ranked title="Top stories" posts={home.top} row /> : null}
      </section>
    );
  return (
    <section
      {...anchor(m)}
      className={tone(m, m.layout === "list-left" ? "lead-module split split-left" : "lead-module split")}
    >
      <div className="main">
        <Card post={home.lead} variant="lead" />
      </div>
      <div className="side">
        <Ranked title="Top stories" posts={home.top} />
      </div>
    </section>
  );
}

function Featured({ module: m, posts }: { module: FeaturedModule; posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <section {...anchor(m)} className={tone(m)}>
      <SectionHead title="Featured" />
      <Row posts={posts} layout={m.layout} />
    </section>
  );
}

function Section({ module: m, home }: { module: SectionModule; home: Home }) {
  const section = home.sections.find((s) => s.category.id === m.categoryId);
  if (!section) return null;
  const { category, posts, total } = section;
  return (
    <section {...anchor(m)} className={tone(m)}>
      <SectionHead
        title={category.name}
        href={`/category/${category.slug}`}
        more={`All ${category.name.toLowerCase()} →`}
        count={total}
      />
      <Row posts={posts} layout={m.layout} />
    </section>
  );
}

/**
 * A row of stories on the 12 columns: a big card beside two stacked ones (big-left, big-right),
 * equal cards (three, or four for Featured), or rows like the Latest river (list). With fewer than
 * three stories any layout becomes a list, so no column is left empty.
 */
function Row({ posts, layout }: { posts: Post[]; layout: RowLayout }) {
  const [first, ...rest] = posts;
  if (layout === "list" || !first || rest.length < 2)
    return (
      <div className="river narrow two">
        {posts.map((p) => (
          <Card key={p.id} post={p} variant="row" dek />
        ))}
      </div>
    );
  if (layout === "equal")
    return (
      <div className={posts.length >= 4 ? "cards compact" : "cards three compact"}>
        {posts.slice(0, 4).map((p) => (
          <Card key={p.id} post={p} />
        ))}
      </div>
    );
  return (
    <div className={`pattern pattern-${layout === "big-right" ? "c" : "a"} compact`}>
      <Card post={first} variant="big" />
      <div className="pattern-stack">
        {rest.slice(0, 2).map((p) => (
          <Card key={p.id} post={p} wide sizes="(max-width: 900px) 50vw, 33vw" />
        ))}
      </div>
    </div>
  );
}

function Latest({
  module: m,
  posts,
  mostRead,
}: {
  module: LatestModule;
  posts: Post[];
  mostRead: Promise<Post[]> | Post[];
}) {
  // Without a sidebar the river runs in two columns on wide screens, like a list row.
  const river = (
    <>
      <SectionHead title="Latest" />
      {posts.length ? null : <p className="dek">Every story is above.</p>}
      <div className={m.sidebar === "none" ? "river narrow two" : "river"}>
        {posts.map((p) => (
          <Card key={p.id} post={p} variant="row" dek />
        ))}
      </div>
    </>
  );
  if (m.sidebar === "none")
    return (
      <section {...anchor(m)} className={tone(m)}>
        {river}
      </section>
    );
  const side = m.sidebarStyle === "black" ? "side sticky panel inverse" : "side sticky";
  return (
    <section {...anchor(m)} className={tone(m, m.sidebar === "left" ? "split split-left" : "split")}>
      <div className="main">{river}</div>
      {/* Streamed: the page shell arrives first, the ranking right after. */}
      <div className={side}>
        <Suspense fallback={<Ranked title="Most read" posts={[]} reads />}>
          <MostRead posts={mostRead} />
        </Suspense>
      </div>
    </section>
  );
}

async function MostRead({ posts }: { posts: Promise<Post[]> | Post[] }) {
  return <Ranked title="Most read" posts={await posts} reads />;
}
