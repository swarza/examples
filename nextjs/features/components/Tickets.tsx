import Link from "next/link";
import type { ReactNode } from "react";
import { kindLabel, type Slot } from "@/lib/program";
import { FeatureHint } from "./FeatureHint";

/**
 * The program as a stack of tickets: a stub with the time on the left, the talk on the right.
 * Breaks are thin rows between them. `aside` adds a control to each talk (the agenda buttons);
 * `hints` marks the talk that was added after the build.
 */
export function Tickets({
  slots,
  aside,
  hints,
}: {
  slots: Slot[];
  aside?: (slot: Slot) => ReactNode;
  hints?: boolean;
}) {
  return (
    <ol className="tickets">
      {slots.map((s) =>
        s.kind === "break" ? (
          <li key={s.slug} className="ticket-break">
            <time>{s.start}</time>
            <span>{s.title}</span>
          </li>
        ) : (
          <li key={s.slug} className={`ticket ticket-${s.kind}`}>
            <div className="ticket-stub">
              <time className="ticket-time">{s.start}</time>
              <span className="ticket-end">to {s.end}</span>
            </div>
            <div className="ticket-body">
              <div className="ticket-tags">
                <span className={`pill pill-${s.kind}`}>{kindLabel[s.kind]}</span>
                <span className="pill pill-quiet">Hall A</span>
                {s.late ? <span className="pill pill-quiet">Added late</span> : null}
              </div>
              <p className="ticket-title">
                <Link href={`/talks/${s.slug}`}>{s.title}</Link>
                {hints && s.late ? <FeatureHint id="on-demand" /> : null}
              </p>
              <p className="ticket-who">
                {s.speaker ? `${s.speaker.name}, ${s.speaker.role}` : "Speakers picked on the day"}
              </p>
            </div>
            {aside ? <div className="ticket-aside">{aside(s)}</div> : null}
          </li>
        ),
      )}
    </ol>
  );
}
