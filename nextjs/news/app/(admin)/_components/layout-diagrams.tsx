import type { LeadLayout, RowLayout, SidebarPlace, SidebarStyle, Tone } from "@/lib/front-page";

/**
 * Small drawings of each front-page option, shown next to its name in the selects. Solid blocks
 * are stories with pictures, thin bars are headlines, the dark block is a black panel or band.
 */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 16"
      className="h-4 w-6 shrink-0 text-muted-foreground"
      aria-hidden
      data-slot="layout-diagram"
    >
      <rect
        x="0.5"
        y="0.5"
        width="23"
        height="15"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        opacity="0.35"
      />
      {children}
    </svg>
  );
}

const Block = (p: { x: number; y: number; w: number; h: number; dark?: boolean }) => (
  <rect
    x={p.x}
    y={p.y}
    width={p.w}
    height={p.h}
    rx="0.75"
    fill="currentColor"
    opacity={p.dark ? 0.9 : 0.55}
  />
);
const Lines = ({ x, y, w, n }: { x: number; y: number; w: number; n: number }) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={x} y={y + i * 3} width={w} height="1.2" rx="0.6" fill="currentColor" opacity="0.45" />
    ))}
  </>
);

export const leadDiagrams: Record<LeadLayout, React.ReactNode> = {
  "list-right": (
    <Frame>
      <Block x={3} y={3} w={11} h={10} />
      <Lines x={16} y={4} w={5} n={3} />
    </Frame>
  ),
  "list-left": (
    <Frame>
      <Lines x={3} y={4} w={5} n={3} />
      <Block x={10} y={3} w={11} h={10} />
    </Frame>
  ),
  wide: (
    <Frame>
      <Block x={3} y={3} w={18} h={6} />
      <Lines x={3} y={11} w={18} n={2} />
    </Frame>
  ),
};

export const rowDiagrams: Record<RowLayout, React.ReactNode> = {
  "big-left": (
    <Frame>
      <Block x={3} y={3} w={10} h={10} />
      <Block x={15} y={3} w={6} h={4} />
      <Block x={15} y={9} w={6} h={4} />
    </Frame>
  ),
  equal: (
    <Frame>
      <Block x={3} y={4} w={5} h={8} />
      <Block x={9.5} y={4} w={5} h={8} />
      <Block x={16} y={4} w={5} h={8} />
    </Frame>
  ),
  "big-right": (
    <Frame>
      <Block x={3} y={3} w={6} h={4} />
      <Block x={3} y={9} w={6} h={4} />
      <Block x={11} y={3} w={10} h={10} />
    </Frame>
  ),
  list: (
    <Frame>
      <Lines x={3} y={3.5} w={18} n={4} />
    </Frame>
  ),
};

export const sidebarDiagrams: Record<SidebarPlace, React.ReactNode> = {
  right: (
    <Frame>
      <Lines x={3} y={3.5} w={11} n={4} />
      <Block x={16} y={3} w={5} h={10} dark />
    </Frame>
  ),
  left: (
    <Frame>
      <Block x={3} y={3} w={5} h={10} dark />
      <Lines x={10} y={3.5} w={11} n={4} />
    </Frame>
  ),
  none: (
    <Frame>
      <Lines x={3} y={3.5} w={18} n={4} />
    </Frame>
  ),
};

/** Black is a filled square; none/plain is hollow, the same in both themes. */
const Swatch = ({ dark }: { dark: boolean }) => (
  <span
    aria-hidden
    className={
      dark
        ? "size-3.5 shrink-0 rounded-sm bg-black ring-1 ring-foreground/40 dark:ring-foreground/70"
        : "size-3.5 shrink-0 rounded-sm border border-dashed border-foreground/50 bg-transparent"
    }
  />
);

export const toneSwatches: Record<Tone, React.ReactNode> = {
  plain: <Swatch dark={false} />,
  black: <Swatch dark />,
};

export const sidebarStyleSwatches: Record<SidebarStyle, React.ReactNode> = {
  plain: <Swatch dark={false} />,
  black: <Swatch dark />,
};
