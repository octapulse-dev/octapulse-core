/**
 * Badge component with variants
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-bold mono-bold tracking-wide transition-all focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-sky-200 bg-sky-50 text-sky-700 shadow-sm hover:bg-sky-100 hover:border-sky-300",
        secondary:
          "border-gray-200 bg-gray-50 text-gray-700 shadow-sm hover:bg-gray-100 hover:border-gray-300",
        destructive:
          "border-red-200 bg-red-50 text-red-700 shadow-sm hover:bg-red-100 hover:border-red-300",
        outline: "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm hover:bg-emerald-100 hover:border-emerald-300",
        warning:
          "border-amber-200 bg-amber-50 text-amber-700 shadow-sm hover:bg-amber-100 hover:border-amber-300",
        info:
          "border-cyan-200 bg-cyan-50 text-cyan-700 shadow-sm hover:bg-cyan-100 hover:border-cyan-300",
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