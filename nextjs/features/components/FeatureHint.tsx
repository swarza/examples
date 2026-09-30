"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { hint, type HintId } from "@/lib/features";
import { Steps } from "./Steps";

/*
 * One open hint for the whole page: opening another closes the first. The header's "Show
 * features" switch closes it too.
 */
let openKey: string | null = null;
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};
const setOpenKey = (key: string | null) => {
  openKey = key;
  listeners.forEach((l) => l());
};
export const closeHints = () => setOpenKey(null);

type Place = { top: number; left: number; width: number; arrow: number; above: boolean } | "sheet";

/**
 * A pulsing dot next to an element that uses a Next.js feature. It opens a small popover (a bottom
 * sheet on phones) with what the element uses, which part of swarza serves it and how to test it.
 * The words live in lib/features.ts. `corner` pins the dot to the top right of a positioned parent,
 * for images.
 */
export function FeatureHint({ id, corner }: { id: HintId; corner?: boolean }) {
  const h = hint(id);
  const key = useId();
  const open = useSyncExternalStore(
    subscribe,
    () => openKey === key,
    () => false,
  );
  const button = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<Place | null>(null);

  const close = useCallback(
    (refocus: boolean) => {
      if (openKey === key) setOpenKey(null);
      if (refocus) button.current?.focus();
    },
    [key],
  );

  // Close when the page changes under a hint that stays (the header and the footer).
  const path = usePathname();
  const shownOn = useRef(path);
  useEffect(() => {
    if (shownOn.current !== path && openKey === key) setOpenKey(null);
    shownOn.current = path;
  }, [path, key]);

  // Put the popover under the dot, or above it when there is no room. When it fits on neither
  // side as it opens, scroll the page so that it fits below. Always inside the viewport.
  const measure = useCallback((opening = false) => {
    const b = button.current;
    const p = pop.current;
    if (!b || !p) return;
    if (window.matchMedia("(max-width: 600px)").matches) return setPlace("sheet");
    const r = b.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const width = Math.min(380, vw - 32);
    const left = Math.min(Math.max(r.left + r.width / 2 - width / 2, 16), vw - 16 - width);
    const height = p.offsetHeight;
    const below = r.bottom + 12;
    const fitsBelow = below + height <= vh - 16;
    const above = !fitsBelow && r.top - 12 - height > 16;
    if (opening && !fitsBelow && !above) {
      // Keep the dot below the sticky header.
      const by = Math.min(below + height - (vh - 16), r.top - 96);
      if (by > 0) {
        window.scrollBy({ top: by, behavior: "instant" });
        return measure();
      }
    }
    setPlace({
      top: above ? r.top - 12 - height : below,
      left,
      width,
      arrow: Math.min(Math.max(r.left + r.width / 2 - left, 20), width - 20),
      above,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    measure(true);
    let frame = 0;
    const again = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => measure());
    };
    const outside = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!pop.current?.contains(t) && !button.current?.contains(t)) close(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    window.addEventListener("resize", again);
    window.addEventListener("scroll", again, true);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", again);
      window.removeEventListener("scroll", again, true);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open, measure, close]);

  // Move focus into the popover once it is placed (it cannot take focus while hidden to measure).
  const placed = open && place !== null;
  useEffect(() => {
    if (placed) pop.current?.focus({ preventScroll: true });
  }, [placed]);

  const popId = `${key}-pop`;
  const style =
    place && place !== "sheet"
      ? ({
          top: place.top,
          left: place.left,
          width: place.width,
          "--arrow": `${place.arrow}px`,
        } as CSSProperties)
      : undefined;

  return (
    <span className={corner ? "hint hint-corner" : "hint"}>
      <button
        ref={button}
        type="button"
        className="hint-dot"
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        aria-label={`Next.js feature: ${h.title}`}
        onClick={() => setOpenKey(open ? null : key)}
      />
      {open
        ? createPortal(
            <>
              {place === "sheet" ? <div className="hint-backdrop" aria-hidden="true" /> : null}
              <div
                ref={pop}
                id={popId}
                role="dialog"
                aria-labelledby={`${popId}-title`}
                tabIndex={-1}
                className={[
                  "hint-pop",
                  place === "sheet" ? "hint-sheet" : "",
                  place && place !== "sheet" && place.above ? "hint-above" : "",
                  place ? "" : "hint-measuring",
                ].join(" ")}
                style={style}
                onBlur={(e) => {
                  const to = e.relatedTarget as Node | null;
                  if (to && !pop.current?.contains(to) && !button.current?.contains(to)) close(false);
                }}
              >
                <div className="hint-head">
                  <span className="hint-eyebrow">Next.js feature</span>
                  <button type="button" className="hint-close" aria-label="Close" onClick={() => close(true)}>
                    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" fill="none" />
                    </svg>
                  </button>
                </div>
                <h2 id={`${popId}-title`} className="hint-title">
                  {h.title}
                </h2>
                <p className="hint-text">{h.next}</p>
                <div className="hint-swarza">
                  <span className="hint-label">On swarza</span>
                  <p>{h.swarza}</p>
                </div>
                <div className="hint-try">
                  <span className="hint-label">Try it</span>
                  <Steps steps={h.test} origin={window.location.origin} className="hint-steps" />
                </div>
                <Link href={`/under-the-hood#${h.page}`} className="hint-more" onClick={() => close(false)}>
                  Every feature, under the hood →
                </Link>
              </div>
            </>,
            document.body,
          )
        : null}
    </span>
  );
}
