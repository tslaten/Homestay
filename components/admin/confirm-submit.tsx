"use client";

import { Button } from "@/components/ui/button";

/** Submit button that asks first (native confirm: reliable on phones). */
export function ConfirmSubmit({
  message,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { message: string }) {
  return (
    <Button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
