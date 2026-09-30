"use client";
import { useEffect, useRef } from "react";

/**
 * The swarza sunrise as an ordered dither (8x8 Bayer, 4px cells) in the HEAT colours, drawn once on
 * a canvas. The darkest level is left transparent, so the dark panel behind it shows through. The
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
    size.observe(el);
    return () => size.disconnect();
  }, []);

  return (
    <div ref={box} className={`dither ${className ?? ""}`} aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}

const CELL = 4;
const HEAT = ["#000000", "#1a0a3d", "#6a35ff", "#ff2fcf", "#ff5a1a", "#ffd54a", "#fff4d6"];
const RAMP = ["#1a0a3d", "#6a35ff", "#ff2fcf", "#ff5a1a", "#ffd54a"];

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
  // The sunrise of scripts/examples-banner.mjs, fitted to the box.
  const palette = HEAT.map(hex);
  const ramp = RAMP.map(hex);
  // The banner is about 4:1; a squarer box keeps the glow about as wide as the banner's.
  const aspect = clamp(W / H, 2.2, 4);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const u = (x + 0.5) / W;
      const v = 1 - (y + 0.5) / H;
      const px = (u - 0.66) * aspect * 0.3;
      const py = (v + 0.32) * 1.05;
      const warp = 0.06 * (fbm(px * 3, 7.3 * 0.25) - 0.5);
      const d = Math.hypot(px, py) / 0.95 + warp;
      const glow = clamp(1 - d * 0.9, 0, 1);
      const drift = 0.12 * fbm(px * 2.5 + 7.3 * 0.08, py * 2.5 - 7.3 * 0.05);
      let c = rampAt(ramp, glow + drift * glow).map((k) => k * (glow + drift * 0.6)) as RGB;
      const lit = smooth(0.02, 0.12, Math.max(...c));
      const t = (bayer8(x, H - 1 - y) - 0.5) * 0.5 * lit;
      c = c.map((k) => k + t) as RGB;
      let best = 0;
      let bestD = Infinity;
      palette.forEach((p, i) => {
        const dd = (c[0] - p[0]) ** 2 + (c[1] - p[1]) ** 2 + (c[2] - p[2]) ** 2;
        if (dd < bestD) {
          bestD = dd;
          best = i;
        }
      });
      if (best === 0) continue;
      const i = (y * W + x) * 4;
      img.data[i] = palette[best]![0] * 255;
      img.data[i + 1] = palette[best]![1] * 255;
      img.data[i + 2] = palette[best]![2] * 255;
      img.data[i + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const fract = (x: number) => x - Math.floor(x);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB;
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
function rampAt(ramp: RGB[], t: number): RGB {
  t = clamp(t, 0, 1) * (ramp.length - 1);
  const i = Math.min(Math.floor(t), ramp.length - 2);
  const f = t - i;
  return ramp[i]!.map((v, k) => v + (ramp[i + 1]![k]! - v) * f) as RGB;
}
const bayer2 = (x: number, y: number) => fract(Math.floor(x) / 2 + Math.floor(y) * Math.floor(y) * 0.75);
const bayer4 = (x: number, y: number) => bayer2(x / 2, y / 2) * 0.25 + bayer2(x, y);
const bayer8 = (x: number, y: number) => bayer4(x / 2, y / 2) * 0.25 + bayer2(x, y);
