/**
 * Progress bar component
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-slate-800/50 border border-slate-700",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500 relative"
        style={{
          transform: `translateX(-${100 - (value / max) * 100}%)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full animate-pulse opacity-75"></div>
      </div>
    </div>
  )
);
Progress.displayName = "Progress";

export { Progress };