import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// shadcn/ui Button (new-york), adapted for a touch-only kiosk:
// - every size is at least 56px (min-h-touch) tall
// - press feedback uses `active:` instead of `hover:`
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-3 whitespace-nowrap rounded-xl font-semibold transition-[color,background-color,transform] outline-none select-none touch-manipulation active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs active:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs active:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs active:bg-accent active:text-accent-foreground dark:border-input dark:bg-input/30 dark:active:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs active:bg-secondary/80",
        ghost: "active:bg-accent active:text-accent-foreground dark:active:bg-accent/50",
        link: "text-primary underline underline-offset-4",
      },
      size: {
        default: "min-h-touch px-6 text-lg",
        sm: "min-h-touch px-4 text-base",
        lg: "min-h-18 px-8 text-xl",
        icon: "size-touch",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
