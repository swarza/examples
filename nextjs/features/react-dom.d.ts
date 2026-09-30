// The one react-dom function the site uses (components/FeatureHint.tsx), typed here so the
// example needs no @types/react-dom.
declare module "react-dom" {
  import type { ReactNode, ReactPortal } from "react";
  export function createPortal(children: ReactNode, container: Element | DocumentFragment): ReactPortal;
}
