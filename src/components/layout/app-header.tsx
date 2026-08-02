"use client";

import { Bell, LogOut, Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
import type { CurrentUser } from "@/features/auth/types";

function userInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  return (parts.length > 1 ? `${parts[0][0]}${parts.at(-1)?.[0]}` : parts[0])
    ?.slice(0, 2)
    .toUpperCase();
}

export function AppHeader({
  onOpenMenu,
  user,
}: {
  onOpenMenu: () => void;
  user: CurrentUser;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-18 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Abrir menu"
        onClick={onOpenMenu}
      >
        <Menu aria-hidden="true" className="size-5" />
      </Button>

      <label className="relative hidden max-w-xl flex-1 sm:block">
        <span className="sr-only">Pesquisar</span>
        <Search
          aria-hidden="true"
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          placeholder="Pesquisar candidaturas, empresas..."
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-4 pl-10 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-3 focus:ring-blue-100"
          aria-label="Pesquisar candidaturas e empresas"
        />
      </label>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notificações"
          title="Notificações serão implementadas numa fase futura"
        >
          <Bell aria-hidden="true" className="size-5" />
        </Button>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-3 rounded-xl p-1.5 text-left">
          <span className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {userInitials(user.fullName) ?? "UT"}
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-semibold text-slate-900">
              {user.fullName}
            </span>
            <span className="block max-w-48 truncate text-xs text-slate-500">
              {user.email}
            </span>
          </span>
        </div>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label="Terminar sessão"
            title="Terminar sessão"
          >
            <LogOut aria-hidden="true" className="size-5" />
          </Button>
        </form>
      </div>
    </header>
  );
}
