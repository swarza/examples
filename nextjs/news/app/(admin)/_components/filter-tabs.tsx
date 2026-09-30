"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "../_lib/utils";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export type Filter = { value: string; label: string; href: string; count?: number };

/**
 * Status filters as tabs whose tabs are links, so each filter has its own URL. On a narrow screen
 * the row scrolls sideways, with a fade on the edge that still has tabs behind it.
 */
export function FilterTabs({ filters, value, label }: { filters: Filter[]; value: string; label: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ left: false, right: false });

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () =>
      setMore({
        left: el.scrollLeft > 2,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
      });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    // Keep the active tab in view.
    el.querySelector<HTMLElement>("[data-active]")?.scrollIntoView({ block: "nearest", inline: "nearest" });
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  return (
    <Tabs value={value} className="relative max-w-full min-w-0">
      <div ref={scroller} className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <TabsList aria-label={label}>
          {filters.map((f) => (
            <TabsTrigger
              key={f.value}
              value={f.value}
              nativeButton={false}
              render={<Link href={f.href} aria-current={f.value === value ? "page" : undefined} />}
              className="flex-none px-2 sm:px-3"
            >
              {f.label}
              {f.count === undefined ? null : (
                <span className="text-xs text-muted-foreground tabular-nums">{f.count}</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-background to-transparent transition-opacity",
          more.left ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-background to-transparent transition-opacity",
          more.right ? "opacity-100" : "opacity-0",
        )}
      />
    </Tabs>
  );
}
