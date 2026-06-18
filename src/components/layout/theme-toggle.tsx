"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/** Light / dark theme switch. Persists via next-themes and applies site-wide. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // Defaults to dark on the server / first paint; the client corrects it.
  const isDark = resolvedTheme !== "light";

  return (
    <button
      type="button"
      aria-label="Changer de thème"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full text-nautilus-gray hover:text-nautilus-gold hover:bg-nautilus-muted transition-colors",
        className
      )}
    >
      <span suppressHydrationWarning>
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </span>
    </button>
  );
}
