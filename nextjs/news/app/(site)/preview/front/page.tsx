import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FrontPage } from "@/components/FrontPage";
import { PreviewBar } from "@/components/PreviewBar";
import { currentEditor } from "@/lib/auth";
import { getCategories, getFrontPage, getHome, getMostRead, parseJson } from "@/lib/content";
import { resolveFrontPage } from "@/lib/front-page";

/**
 * The front page with an arrangement that isn't saved yet, for signed-in editors:
 * `?layout=` is the arrangement as base64url JSON (without it, the saved one), and `?embed=1`
 * drops the preview strip for the newsroom's live preview frame.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Front page preview", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ layout?: string; embed?: string }> };

export default async function FrontPreview({ searchParams }: Props) {
  const { layout, embed } = await searchParams;
  if (!(await currentEditor())) {
    const next = layout ? `/preview/front?layout=${layout}` : "/preview/front";
    redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  }
  const modules = layout
    ? resolveFrontPage(parseJson(Buffer.from(layout, "base64url").toString("utf8")), await getCategories())
    : await getFrontPage();
  const home = await getHome(modules);
  return (
    <>
      {embed === "1" ? null : (
        <PreviewBar>Preview · Front page {layout ? "arrangement, not saved" : "as saved"}</PreviewBar>
      )}
      {home.total ? (
        <FrontPage home={home} modules={modules} mostRead={getMostRead(modules)} />
      ) : (
        <div className="page">
          <div className="page-head">
            <h1>No stories yet.</h1>
          </div>
        </div>
      )}
    </>
  );
}
