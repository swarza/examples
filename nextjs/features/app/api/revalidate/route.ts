import { revalidatePath, revalidateTag } from "next/cache";

/** Regenerates /isr and the posts on demand: `curl -X POST <site>/api/revalidate`. */
export function POST() {
  revalidateTag("posts", "max");
  revalidatePath("/isr");
  return Response.json({ revalidated: ["/isr", "posts"] });
}
