"use client";
import { useSyncExternalStore } from "react";
import { HINTS_KEY } from "@/lib/features";
import { closeHints } from "./FeatureHint";

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};
const shown = () => document.documentElement.dataset.hints !== "off";

/** The header switch that shows or hides the feature dots. It is on until you turn it off. */
export function HintsToggle() {
  const on = useSyncExternalStore(subscribe, shown, () => true);
  const flip = () => {
    const next = on ? "off" : "on";
    document.documentElement.dataset.hints = next;
    try {
      localStorage.setItem(HINTS_KEY, next);
    } catch {
      // Private mode or blocked storage: the choice lasts until the next page load.
    }
    closeHints();
    listeners.forEach((l) => l());
  };
  return (
    <button type="button" role="switch" aria-checked={on} className="hints-toggle" onClick={flip}>
      <span className="hints-switch" aria-hidden="true" />
      <span>Show features</span>
    </button>
  );
}
