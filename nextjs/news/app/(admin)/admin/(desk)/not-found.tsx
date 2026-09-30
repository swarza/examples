import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Page } from "../../_components/page-header";
import { buttonVariants } from "../../_components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../../_components/ui/empty";

export default function NotFound() {
  return (
    <Page>
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestion />
          </EmptyMedia>
          <EmptyTitle>Not found</EmptyTitle>
          <EmptyDescription>That story or page does not exist. It may have been deleted.</EmptyDescription>
        </EmptyHeader>
        <Link href="/admin/posts" className={buttonVariants({ variant: "outline" })}>
          Back to stories
        </Link>
      </Empty>
    </Page>
  );
}
