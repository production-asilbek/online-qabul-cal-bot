"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, MoreHorizontal, Sun, Users } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ITEMS = [
  { href: "/", label: "Today", icon: Sun },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[color-mix(in_srgb,var(--tg-hint-color)_20%,transparent)] bg-[var(--tg-bottom-bar-bg-color)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-[var(--tg-button-color)]" : "text-[var(--tg-hint-color)]",
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
