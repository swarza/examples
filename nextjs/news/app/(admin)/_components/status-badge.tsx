import { CircleDashed, CircleCheck, Clock } from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "../_lib/utils";

const styles = {
  published: {
    label: "Published",
    icon: CircleCheck,
    className: "bg-emerald-600/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  },
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    className: "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  },
  draft: {
    label: "Draft",
    icon: CircleDashed,
    className: "bg-muted text-muted-foreground",
  },
} as const;

export type Status = keyof typeof styles;

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = styles[status as Status] ?? styles.draft;
  return (
    <Badge variant="ghost" className={cn(s.className, className)}>
      <s.icon aria-hidden />
      {s.label}
    </Badge>
  );
}
