/**
 * Badge component with variants
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium tracking-wide transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-neutral-300 bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
        secondary: "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50",
        destructive: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100",
        outline: "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50",
        success: "border-neutral-300 bg-neutral-100 text-neutral-900",
        warning: "border-neutral-300 bg-neutral-100 text-neutral-900",
        info: "border-neutral-300 bg-neutral-100 text-neutral-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };