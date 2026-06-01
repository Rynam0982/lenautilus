import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border bg-nautilus-dark px-3 py-2 text-sm text-nautilus-white placeholder:text-nautilus-gray",
          "border-nautilus-border focus:border-nautilus-gold focus:outline-none focus:ring-1 focus:ring-nautilus-gold",
          "transition-colors duration-200 resize-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
