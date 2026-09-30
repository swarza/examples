import { initials } from "@/lib/program";

/** A speaker's initials in a square tile, standing in for a photo. */
export function Monogram({ name, size }: { name: string; size?: "small" }) {
  return (
    <span className={`monogram${size ? ` monogram-${size}` : ""}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
