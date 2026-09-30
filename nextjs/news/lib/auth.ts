/**
 * Editors sign in with email and password (stored as scrypt hashes in the database). The session
 * is a signed cookie (lib/session.ts); it names the editor and their session version, so changing a
 * password or signing out everywhere ends old sessions.
 *
 * The first sign-in on an empty database creates the admin from ADMIN_EMAIL and ADMIN_PASSWORD,
 * which you set as environment variables in the swarza dashboard.
 */
import { count, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { checkPassword, hashPassword } from "./password";
import { editors, type Editor } from "./schema";
import { SESSION_COOKIE, SESSION_DAYS, signSession, verifySession } from "./session";
import { slugify } from "./slug";

export const sessionSecret = () => process.env.SESSION_SECRET ?? "";

export type SignInResult = { ok: true } | { ok: false; message: string };

export async function signIn(email: string, password: string): Promise<SignInResult> {
  if (sessionSecret().length < 32)
    return {
      ok: false,
      message: "Set SESSION_SECRET (32 characters or more) in the application's variables.",
    };
  const d = await db();
  const address = email.trim().toLowerCase();
  let [editor] = await d.select().from(editors).where(eq(editors.email, address));
  if (!editor) {
    const [{ n }] = (await d.select({ n: count() }).from(editors)) as [{ n: number }];
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD ?? "";
    if (
      n === 0 &&
      adminEmail &&
      adminPassword.length >= 10 &&
      address === adminEmail &&
      password === adminPassword
    ) {
      const name = address
        .split("@")[0]!
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      [editor] = await d
        .insert(editors)
        .values({
          email: address,
          name,
          slug: slugify(name) || "editor",
          passwordHash: await hashPassword(password),
          role: "admin",
        })
        .returning();
      console.log(`created the first editor: ${address}`);
    }
  }
  if (!editor || !(await checkPassword(password, editor.passwordHash)))
    return { ok: false, message: "That email and password don't match an editor." };
  const jar = await cookies();
  const expires = Date.now() + SESSION_DAYS * 86_400_000;
  jar.set(
    SESSION_COOKIE,
    await signSession({ editorId: editor.id, version: editor.sessionVersion, expires }, sessionSecret()),
    { httpOnly: true, secure: true, sameSite: "lax", path: "/", expires: new Date(expires) },
  );
  return { ok: true };
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The signed-in editor, or null. */
export async function currentEditor(): Promise<Editor | null> {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value, sessionSecret());
  if (!session) return null;
  const d = await db();
  const [editor] = await d.select().from(editors).where(eq(editors.id, session.editorId));
  return editor && editor.sessionVersion === session.version ? editor : null;
}

/** For admin pages and actions: the editor, or a redirect to the sign-in page. */
export async function requireEditor(): Promise<Editor> {
  const editor = await currentEditor();
  if (!editor) redirect("/admin/login");
  return editor;
}

export async function requireAdmin(): Promise<Editor> {
  const editor = await requireEditor();
  if (editor.role !== "admin") redirect("/admin");
  return editor;
}
