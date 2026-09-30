import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">404</p>
        <h1>Not on the program</h1>
        <p className="lead">
          There is no page here. The <Link href="/schedule">schedule</Link> lists every talk.
        </p>
      </header>
    </div>
  );
}
