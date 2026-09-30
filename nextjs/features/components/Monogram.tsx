import { initials } from "@/lib/program";

/** A speaker's initials on a tile in one of the HEAT colours, standing in for a photo. */
export function Monogram({ name, size }: { name: string; size?: "small" }) {
  const tone = [...name].reduce((n, c) => n + c.charCodeAt(0), 0) % 4;
  return (
    <span className={`monogram monogram-${tone}${size ? ` monogram-${size}` : ""}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
