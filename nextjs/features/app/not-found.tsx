import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <div className="page-head">
        <p className="kicker">404</p>
        <h1>Not on the program</h1>
        <p className="dek">
          There is no page here. The <Link href="/schedule">schedule</Link> lists every talk.
        </p>
      </div>
    </div>
  );
}
