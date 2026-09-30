import type { ReactNode } from "react";
import { cn } from "../_lib/utils";

/**
 * The bar at the bottom of an editing screen: it sticks to the bottom of the window, says whether
 * there are unsaved changes (or when the last save was), and holds the actions. Place it last in a
 * <Page>; it spans the page's gutters.
 */
export function SaveBar({
  dirty,
  savedLabel,
  leading,
  children,
}: {
  dirty: boolean;
  savedLabel: string;
  leading?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      data-slot="save-bar"
      className="sticky bottom-0 z-10 -mx-4 -mb-4 flex items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:-mx-8 md:-mb-8 md:px-8"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
        {leading}
        <span
          className={cn("truncate", dirty ? "text-foreground" : "text-muted-foreground")}
          aria-live="polite"
        >
          {dirty ? (
            <>
              <span
                className="mr-1.5 inline-block size-1.5 rounded-full bg-amber-500 align-middle"
                aria-hidden
              />
              <span className="max-sm:hidden">Unsaved changes</span>
              <span className="sm:hidden">Unsaved</span>
            </>
          ) : (
            savedLabel
          )}
        </span>
      </div>
      {children}
    </div>
  );
}
