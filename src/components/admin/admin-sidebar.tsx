"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  Users,
  BookOpen,
  BarChart3,
  RefreshCw,
  LogOut,
  Settings,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/admin/reservations", icon: BookOpen, label: "Réservations" },
  { href: "/admin/events", icon: CalendarDays, label: "Événements" },
  { href: "/admin/venues", icon: Building2, label: "Salles" },
  { href: "/admin/users", icon: Users, label: "Utilisateurs" },
  { href: "/admin/newsletter", icon: Mail, label: "Newsletter" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytiques" },
  { href: "/admin/openagenda", icon: RefreshCw, label: "OpenAgenda" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-nautilus-border bg-nautilus-dark flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-nautilus-border">
        <Logo size="sm" subtitle="Administration" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-nautilus-gold/10 text-nautilus-gold border border-nautilus-gold/20"
                  : "text-nautilus-gray hover:text-nautilus-white hover:bg-nautilus-muted"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-nautilus-border space-y-1">
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-sm text-nautilus-gray">Thème</span>
          <ThemeToggle />
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-nautilus-gray hover:text-nautilus-white hover:bg-nautilus-muted transition-all"
        >
          <Settings className="h-4 w-4" />
          Voir le site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-nautilus-gray hover:text-red-400 hover:bg-red-900/10 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
