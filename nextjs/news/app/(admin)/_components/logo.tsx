import { Newspaper } from "lucide-react";

/** The admin's own mark: a small tile and the name. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Newspaper className="size-4" aria-hidden />
      </span>
      {compact ? null : (
        <span className="grid text-left leading-tight">
          <span className="text-sm font-semibold">Dispatch</span>
          <span className="text-xs text-muted-foreground">Newsroom</span>
        </span>
      )}
    </span>
  );
}
