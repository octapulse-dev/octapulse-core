/**
 * Reusable Button component with variants
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium tracking-wide transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-neutral-800",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50",
        secondary: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
        ghost: "text-neutral-800 hover:bg-neutral-100",
        link: "text-black underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2.5 text-sm",
        sm: "h-8 px-3 py-2 text-xs",
        lg: "h-12 px-6 py-3 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };