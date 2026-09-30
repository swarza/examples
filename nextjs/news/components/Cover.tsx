import Image from "next/image";
import { mediaUrl } from "@/lib/media";

/**
 * A post's cover from the MEDIA bucket, or a light tile with the first letter when it has none.
 * Two shapes only: 3:2 (cards, rows) and 2:1 (`wide`: the lead story and the article).
 */
export function Cover({
  coverKey,
  alt,
  title,
  priority = false,
  wide = false,
  sizes = "(max-width: 600px) 100vw, 25vw",
}: {
  coverKey: string | null;
  alt: string;
  title: string;
  priority?: boolean;
  wide?: boolean;
  sizes?: string;
}) {
  const src = mediaUrl(coverKey);
  const cls = `cover${wide ? " cover-wide" : ""}${src ? "" : " cover-blank"}`;
  return (
    <div className={cls}>
      {src ? (
        <Image src={src} alt={alt} width={1200} height={800} sizes={sizes} priority={priority} />
      ) : (
        <span aria-hidden>{title.slice(0, 1)}</span>
      )}
    </div>
  );
}
