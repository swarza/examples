import type { ReactNode } from "react";
import type { HintId } from "@/lib/features";
import { FeatureHint } from "./FeatureHint";

/** What a page shows when the database or bucket it needs is not bound yet. */
export function Notice({ title, hint, children }: { title: string; hint?: HintId; children: ReactNode }) {
  return (
    <div className="notice" role="status">
      <span className="label">Not set up yet</span>
      <h2>
        {title}
        {hint ? <FeatureHint id={hint} /> : null}
      </h2>
      <div className="notice-body">{children}</div>
    </div>
  );
}

export function NeedsDatabase({ what, hint }: { what: string; hint?: HintId }) {
  return (
    <Notice title="Bind a database to see this" hint={hint}>
      <p>
        {what} In the swarza dashboard, open Databases, create one and bind it to this application as{" "}
        <code>DATABASE</code>. The application restarts with <code>DATABASE_URL</code> and{" "}
        <code>DATABASE_AUTH_TOKEN</code> set. Then run the migrations once:
      </p>
      <pre>
        <code>DATABASE_URL=… DATABASE_AUTH_TOKEN=… npm run db:migrate</code>
      </pre>
    </Notice>
  );
}

export function NeedsBucket({ what, hint }: { what: string; hint?: HintId }) {
  return (
    <Notice title="Bind a bucket to see this" hint={hint}>
      <p>
        {what} In the swarza dashboard, open Storage, create a bucket and bind it to this application as{" "}
        <code>STORAGE</code> with read and write access. The application restarts with the{" "}
        <code>STORAGE_*</code> variables set.
      </p>
    </Notice>
  );
}
