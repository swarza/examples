import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap page">
      <div className="page-head">
        <span className="kicker">404</span>
        <h1>Not in this edition.</h1>
        <p className="dek">
          That page doesn&apos;t exist, or the story was taken down.{" "}
          <Link href="/">Back to the front page</Link>.
        </p>
      </div>
    </main>
  );
}
