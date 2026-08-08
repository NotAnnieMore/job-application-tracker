"use client";

import { BriefcaseBusiness, ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { mainNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  collapsed?: boolean;
  mobile?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

export function AppSidebar({
  collapsed = false,
  mobile = false,
  onClose,
  onToggle,
}: AppSidebarProps) {
  const pathname = usePathname();
  const compact = collapsed && !mobile;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-200 bg-white transition-[width] duration-200",
        compact ? "w-20" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-18 items-center border-b border-slate-100 px-4",
          compact ? "justify-center" : "justify-between",
        )}
      >
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          onClick={onClose}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
            <BriefcaseBusiness aria-hidden="true" className="size-5" />
          </span>
          {!compact ? (
            <span className="truncate text-sm font-bold text-slate-950">
              Job Application Tracker
            </span>
          ) : null}
        </Link>

        {mobile ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Fechar menu"
            onClick={onClose}
          >
            <X aria-hidden="true" className="size-5" />
          </Button>
        ) : null}
      </div>

      <nav
        className="flex-1 space-y-1 overflow-y-auto p-3"
        aria-label="Principal"
      >
        {mainNavigation.map((item) => {
          const isActive =
            (item.href === "/dashboard" && pathname === "/") ||
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={compact ? item.label : undefined}
              onClick={onClose}
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                compact && "justify-center px-0",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
              )}
            >
              <Icon aria-hidden="true" className="size-5 shrink-0" />
              {!compact ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        {!compact ? (
          <div className="mb-3 rounded-xl bg-slate-50 px-3 py-3">
            <p className="text-xs font-semibold text-slate-700">Fase 5</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Empresas com dados reais
            </p>
          </div>
        ) : null}
        {!mobile ? (
          <Button
            variant="ghost"
            size={compact ? "icon" : "sm"}
            className={cn("w-full", !compact && "justify-start")}
            aria-label={compact ? "Expandir sidebar" : "Recolher sidebar"}
            onClick={onToggle}
          >
            {compact ? (
              <ChevronRight aria-hidden="true" className="size-4" />
            ) : (
              <>
                <ChevronLeft aria-hidden="true" className="size-4" />
                Recolher
              </>
            )}
          </Button>
        ) : null}
      </div>
    </aside>
  );
}
