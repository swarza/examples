import { count, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { requireEditor } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages } from "@/lib/schema";
import { AppHeader } from "../../_components/app-header";
import { AppSidebar } from "../../_components/app-sidebar";
import { Flash } from "../../_components/flash";
import { SidebarShell } from "../../_components/sidebar-shell";
import { SidebarInset } from "../../_components/ui/sidebar";

export const metadata: Metadata = { robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function DeskLayout({ children }: { children: ReactNode }) {
  const editor = await requireEditor();
  const d = await db();
  const [{ unread }] = (await d
    .select({ unread: count() })
    .from(messages)
    .where(eq(messages.read, false))) as [{ unread: number }];
  const jar = await cookies();
  const flag = (name: string) => {
    const value = jar.get(name)?.value;
    return value === "true" ? true : value === "false" ? false : undefined;
  };
  return (
    <SidebarShell saved={flag("sidebar_state")} auto={flag("sidebar_auto")}>
      <AppSidebar editor={{ name: editor.name, email: editor.email, role: editor.role }} unread={unread} />
      <SidebarInset>
        <AppHeader />
        <div className="flex-1">{children}</div>
        <Flash />
      </SidebarInset>
    </SidebarShell>
  );
}
