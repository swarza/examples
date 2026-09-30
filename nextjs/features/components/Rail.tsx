import Link from "next/link";
import type { ReactNode } from "react";
import { kindLabel, type Slot } from "@/lib/program";

/** The program as a timetable: times on the left, talks on a rule, breaks muted. */
export function Rail({ slots, aside }: { slots: Slot[]; aside?: (slot: Slot) => ReactNode }) {
  return (
    <ol className="rail">
      {slots.map((s) => (
        <li key={s.slug} className={s.kind === "break" ? "rail-break" : undefined}>
          <time className="rail-time">{s.start}</time>
          <div className="rail-body">
            {s.kind === "break" ? (
              <span className="rail-title">{s.title}</span>
            ) : (
              <>
                <span className="kicker">
                  {kindLabel[s.kind]} · {s.start}–{s.end}
                </span>
                <Link href={`/talks/${s.slug}`} className="rail-title title">
                  {s.title}
                </Link>
                <span className="byline">
                  {s.speaker ? `${s.speaker.name}, ${s.speaker.role}` : "Speakers picked on the day"}
                </span>
              </>
            )}
          </div>
          {aside ? <div className="rail-aside">{aside(s)}</div> : null}
        </li>
      ))}
    </ol>
  );
}
