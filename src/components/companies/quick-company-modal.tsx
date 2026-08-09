"use client";

import { Building2, LoaderCircle, Save, X } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { CompanyLogoField } from "@/components/companies/company-logo-field";
import { Button } from "@/components/ui/button";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { createQuickCompanyAction } from "@/features/companies/actions";
import { initialQuickCompanyActionState } from "@/features/companies/types";

type CreatedCompany = {
  id: string;
  name: string;
};

export function QuickCompanyModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (company: CreatedCompany) => void;
}) {
  const [state, formAction, pending] = useActionState(
    createQuickCompanyAction,
    initialQuickCompanyActionState,
  );
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "success" && state.company) {
      onCreated(state.company);
    }
  }, [onCreated, state]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("input")?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function handleDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && !pending) {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-company-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onKeyDown={handleDialogKeyDown}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Building2 aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 id="quick-company-title" className="font-bold text-slate-950">
                Criar empresa
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Adiciona os dados essenciais e continua a candidatura.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Fechar"
            title="Fechar"
            disabled={pending}
            onClick={onClose}
          >
            <X aria-hidden="true" className="size-5" />
          </Button>
        </div>

        <form
          action={formAction}
          className="space-y-5 p-5 sm:p-6"
          onSubmit={(event) => event.stopPropagation()}
        >
          {state.message ? (
            <p
              role="alert"
              aria-live="polite"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {state.message}
            </p>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Nome"
              htmlFor="quick-company-name"
              required
              error={state.fieldErrors?.name}
            >
              <input
                id="quick-company-name"
                name="name"
                type="text"
                autoComplete="organization"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Ex.: Empresa Exemplo"
                className={fieldClassName}
                maxLength={160}
                aria-invalid={Boolean(state.fieldErrors?.name)}
                required
              />
            </FormField>
            <FormField
              label="Website"
              htmlFor="quick-company-website"
              hint="Opcional. Também ajuda a encontrar o logótipo correto."
              error={state.fieldErrors?.website}
            >
              <input
                id="quick-company-website"
                name="website"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="empresa.pt"
                className={fieldClassName}
                maxLength={500}
                aria-invalid={Boolean(state.fieldErrors?.website)}
              />
            </FormField>
            <CompanyLogoField
              companyName={companyName}
              website={website}
              onWebsiteChange={setWebsite}
              initialLogoUrl=""
              error={state.fieldErrors?.logoUrl}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin motion-reduce:animate-none"
                />
              ) : (
                <Save aria-hidden="true" className="size-4" />
              )}
              {pending ? "A guardar..." : "Guardar e selecionar"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
