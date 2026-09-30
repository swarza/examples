import Link from "next/link";
import type { ReactNode } from "react";
import { feature } from "@/lib/features";

/** The card at the end of each page: which Next.js and swarza features it shows, and where the code is. */
export function HowItWorks({ id, children }: { id: string; children?: ReactNode }) {
  const f = feature(id);
  return (
    <aside className="how" aria-label="How this page works">
      <div className="how-head">
        <h2 className="label">How this page works</h2>
        <Link href={`/under-the-hood#${f.id}`} className="how-more">
          Under the hood →
        </Link>
      </div>
      <dl className="how-grid">
        <div>
          <dt>Next.js</dt>
          <dd>{f.next}</dd>
        </div>
        <div>
          <dt>swarza</dt>
          <dd>{f.swarza}</dd>
        </div>
        <div>
          <dt>Code</dt>
          <dd className="code-list">
            {f.code.map((c) => (
              <code key={c}>{c}</code>
            ))}
          </dd>
        </div>
      </dl>
      {children ? <div className="how-live">{children}</div> : null}
    </aside>
  );
}
