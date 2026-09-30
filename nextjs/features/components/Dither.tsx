"use client";
import { useEffect, useRef } from "react";

/**
 * An ordered-dither band (8x8 Bayer, 4px cells) drawn once on a canvas, in the style of swarza's
 * brand art: a glow rising from the lower right, in the page's ink and one grey on a transparent
 * ground. It reads both colours from CSS (`color` and `--dither-mid`), so it follows the theme. The
 * box's size comes from CSS, so nothing moves when it draws.
 */
export function Dither({ className }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = box.current!;
    const cv = canvas.current!;
    let width = 0;
    const size = new ResizeObserver(() => {
      // Height changes alone (a phone's address bar) do not need a new picture.
      const w = el.getBoundingClientRect().width;
      if (w !== width) paint(el, cv);
      width = w;
    });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const redraw = () => paint(el, cv);
    size.observe(el);
    scheme.addEventListener("change", redraw);
    return () => {
      size.disconnect();
      scheme.removeEventListener("change", redraw);
    };
  }, []);

  return (
    <div ref={box} className={`dither ${className ?? ""}`} aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}

const CELL = 4;

type RGB = [number, number, number];

function paint(el: HTMLElement, cv: HTMLCanvasElement) {
  const { width, height } = el.getBoundingClientRect();
  const W = Math.ceil(width / CELL);
  const H = Math.ceil(height / CELL);
  if (!W || !H) return;
  cv.width = W;
  cv.height = H;
  cv.style.width = `${W * CELL}px`;
  cv.style.height = `${H * CELL}px`;
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const img = ctx.createImageData(W, H);
  const put = (x: number, y: number, c: RGB) => {
    const i = (y * W + x) * 4;
    img.data[i] = c[0];
    img.data[i + 1] = c[1];
    img.data[i + 2] = c[2];
    img.data[i + 3] = 255;
  };
  const style = getComputedStyle(el);
  const ink = rgb(style.color);
  const mid = rgb(style.getPropertyValue("--dither-mid").trim() || style.color);
  // The glow's centre sits below the band, two thirds across; it fades out before the top edge.
  const cx = W * 0.68;
  const cy = H * 1.25;
  const rx = Math.max(W * 0.5, H * 2.5);
  const ry = H * 1.2;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
      const warp = 0.12 * (fbm(x * 0.05, y * 0.05) - 0.5);
      const v = smooth(0, 1, clamp(1.08 - d + warp, 0, 1) * 1.4) * 0.9;
      // Three levels (ground, grey, ink) with the Bayer threshold between them.
      const level = Math.round(clamp(v * 2 + (bayer8(x, y) - 0.5), 0, 2));
      if (level === 2) put(x, y, ink);
      else if (level === 1) put(x, y, mid);
    }
  ctx.putImageData(img, 0, 0);
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const fract = (x: number) => x - Math.floor(x);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
/** "rgb(11, 11, 11)" or "#0b0b0b" as bytes. */
const rgb = (css: string): RGB => {
  if (css.startsWith("#")) return [1, 3, 5].map((i) => parseInt(css.slice(i, i + 2), 16)) as RGB;
  const [r = 0, g = 0, b = 0] = css.match(/[\d.]+/g)?.map(Number) ?? [];
  return [r, g, b];
};
const hash = (x: number, y: number) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
function vnoise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  const top = a + (b - a) * ux;
  return top + (c + (d - c) * ux - top) * uy;
}
function fbm(x: number, y: number) {
  let v = 0;
  let a = 0.5;
  for (let i = 0; i < 4; i++) {
    v += a * vnoise(x, y);
    x *= 2.03;
    y *= 2.03;
    a *= 0.5;
  }
  return v;
}
const bayer2 = (x: number, y: number) => fract(Math.floor(x) / 2 + Math.floor(y) * Math.floor(y) * 0.75);
const bayer4 = (x: number, y: number) => bayer2(x / 2, y / 2) * 0.25 + bayer2(x, y);
const bayer8 = (x: number, y: number) => bayer4(x / 2, y / 2) * 0.25 + bayer2(x, y);
