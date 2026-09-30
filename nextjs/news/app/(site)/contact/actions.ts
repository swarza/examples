"use server";
import { createHash } from "node:crypto";
import { and, count, eq, gt } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { messages } from "@/lib/schema";

export type ContactState = { ok: boolean; message: string } | null;

const LIMIT_PER_HOUR = 3;

/** Saves a message to the inbox in /admin. At most 3 an hour from one address. */
export async function sendMessage(_: ContactState, form: FormData): Promise<ContactState> {
  const field = (name: string, max: number) =>
    String(form.get(name) ?? "")
      .trim()
      .slice(0, max);
  const name = field("name", 100);
  const email = field("email", 200);
  const subject = field("subject", 200);
  const body = field("body", 5000);
  if (form.get("website")) return { ok: true, message: "Thanks, your message is in." };
  if (!name || !body || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { ok: false, message: "Please give your name, a valid email address and a message." };
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "unknown").split(",")[0]!.trim();
  const ipHash = createHash("sha256")
    .update(`${process.env.SESSION_SECRET ?? ""}:${ip}`)
    .digest("hex")
    .slice(0, 32);
  const d = await db();
  const [{ n }] = (await d
    .select({ n: count() })
    .from(messages)
    .where(and(eq(messages.ipHash, ipHash), gt(messages.createdAt, Date.now() - 3_600_000)))) as [
    { n: number },
  ];
  if (n >= LIMIT_PER_HOUR)
    return { ok: false, message: "That's a few messages already. Please try again in an hour." };
  await d.insert(messages).values({ name, email, subject, body, ipHash });
  return { ok: true, message: "Thanks, your message is in. The newsroom reads every one." };
}
