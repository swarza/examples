import type { ReactNode } from "react";

/**
 * The strip above a preview. Fixed over the masthead's top margin, so the page under it sits
 * exactly where it will once it is public.
 */
export function PreviewBar({ children, edit }: { children: ReactNode; edit?: string }) {
  return (
    <div className="preview-bar" role="status">
      <div className="wrap preview-bar-inner">
        <span>{children}</span>
        {/* The newsroom is another app shell, so a plain link. */}
        {edit ? <a href={edit}>Edit story</a> : null}
      </div>
    </div>
  );
}
