"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import type { CurrentUser } from "@/features/auth/types";

export function AppShell({
  children,
  user,
}: {
  children: ReactNode;
  user: CurrentUser;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileDialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function openMobileMenu() {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setMobileMenuOpen(true);
  }

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mobileDialogRef.current
      ?.querySelector<HTMLElement>('[aria-label="Fechar menu"]')
      ?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [mobileMenuOpen]);

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMobileMenu();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = Array.from(
      mobileDialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable.at(-1)!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <a
        href="#main-content"
        className="fixed top-2 left-2 z-[60] -translate-y-20 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Saltar para o conteúdo
      </a>
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((current) => !current)}
        />
      </div>

      {mobileMenuOpen ? (
        <div
          ref={mobileDialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navegação principal"
          className="fixed inset-0 z-50 lg:hidden"
          onKeyDown={handleDialogKeyDown}
        >
          <button
            type="button"
            tabIndex={-1}
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]"
            aria-label="Fechar navegação"
            onClick={closeMobileMenu}
          />
          <div className="relative h-full w-72 max-w-[85vw] shadow-2xl">
            <AppSidebar mobile onClose={closeMobileMenu} />
          </div>
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <AppHeader user={user} onOpenMenu={openMobileMenu} />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1600px] p-4 focus:outline-none sm:p-6 lg:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
