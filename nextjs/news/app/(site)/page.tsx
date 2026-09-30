import Link from "next/link";
import { FrontPage } from "@/components/FrontPage";
import { getFrontPage, getHome, getMostRead } from "@/lib/content";
import { hasDatabase } from "@/lib/db";

/**
 * The front page reads everything from Next's data cache (lib/content.ts), so rendering it takes
 * no database queries until something changes in the newsroom.
 *
 * What goes where is the newsroom's arrangement (lib/front-page.ts, edited under /admin), drawn by
 * components/FrontPage.tsx.
 */
export const dynamic = "force-dynamic";

export default async function Home() {
  if (!hasDatabase()) return <Setup />;
  const modules = await getFrontPage();
  const home = await getHome(modules);
  if (!home.total) return <Empty />;
  return <FrontPage home={home} modules={modules} mostRead={getMostRead(modules)} />;
}

function Setup() {
  return (
    <div className="page">
      <div className="page-head">
        <h1>Almost there.</h1>
        <p className="dek">
          Dispatch needs a database. In the swarza dashboard, create one under Databases and bind it to this
          application; it restarts with DATABASE_URL set and creates its tables on first use.
        </p>
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="page">
      <div className="page-head">
        <h1>No stories yet.</h1>
        <p className="dek">
          Sign in to the <Link href="/admin">newsroom</Link> to write the first one, or load the demo content
          there.
        </p>
      </div>
    </div>
  );
}
