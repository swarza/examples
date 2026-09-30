"use client";
import { ExternalLink, Loader2, Monitor, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Module } from "@/lib/front-page";
import { buttonVariants } from "./ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

const widths = { desktop: 1280, phone: 390 } as const;
type Device = keyof typeof widths;

/** base64url of the UTF-8 JSON, as /preview/front?layout= expects. */
function encodeLayout(modules: Module[]) {
  const bytes = new TextEncoder().encode(JSON.stringify(modules));
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const frontPreviewUrl = (modules: Module[], embed: boolean) =>
  `/preview/front?layout=${encodeLayout(modules)}${embed ? "&embed=1" : ""}`;

/** Where a block starts inside the frame's document, less a little air above it. */
function blockTop(frame: HTMLIFrameElement | null, id: string) {
  const win = frame?.contentWindow;
  const el = win?.document.getElementById(id);
  return win && el ? Math.max(0, el.getBoundingClientRect().top + win.scrollY - 24) : null;
}

/**
 * The front page with the unsaved arrangement, in an iframe drawn at a real desktop or phone width
 * and scaled down to fit. It reloads a moment after the last change and follows `target`, the block
 * being edited: the frame's URL ends in #<block>, and a change that doesn't need a reload just
 * scrolls. A reload for the same block in the same order keeps the frame where it was.
 */
export function FrontPreview({
  modules,
  target,
}: {
  modules: Module[];
  /** The block to show; `seq` changes on every request, so clicking the same name scrolls again. */
  target: { id: string; seq: number } | null;
}) {
  const [device, setDevice] = useState<Device>("desktop");
  // On a phone, start with the phone-sized preview.
  useEffect(() => {
    if (matchMedia("(max-width: 767px)").matches) setDevice("phone");
  }, []);
  const [src, setSrc] = useState(() => frontPreviewUrl(modules, true));
  const [loading, setLoading] = useState(true);
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  /** What the frame shows now, and where to put it once the next load is done. */
  const shown = useRef({ base: src, target: null as string | null, order: "" });
  const restore = useRef<number | null>(null);

  useEffect(() => {
    const base = frontPreviewUrl(modules, true);
    const order = modules.map((m) => m.id).join();
    const id = target?.id ?? null;
    if (base === shown.current.base) {
      // Same arrangement: no reload, just scroll to the block.
      shown.current = { ...shown.current, target: id, order };
      const top = id ? blockTop(frame.current, id) : null;
      if (top !== null) frame.current?.contentWindow?.scrollTo({ top, behavior: "smooth" });
      return;
    }
    const timer = setTimeout(() => {
      const before = shown.current;
      const sameSpot = id === before.target && order === before.order;
      restore.current = sameSpot ? (frame.current?.contentWindow?.scrollY ?? null) : null;
      shown.current = { base, target: id, order };
      setLoading(true);
      setSrc(id ? `${base}#${id}` : base);
    }, 500);
    return () => clearTimeout(timer);
  }, [modules, target]);

  const onLoad = () => {
    setLoading(false);
    const win = frame.current?.contentWindow;
    const id = shown.current.target;
    const top = restore.current ?? (id ? blockTop(frame.current, id) : null);
    restore.current = null;
    if (win && top !== null) win.scrollTo({ top });
  };

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setBoxWidth(entry!.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const frameWidth = widths[device];
  const scale = boxWidth ? Math.min(1, boxWidth / frameWidth) : 0;
  const viewHeight = 640;

  return (
    <Card id="preview" className="scroll-mt-20 gap-3 pb-0 xl:sticky xl:top-20">
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription className="tabular-nums">
          {frameWidth} px wide{scale && scale < 1 ? `, shown at ${Math.round(scale * 100)}%` : ""}
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          <Tabs value={device} onValueChange={(v) => setDevice(v as Device)}>
            <TabsList aria-label="Preview width">
              <TabsTrigger value="desktop" className="px-2.5" aria-label="Desktop, 1280 pixels wide">
                <Monitor /> <span className="max-sm:sr-only">Desktop</span>
              </TabsTrigger>
              <TabsTrigger value="phone" className="px-2.5" aria-label="Phone, 390 pixels wide">
                <Smartphone /> <span className="max-sm:sr-only">Phone</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <a
            href={frontPreviewUrl(modules, false)}
            target="_blank"
            rel="noopener"
            className={buttonVariants({ variant: "ghost" })}
            aria-label="Open preview in a new tab"
          >
            <ExternalLink /> <span className="max-sm:sr-only">Open preview</span>
          </a>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <div
          ref={box}
          className="relative overflow-hidden border-t bg-muted/40"
          style={{ height: viewHeight }}
        >
          {scale ? (
            <div
              className="mx-auto overflow-hidden bg-background shadow-sm"
              style={{ width: frameWidth * scale, height: viewHeight }}
            >
              <iframe
                key={device}
                src={src}
                title="Front page preview"
                ref={frame}
                onLoad={onLoad}
                className="origin-top-left border-0"
                style={{
                  width: frameWidth,
                  height: viewHeight / scale,
                  transform: `scale(${scale})`,
                }}
              />
            </div>
          ) : null}
          <p
            aria-live="polite"
            className={
              loading
                ? "absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm ring-1 ring-foreground/10"
                : "sr-only"
            }
          >
            {loading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden /> Updating the preview
              </>
            ) : (
              "Preview up to date"
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
