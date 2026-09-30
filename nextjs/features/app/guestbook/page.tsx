import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { entries } from "@/lib/schema";

export const metadata = { title: "Guestbook" };
export const dynamic = "force-dynamic";

async function sign(form: FormData) {
  "use server";
  const name = String(form.get("name") ?? "")
    .trim()
    .slice(0, 80);
  const message = String(form.get("message") ?? "")
    .trim()
    .slice(0, 500);
  if (!name || !message) return;
  await db().insert(entries).values({ name, message, createdAt: new Date() });
  revalidatePath("/guestbook");
}

export default async function Guestbook() {
  const started = performance.now();
  const rows = await db().select().from(entries).orderBy(desc(entries.id)).limit(20);
  const count = await db().$count(entries);
  const ms = performance.now() - started;
  return (
    <main>
      <h1>Guestbook</h1>
      <p>
        A swarza database with Drizzle: <span id="count">{count}</span> entries, read in{" "}
        <span id="query-ms">{ms.toFixed(2)}</span> ms (two queries).
      </p>
      <form action={sign}>
        <input name="name" placeholder="Your name" required maxLength={80} />
        <input name="message" placeholder="A message" required maxLength={500} />
        <button type="submit">Sign</button>
      </form>
      <ul id="entries">
        {rows.map((e) => (
          <li key={e.id}>
            <strong>{e.name}</strong>: {e.message} <time>{e.createdAt.toISOString()}</time>
          </li>
        ))}
      </ul>
    </main>
  );
}
