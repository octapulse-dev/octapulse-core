/**
 * Badge component with variants
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-bold tech-mono tracking-wide transition-all focus:outline-none focus-glow",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-sky-500/20 to-emerald-500/20 text-sky-400 shadow-lg backdrop-blur-sm hover:from-sky-500/30 hover:to-emerald-500/30",
        secondary:
          "border-slate-600 bg-slate-800/50 text-slate-300 backdrop-blur-sm hover:bg-slate-700/50 hover:border-slate-500",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 shadow-lg backdrop-blur-sm hover:from-red-500/30 hover:to-red-600/30",
        outline: "border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white",
        success:
          "border-transparent bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 shadow-lg backdrop-blur-sm hover:from-emerald-500/30 hover:to-green-500/30",
        warning:
          "border-transparent bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 shadow-lg backdrop-blur-sm hover:from-amber-500/30 hover:to-yellow-500/30",
        info:
          "border-transparent bg-gradient-to-r from-cyan-500/20 to-sky-500/20 text-cyan-400 shadow-lg backdrop-blur-sm hover:from-cyan-500/30 hover:to-sky-500/30",
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