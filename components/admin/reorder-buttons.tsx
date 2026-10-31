import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";

/** ↑/↓ buttons that post to a move action; easier than dragging on a phone. */
export function ReorderButtons({
  id,
  label,
  action,
  first,
  last,
}: {
  id: string;
  label: string;
  action: (formData: FormData) => Promise<void>;
  first: boolean;
  last: boolean;
}) {
  return (
    <form action={action} className="flex shrink-0 gap-1">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" name="direction" value="up" size="compact" variant="ghost" disabled={first} aria-label={`Move ${label} up`}>
        <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} aria-hidden />
      </Button>
      <Button type="submit" name="direction" value="down" size="compact" variant="ghost" disabled={last} aria-label={`Move ${label} down`}>
        <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} aria-hidden />
      </Button>
    </form>
  );
}
