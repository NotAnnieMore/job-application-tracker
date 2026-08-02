"use client";

import { Bell, Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AppHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
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
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl p-1.5 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          title="Menu de utilizador será ligado à autenticação"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            UT
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-semibold text-slate-900">
              Utilizador
            </span>
            <span className="block text-xs text-slate-500">
              Conta de demonstração
            </span>
          </span>
        </button>
      </div>
    </header>
  );
}
