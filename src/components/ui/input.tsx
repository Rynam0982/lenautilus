import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => (
    <div className="w-full">
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border bg-nautilus-dark px-3 py-2 text-sm text-nautilus-white placeholder:text-nautilus-gray",
          "border-nautilus-border focus:border-nautilus-gold focus:outline-none focus:ring-1 focus:ring-nautilus-gold",
          "transition-colors duration-200",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

export { Input };
