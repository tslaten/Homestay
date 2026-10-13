import * as React from "react";

import { cn } from "@/lib/utils";

/** A styled native <select>: best-in-class on phones, where admin is used. */
function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "h-11 w-full rounded-md border border-input bg-card px-3 text-base shadow-xs outline-none",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { NativeSelect };
