"use client";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { ThemeToggle } from "./theme-toggle";
import { buttonVariants } from "./ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import { cn } from "../_lib/utils";

const names: Record<string, string> = {
  posts: "Stories",
  new: "New story",
  categories: "Sections",
  editors: "Editors",
  messages: "Inbox",
  "front-page": "Front page",
};

/** The trail for a path under /admin, e.g. Desk / Stories / Edit story. */
function trail(pathname: string) {
  const parts = pathname.split("/").filter(Boolean).slice(1);
  const crumbs = [{ label: "Desk", href: "/admin" }];
  let href = "/admin";
  parts.forEach((part) => {
    href += `/${part}`;
    const label = names[part] ?? (/^\d+$/.test(part) ? "Edit story" : part);
    crumbs.push({ label, href });
  });
  return crumbs;
}

export function AppHeader() {
  const crumbs = trail(usePathname());
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur supports-backdrop-filter:bg-background/70 md:rounded-t-xl">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-vertical:h-4 data-vertical:self-center" />
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <Fragment key={c.href}>
                {i > 0 ? <BreadcrumbSeparator className="hidden sm:inline-flex" /> : null}
                <BreadcrumbItem className={cn(!last && "hidden sm:inline-flex")}>
                  {last ? (
                    <BreadcrumbPage className="truncate">{c.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link href={c.href} />}>{c.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-1">
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex")}
        >
          View site <ExternalLink />
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
