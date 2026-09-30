import { cookies } from "next/headers";
import { talks } from "./program";

export const AGENDA_COOKIE = "agenda";

/** The talks saved in this browser's agenda cookie, in program order. */
export async function readAgenda() {
  const saved = new Set((await cookies()).get(AGENDA_COOKIE)?.value.split(",") ?? []);
  return talks.filter((t) => saved.has(t.slug)).map((t) => t.slug);
}
