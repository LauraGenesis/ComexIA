"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Sparkles,
  FileText,
  BookOpen,
  Library,
  Calculator,
  Bell,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/expedientes", label: "Expedientes", icon: FolderOpen },
  { href: "/app/motor", label: "Motor IA", icon: Sparkles },
  { href: "/app/documentos", label: "Documentos", icon: FileText },
  { href: "/app/normativa", label: "Normativa", icon: BookOpen },
  { href: "/app/calculadora", label: "Calculadora", icon: Calculator },
  { href: "/app/biblioteca", label: "Biblioteca", icon: Library },
  { href: "/app/alertas", label: "Alertas", icon: Bell, badge: 3 },
  { href: "/app/configuracion", label: "Configuración", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-line bg-surface md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <span className="grid size-8 place-items-center rounded-lg bg-brand-gradient text-sm font-bold text-white shadow-[var(--shadow-brand)]">
          C
        </span>
        <span className="text-lg font-semibold tracking-tight text-ink">
          Comex<span className="text-brand-gradient">IA</span>
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {NAV.map(({ href, label, icon: Icon, badge }) => {
          const active =
            href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-muted hover:bg-canvas hover:text-ink",
              )}
            >
              {active ? (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-gradient" />
              ) : null}
              <Icon
                className={cn(
                  "size-4.5 transition-colors",
                  active
                    ? "text-accent-600"
                    : "text-faint group-hover:text-muted",
                )}
              />
              <span className="flex-1">{label}</span>
              {badge ? (
                <span className="grid size-5 place-items-center rounded-full bg-danger text-[11px] font-semibold text-white">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
