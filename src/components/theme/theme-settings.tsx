"use client";

import { Moon, Sun } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTheme } from "@/components/theme/theme-provider";

export function ThemeSettings() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="font-bold text-slate-950">Aparência</h2>
          <p className="mt-1 text-sm text-slate-500">
            Escolhe o tema utilizado neste browser.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <button
          type="button"
          role="switch"
          aria-checked={dark}
          onClick={toggleTheme}
          className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
              {dark ? (
                <Moon aria-hidden="true" className="size-5" />
              ) : (
                <Sun aria-hidden="true" className="size-5" />
              )}
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-900">
                Modo escuro
              </span>
              <span className="mt-0.5 block text-sm text-slate-500">
                {dark ? "Ativo neste browser" : "Desativado neste browser"}
              </span>
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              dark ? "bg-blue-600" : "bg-slate-200"
            }`}
          >
            <span
              className={`theme-switch-thumb absolute top-1 size-5 rounded-full bg-white shadow-sm transition-transform ${
                dark ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </span>
        </button>
      </CardContent>
    </Card>
  );
}
