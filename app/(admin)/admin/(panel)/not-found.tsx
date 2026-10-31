import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-3xl">Not found</h1>
      <p className="text-muted-foreground">It may have been deleted.</p>
      <Button asChild size="compact" variant="outline">
        <Link href="/admin">Back to admin</Link>
      </Button>
    </div>
  );
}
