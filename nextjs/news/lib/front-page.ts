/**
 * The front page's arrangement, which editors change under /admin/front-page. It is an ordered list
 * of modules: the lead (with Top stories), Featured, Latest (with its sidebar) and one per section.
 * Stored as JSON in the settings table under FRONT_PAGE_KEY; `resolveFrontPage` turns whatever is
 * stored (or nothing) into a complete, valid list for the current sections.
 */
import type { Category } from "./schema";

export const FRONT_PAGE_KEY = "front-page";

/** Plain modules sit on the paper; black ones on a full-width black band. */
export type Tone = "plain" | "black";

/** The lead story and the numbered Top stories: list on the right, on the left, or below it. */
export type LeadLayout = "list-right" | "list-left" | "wide";

/** Rows of stories (Featured, sections): a big card left or right of two stacked, three equal, or rows. */
export type RowLayout = "big-left" | "equal" | "big-right" | "list";

/** Latest's sidebar holds Most read; it sits right, left, or not at all. */
export type SidebarPlace = "right" | "left" | "none";
export type SidebarStyle = "black" | "plain";

type Base = { id: string; hidden: boolean; tone: Tone };
export type LeadModule = Base & { kind: "lead"; layout: LeadLayout };
export type FeaturedModule = Base & { kind: "featured"; layout: RowLayout };
export type LatestModule = Base & { kind: "latest"; sidebar: SidebarPlace; sidebarStyle: SidebarStyle };
export type SectionModule = Base & { kind: "section"; categoryId: number; layout: RowLayout };
export type Module = LeadModule | FeaturedModule | LatestModule | SectionModule;

export const leadLayouts: Record<LeadLayout, string> = {
  "list-right": "Lead, list on the right",
  "list-left": "Lead, list on the left",
  wide: "Lead across, list below",
};
export const rowLayouts: Record<RowLayout, string> = {
  "big-left": "Big story left",
  equal: "Equal cards",
  "big-right": "Big story right",
  list: "List",
};
export const sidebarPlaces: Record<SidebarPlace, string> = {
  right: "Most read on the right",
  left: "Most read on the left",
  none: "No sidebar",
};
export const sidebarStyles: Record<SidebarStyle, string> = { black: "Black panel", plain: "Plain" };
export const tones: Record<Tone, string> = { plain: "Plain", black: "Black band" };

const rotation: RowLayout[] = ["big-left", "equal", "big-right"];
const sectionId = (categoryId: number) => `section-${categoryId}`;

function defaultSection(category: Category, i: number, last: boolean): SectionModule {
  return {
    id: sectionId(category.id),
    kind: "section",
    categoryId: category.id,
    layout: rotation[i % rotation.length]!,
    tone: last && i > 0 ? "black" : "plain",
    hidden: false,
  };
}

/** The arrangement before anyone changes it: what the front page looked like before settings. */
export function defaultFrontPage(categories: Category[]): Module[] {
  return [
    { id: "lead", kind: "lead", layout: "list-right", tone: "plain", hidden: false },
    { id: "featured", kind: "featured", layout: "equal", tone: "plain", hidden: false },
    { id: "latest", kind: "latest", sidebar: "right", sidebarStyle: "black", tone: "plain", hidden: false },
    ...categories.map((c, i) => defaultSection(c, i, i === categories.length - 1)),
  ];
}

const pick = <T extends string>(value: unknown, allowed: Record<T, string>, fallback: T): T =>
  typeof value === "string" && value in allowed ? (value as T) : fallback;

/**
 * Stored JSON (or null) to a complete list: unknown or broken entries are dropped, missing fields
 * take their defaults, sections of deleted categories go, new categories are added at the end and
 * the lead, Featured and Latest are always present exactly once.
 */
export function resolveFrontPage(stored: unknown, categories: Category[]): Module[] {
  const defaults = defaultFrontPage(categories);
  if (!Array.isArray(stored)) return defaults;
  const byId = new Map(defaults.map((m) => [m.id, m]));
  const seen = new Set<string>();
  const out: Module[] = [];
  for (const raw of stored) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const base = byId.get(String(r.id));
    if (!base || seen.has(base.id)) continue;
    seen.add(base.id);
    const common = { id: base.id, hidden: r.hidden === true, tone: pick(r.tone, tones, base.tone) };
    if (base.kind === "lead")
      out.push({ ...base, ...common, layout: pick(r.layout, leadLayouts, base.layout) });
    else if (base.kind === "featured")
      out.push({ ...base, ...common, layout: pick(r.layout, rowLayouts, base.layout) });
    else if (base.kind === "latest")
      out.push({
        ...base,
        ...common,
        sidebar: pick(r.sidebar, sidebarPlaces, base.sidebar),
        sidebarStyle: pick(r.sidebarStyle, sidebarStyles, base.sidebarStyle),
      });
    else out.push({ ...base, ...common, layout: pick(r.layout, rowLayouts, base.layout) });
  }
  defaults.forEach((m, i) => {
    if (seen.has(m.id)) return;
    if (m.kind === "section") out.push({ ...m, tone: "plain" });
    else out.splice(Math.min(i, out.length), 0, m);
  });
  return out;
}

/** The label an editor sees for a module. */
export function moduleName(m: Module, categories: Category[]): string {
  if (m.kind === "lead") return "Lead and Top stories";
  if (m.kind === "featured") return "Featured";
  if (m.kind === "latest") return "Latest and Most read";
  return categories.find((c) => c.id === m.categoryId)?.name ?? "Section";
}
