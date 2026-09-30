import { unstable_cache } from "next/cache";
import { program } from "./program";

/**
 * The published program, read through Next's data cache and tagged `program`. POST
 * /api/revalidate ("the organisers publish a change") drops the entry, so the next read stores a
 * new copy with a new `publishedAt`.
 */
export const getSchedule = unstable_cache(async () => ({ publishedAt: Date.now(), program }), ["schedule"], {
  tags: ["program"],
  revalidate: 3600,
});
