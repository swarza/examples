import Link from "next/link";
import { HowItWorks } from "@/components/HowItWorks";
import { Rail } from "@/components/Rail";
import { readAgenda } from "@/lib/agenda";
import { talks } from "@/lib/program";
import { clear, toggle } from "./actions";

export const metadata = { title: "My agenda" };

export default async function Agenda() {
  const saved = await readAgenda();
  const picked = talks.filter((t) => saved.includes(t.slug));
  return (
    <div className="page">
      <div className="page-head">
        <p className="kicker">My agenda</p>
        <h1>Plan your day</h1>
        <p className="dek">
          Pick the talks you don&apos;t want to miss. Your picks stay in a cookie in this browser; nothing is
          stored on the server.
        </p>
      </div>
      <div className="summary">
        {picked.length ? (
          <>
            <p>
              <strong id="saved-count">{picked.length}</strong> {picked.length === 1 ? "talk" : "talks"}{" "}
              saved, from {picked[0]!.start} to {picked.at(-1)!.end}.
            </p>
            <form action={clear}>
              <button type="submit" className="btn btn-line btn-small">
                Clear
              </button>
            </form>
          </>
        ) : (
          <p>
            Nothing saved yet. Add talks below, or from a talk&apos;s page. The{" "}
            <Link href="/schedule">schedule</Link> has the breaks too.
          </p>
        )}
      </div>
      <Rail
        slots={talks}
        aside={(t) => {
          const on = saved.includes(t.slug);
          return (
            <form action={toggle}>
              <input type="hidden" name="slug" value={t.slug} />
              <button
                type="submit"
                className={on ? "btn btn-small" : "btn btn-line btn-small"}
                aria-pressed={on}
                aria-label={`${on ? "Remove" : "Add"} ${t.title}`}
              >
                {on ? "Saved ✓" : "Add"}
              </button>
            </form>
          );
        }}
      />
      <HowItWorks id="agenda" />
    </div>
  );
}
