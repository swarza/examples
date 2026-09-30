import { eq } from "drizzle-orm";
import { requireEditor } from "@/lib/auth";
import { db } from "@/lib/db";
import { FRONT_PAGE_KEY, moduleName, resolveFrontPage } from "@/lib/front-page";
import { categories, settings } from "@/lib/schema";
import { FrontPageEditor } from "../../../_components/front-page-editor";
import { Page } from "../../../_components/page-header";

export const metadata = { title: "Front page" };

export default async function FrontPage() {
  const editor = await requireEditor();
  const d = await db();
  const [cats, [row]] = await Promise.all([
    d.select().from(categories).orderBy(categories.position, categories.name),
    d.select().from(settings).where(eq(settings.key, FRONT_PAGE_KEY)),
  ]);
  let stored: unknown = null;
  try {
    stored = row ? JSON.parse(row.value) : null;
  } catch {
    // A broken row reads as the default arrangement; saving replaces it.
  }
  const modules = resolveFrontPage(stored, cats);
  const names = Object.fromEntries(modules.map((m) => [m.id, moduleName(m, cats)]));
  return (
    <Page>
      <FrontPageEditor
        // A save or reset elsewhere gives new data: start from it.
        key={row ? `${row.updatedAt}` : "default"}
        initial={modules}
        names={names}
        canEdit={editor.role === "admin"}
        savedAt={row?.updatedAt}
        customised={Boolean(row)}
      />
    </Page>
  );
}
