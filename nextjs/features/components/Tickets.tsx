import Link from "next/link";
import type { ReactNode } from "react";
import { kindLabel, type Slot } from "@/lib/program";
import { FeatureHint } from "./FeatureHint";

/**
 * The program as a timetable: times on the left, talks on a rule, breaks muted. `aside` adds a
 * control to each talk (the agenda buttons); `hints` marks the talk that was added after the build.
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
    <ol className="rail">
      {slots.map((s) =>
        s.kind === "break" ? (
          <li key={s.slug} className="rail-row rail-break">
            <time className="rail-time">{s.start}</time>
            <span className="rail-body">{s.title}</span>
          </li>
        ) : (
          <li key={s.slug} className={`rail-row rail-${s.kind}`}>
            <p className="rail-when">
              <time className="rail-time">{s.start}</time>
              <span className="rail-end">to {s.end}</span>
            </p>
            <div className="rail-body">
              <p className="rail-meta">
                <span className="rail-kind">{kindLabel[s.kind]}</span>
                <span>Hall A</span>
                {s.late ? <span>Added late</span> : null}
              </p>
              <p className="rail-title">
                <Link href={`/talks/${s.slug}`}>{s.title}</Link>
                {hints && s.late ? <FeatureHint id="on-demand" /> : null}
              </p>
              <p className="rail-who">
                {s.speaker ? `${s.speaker.name}, ${s.speaker.role}` : "Speakers picked on the day"}
              </p>
            </div>
            {aside ? <div className="rail-aside">{aside(s)}</div> : null}
          </li>
        ),
      )}
    </ol>
  );
}
