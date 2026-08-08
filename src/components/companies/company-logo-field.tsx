"use client";

import { Check, LoaderCircle, Search, Trash2 } from "lucide-react";
import { useState } from "react";

import { CompanyLogo } from "@/components/companies/company-logo";
import { Button } from "@/components/ui/button";
import { FormField, fieldClassName } from "@/components/ui/form-field";

type LogoResult = {
  name: string;
  domain: string;
  website: string;
  logoUrl: string;
};

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; results: LogoResult[] };

export function CompanyLogoField({
  companyName,
  website,
  onWebsiteChange,
  initialLogoUrl,
  error,
}: {
  companyName: string;
  website: string;
  onWebsiteChange: (value: string) => void;
  initialLogoUrl: string;
  error?: string;
}) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [searchState, setSearchState] = useState<SearchState>({
    status: "idle",
  });

  async function searchLogos() {
    const query = companyName.trim();

    if (query.length < 2) {
      setSearchState({
        status: "error",
        message: "Escreve primeiro o nome da empresa.",
      });
      return;
    }

    setSearchState({ status: "loading" });

    try {
      const response = await fetch(
        `/api/company-logos?q=${encodeURIComponent(query)}`,
      );
      const payload = (await response.json()) as {
        message?: string;
        results?: LogoResult[];
      };

      if (!response.ok) {
        setSearchState({
          status: "error",
          message: payload.message ?? "Não foi possível procurar logótipos.",
        });
        return;
      }

      setSearchState({ status: "success", results: payload.results ?? [] });
    } catch {
      setSearchState({
        status: "error",
        message: "Não foi possível contactar o serviço de logótipos.",
      });
    }
  }

  function chooseLogo(result: LogoResult) {
    setLogoUrl(result.logoUrl);
    if (!website.trim()) onWebsiteChange(result.website);
    setSearchState({ status: "idle" });
  }

  return (
    <div className="md:col-span-2">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <CompanyLogo
            name={companyName || "Empresa"}
            logoUrl={logoUrl}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <FormField
              label="Logótipo"
              htmlFor="company-logo-url"
              hint="Procura automaticamente ou cola um endereço HTTPS. Se ficar vazio, serão mostradas as iniciais."
              error={error}
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="company-logo-url"
                  name="logoUrl"
                  type="url"
                  inputMode="url"
                  value={logoUrl}
                  onChange={(event) => setLogoUrl(event.target.value)}
                  placeholder="https://.../logo.png"
                  className={fieldClassName}
                  maxLength={1000}
                  aria-invalid={Boolean(error)}
                  aria-describedby={
                    error ? "company-logo-url-error" : "company-logo-url-hint"
                  }
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0"
                  onClick={searchLogos}
                  disabled={searchState.status === "loading"}
                >
                  {searchState.status === "loading" ? (
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-4 animate-spin"
                    />
                  ) : (
                    <Search aria-hidden="true" className="size-4" />
                  )}
                  {searchState.status === "loading"
                    ? "A procurar..."
                    : "Encontrar logótipo"}
                </Button>
                {logoUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Remover logótipo"
                    aria-label="Remover logótipo"
                    className="shrink-0"
                    onClick={() => setLogoUrl("")}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </Button>
                ) : null}
              </div>
            </FormField>
          </div>
        </div>

        {searchState.status === "error" ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
          >
            {searchState.message}
          </p>
        ) : null}

        {searchState.status === "success" ? (
          <div className="mt-4 border-t border-slate-200 pt-4">
            {searchState.results.length === 0 ? (
              <p className="text-sm text-slate-600">
                Não foram encontrados resultados. Podes colar o endereço
                manualmente ou manter as iniciais.
              </p>
            ) : (
              <>
                <p className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Confirma a empresa correta
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {searchState.results.map((result) => (
                    <button
                      key={`${result.domain}-${result.name}`}
                      type="button"
                      onClick={() => chooseLogo(result)}
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <CompanyLogo
                        name={result.name}
                        logoUrl={result.logoUrl}
                        size="md"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                          {result.name}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {result.domain}
                        </span>
                      </span>
                      <Check
                        aria-hidden="true"
                        className="size-4 shrink-0 text-blue-600"
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
