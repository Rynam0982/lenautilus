import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nautilus-gold focus-visible:ring-offset-2 focus-visible:ring-offset-nautilus-black disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-nautilus-gold text-nautilus-black hover:bg-nautilus-gold-light active:scale-[0.98]",
        outline:
          "border border-nautilus-border text-nautilus-white hover:border-nautilus-gold hover:text-nautilus-gold bg-transparent",
        ghost:
          "text-nautilus-gray hover:text-nautilus-white hover:bg-nautilus-muted bg-transparent",
        destructive:
          "bg-red-900/80 text-red-100 hover:bg-red-800 border border-red-800",
        link: "text-nautilus-gold underline-offset-4 hover:underline p-0 h-auto",
        secondary:
          "bg-nautilus-muted text-nautilus-white hover:bg-nautilus-border",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-sm",
        md: "h-10 px-5 text-sm rounded-md",
        lg: "h-12 px-8 text-base rounded-md",
        xl: "h-14 px-10 text-lg rounded-lg",
        icon: "h-10 w-10 rounded-md",
        "icon-sm": "h-8 w-8 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
