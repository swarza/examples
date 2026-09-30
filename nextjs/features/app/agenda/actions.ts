"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AGENDA_COOKIE, readAgenda } from "@/lib/agenda";
import { getTalk } from "@/lib/program";

async function save(slugs: string[]) {
  (await cookies()).set(AGENDA_COOKIE, slugs.join(","), {
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
    sameSite: "lax",
    httpOnly: true,
  });
  revalidatePath("/agenda");
}

/** Adds a talk, or takes it out if it is already saved (the buttons on /agenda). */
export async function toggle(form: FormData) {
  const slug = String(form.get("slug"));
  if (!getTalk(slug)) return;
  const saved = await readAgenda();
  await save(saved.includes(slug) ? saved.filter((s) => s !== slug) : [...saved, slug]);
}

/** Adds a talk and shows the agenda (the button on a talk's page). */
export async function add(form: FormData) {
  const slug = String(form.get("slug"));
  if (getTalk(slug)) {
    const saved = await readAgenda();
    if (!saved.includes(slug)) await save([...saved, slug]);
  }
  redirect("/agenda");
}

export async function clear() {
  await save([]);
}
