import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-nautilus-gold/20 text-nautilus-gold border border-nautilus-gold/30",
        secondary: "bg-nautilus-muted text-nautilus-gray-light border border-nautilus-border",
        success: "bg-green-900/30 text-green-400 border border-green-800/50",
        warning: "bg-amber-900/30 text-amber-400 border border-amber-800/50",
        danger: "bg-red-900/30 text-red-400 border border-red-800/50",
        outline: "border border-nautilus-border text-nautilus-gray",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
