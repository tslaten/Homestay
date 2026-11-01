import { cn } from "@/lib/utils";

/**
 * A phone number that's tap-to-call on phones. On the Echo Show (md and up)
 * it can't place calls, so the link is inert there and reads as plain text.
 */
export function PhoneLink({ phone, className, children }: { phone: string; className?: string; children?: React.ReactNode }) {
  const tel = phone.replace(/[^\d+]/g, "");
  return (
    <a href={`tel:${tel}`} className={cn("underline-offset-4 max-md:underline md:pointer-events-none", className)}>
      {children ?? phone}
    </a>
  );
}
