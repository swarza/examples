import { Page } from "../../_components/page-header";
import { Skeleton } from "../../_components/ui/skeleton";

export default function Loading() {
  return (
    <Page>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </Page>
  );
}
