/**
 * Black-and-white covers for the demo posts, drawn as SVG from a seed (the post's slug). Two
 * families: light line work on a pale tile, and white shapes on a solid black ground. In
 * publishing order every third story of a section gets a black cover (see coverOrder), so a
 * section's row of three has one black cover. Everything that matters sits in the middle 2:1 band (y 100 to 700), so the crop used
 * by the lead story and the article page keeps the whole drawing. Lines are one screen pixel wide
 * at any size (non-scaling strokes). The colours follow the reader's light or dark mode from
 * inside the SVG, so black grounds stay black-ish instead of being inverted into white slabs.
 */
const W = 1200;
const H = 800;
const LINE = `vector-effect="non-scaling-stroke" stroke-width="1"`;
const STYLE = `<style>.bg{fill:#f0f0f0}.f{fill:#0b0b0b}.s{stroke:#0b0b0b}.g{stroke:#c4c4c4}.nb{fill:#0b0b0b}.w{fill:#fff}.ws{stroke:#fff}.ng{stroke:#3a3a3a}@media (prefers-color-scheme:dark){.bg{fill:#161616}.f{fill:#f4f4f4}.s{stroke:#f4f4f4}.g{stroke:#3b3b3b}.nb{fill:#1c1c1c}.w{fill:#f4f4f4}.ws{stroke:#f4f4f4}.ng{stroke:#3b3b3b}}</style>`;

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const light = `<rect class="bg" width="${W}" height="${H}"/>`;
const night = `<rect class="nb" width="${W}" height="${H}"/>`;
const initial = (text: string) => (text.trim()[0] ?? "D").toUpperCase().replace(/[<&>"]/g, "D");

function dots(rand: () => number, step: number, size: number, reach: number) {
  const cx = W * (0.3 + rand() * 0.4);
  const cy = H * (0.35 + rand() * 0.3);
  let out = "";
  for (let y = step / 2; y < H; y += step)
    for (let x = step / 2; x < W; x += step) {
      const t = Math.max(0, 1 - Math.hypot(x - cx, y - cy) / reach);
      const r = step * size * t * t;
      if (r > 2) out += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}"/>`;
    }
  return out;
}

/** A grid of 150-unit cells across the tile; `n` of the cells in the 2:1 band get a shape. */
function cells(rand: () => number, n: number) {
  const size = 150;
  const cols = W / size;
  const y0 = -50; // rows at 100, 250, 400 and 550 hold the shapes
  let grid = "";
  for (let x = 1; x < cols; x++) grid += `<line x1="${x * size}" y1="0" x2="${x * size}" y2="${H}"/>`;
  for (let y = 1; y < 6; y++) grid += `<line x1="0" y1="${y0 + y * size}" x2="${W}" y2="${y0 + y * size}"/>`;
  let shapes = "";
  const used = new Set<number>();
  while (used.size < n) {
    const c = Math.floor(rand() * cols * 4);
    if (used.has(c)) continue;
    used.add(c);
    const x = (c % cols) * size;
    const y = y0 + (1 + Math.floor(c / cols)) * size;
    const kind = Math.floor(rand() * 3);
    if (kind === 0) shapes += `<rect x="${x}" y="${y}" width="${size}" height="${size}"/>`;
    else if (kind === 1) shapes += `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}"/>`;
    else shapes += `<path d="M${x} ${y + size}A${size} ${size} 0 0 1 ${x + size} ${y}V${y + size}Z"/>`;
  }
  return { grid, shapes };
}

// ── Light: black line work on a pale tile ──────────────────────────────────

/** A soft field of small dots that swells around one point. */
function halftone(rand: () => number) {
  return `${light}<g class="f">${dots(rand, 48, 0.34, 520 + rand() * 160)}</g>`;
}

/** Stacked lines lifted by one soft swell, like a contour map. */
function contours(rand: () => number) {
  const n = 12;
  const top = 180;
  const gap = (H - 2 * top) / (n - 1);
  const cx = W * (0.3 + rand() * 0.4);
  const spread = 160 + rand() * 120;
  const lift = 40 + rand() * 30;
  const ripple = 0.012 + rand() * 0.01;
  let out = "";
  for (let i = 0; i < n; i++) {
    const y0 = top + i * gap;
    let d = "";
    for (let x = 0; x <= W; x += 20) {
      const bump = Math.exp(-(((x - cx) / spread) ** 2));
      const y = y0 - lift * bump * (0.6 + 0.4 * Math.sin(i * 0.5 + x * ripple));
      d += `${x === 0 ? "M" : "L"}${x} ${r1(y)}`;
    }
    out += `<path d="${d}"/>`;
  }
  return `${light}<g class="s" fill="none" ${LINE} stroke-linejoin="round">${out}</g>`;
}

/** Thin concentric rings around a point that sits off to one side. */
function rings(rand: () => number) {
  const cx = W * (0.25 + rand() * 0.5);
  const cy = H * (0.4 + rand() * 0.2);
  // Wide spacing, so the rings stay distinct lines at thumbnail size instead of a moiré.
  const gap = 72 + rand() * 24;
  let out = "";
  for (let r = gap; r < 1000; r += gap) out += `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}"/>`;
  return `${light}<g class="s" fill="none" ${LINE}>${out}</g>`;
}

/** A hairline grid with a few cells filled in. */
function blocks(rand: () => number) {
  const { grid, shapes } = cells(rand, 5);
  return `${light}<g class="g" ${LINE}>${grid}</g><g class="f">${shapes}</g>`;
}

/** One large letter standing on a rule. */
function letter(rand: () => number, text: string) {
  const x = r1(W * (0.35 + rand() * 0.3));
  return `${light}<line class="s" x1="120" y1="600" x2="${W - 120}" y2="600" ${LINE}/><text class="f" x="${x}" y="600" font-family="Georgia, 'Times New Roman', serif" font-size="640" text-anchor="middle">${initial(text)}</text>`;
}

// ── Black: white shapes on a solid ground ──────────────────────────────────

/** More of the grid filled in, white on black. */
function nightBlocks(rand: () => number) {
  const { grid, shapes } = cells(rand, 9);
  return `${night}<g class="ng" ${LINE}>${grid}</g><g class="w">${shapes}</g>`;
}

/** A large white disc with thin rings spreading out from it. */
function nightSun(rand: () => number) {
  const cx = r1(W * (0.3 + rand() * 0.4));
  const r = 180 + Math.round(rand() * 60);
  let out = "";
  for (let d = r + 48; d < 1000; d += 48) out += `<circle cx="${cx}" cy="400" r="${d}"/>`;
  return `${night}<g class="ws" fill="none" ${LINE}>${out}</g><circle class="w" cx="${cx}" cy="400" r="${r}"/>`;
}

/** A dense field of white dots. */
function nightHalftone(rand: () => number) {
  return `${night}<g class="w">${dots(rand, 32, 0.46, 620 + rand() * 160)}</g>`;
}

/** One large white letter over ruled lines. */
function nightLetter(rand: () => number, text: string) {
  const x = r1(W * (0.35 + rand() * 0.3));
  const lines = Array.from(
    { length: 7 },
    (_, i) => `<line x1="0" y1="${160 + i * 80}" x2="${W}" y2="${160 + i * 80}"/>`,
  );
  return `${night}<g class="ng" ${LINE}>${lines.join("")}</g><text class="w" x="${x}" y="640" font-family="Georgia, 'Times New Roman', serif" font-size="720" text-anchor="middle">${initial(text)}</text>`;
}

const lights = [halftone, contours, rings, blocks, letter] as const;
const nights = [nightBlocks, nightSun, nightHalftone, nightLetter] as const;

/**
 * Which cover each story gets: an index for coverSvg. In publishing order, the second of every
 * three stories in a section is black (the newest story of a section is often a scheduled one,
 * so the lead usually lands on black); the light and the black styles each take turns.
 */
export function coverOrder<T extends { hoursAgo: number; category: string }>(posts: T[]): Map<T, number> {
  const inSection = new Map<string, number>();
  let lightsSoFar = 0;
  let nightsSoFar = 0;
  const order = new Map<T, number>();
  for (const p of [...posts].sort((a, b) => a.hoursAgo - b.hoursAgo)) {
    const rank = inSection.get(p.category) ?? 0;
    inSection.set(p.category, rank + 1);
    if (rank % 3 === 1) order.set(p, 3 * nightsSoFar++ + 2);
    else {
      const j = lightsSoFar++;
      order.set(p, j + Math.floor(j / 2));
    }
  }
  return order;
}

/**
 * A 1200×800 SVG cover for a post, the same every time for the same seed and index. An index
 * (from coverOrder) of 2, 5, 8 and so on draws a black cover; without one the seed picks.
 */
export function coverSvg(seed: string, title: string, index?: number): string {
  const rand = rng(seed);
  const i = index ?? Math.floor(rand() * 3 * lights.length);
  const draw =
    i % 3 === 2
      ? nights[Math.floor(i / 3) % nights.length]!
      : lights[(i - Math.floor((i + 1) / 3)) % lights.length]!;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${STYLE}${draw(rand, title)}</svg>`;
}
