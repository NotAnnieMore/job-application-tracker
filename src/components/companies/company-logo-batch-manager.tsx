"use client";

import {
  Building2,
  Check,
  LoaderCircle,
  RotateCcw,
  Save,
  Search,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { CompanyLogo } from "@/components/companies/company-logo";
import { EmptyState } from "@/components/shared/empty-state";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { updateCompanyLogosAction } from "@/features/companies/actions";
import type {
  BulkCompanyLogoActionResult,
  CompanyWithoutLogo,
} from "@/features/companies/types";
import { cn } from "@/lib/utils";

type LogoResult = {
  name: string;
  domain: string;
  website: string;
  logoUrl: string;
};

type CompanySearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; results: LogoResult[]; selected?: LogoResult };

type SearchResponse = {
  status: number;
  message?: string;
};

const emptySaveResult: BulkCompanyLogoActionResult | null = null;

export function CompanyLogoBatchManager({
  companies,
}: {
  companies: CompanyWithoutLogo[];
}) {
  const router = useRouter();
  const [searches, setSearches] = useState<Record<string, CompanySearchState>>(
    {},
  );
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isSearchingAll, setIsSearchingAll] = useState(false);
  const [batchMessage, setBatchMessage] = useState<string>();
  const [saveResult, setSaveResult] =
    useState<BulkCompanyLogoActionResult | null>(emptySaveResult);
  const [isSaving, startSaving] = useTransition();
  const visibleCompanies = companies.filter(
    (company) => !savedIds.has(company.id),
  );
  const selections = useMemo(
    () =>
      visibleCompanies.flatMap((company) => {
        const state = searches[company.id];
        if (state?.status !== "success" || !state.selected) return [];

        return [
          {
            companyId: company.id,
            logoUrl: state.selected.logoUrl,
            website: state.selected.website,
          },
        ];
      }),
    [searches, visibleCompanies],
  );

  async function searchCompany(
    company: CompanyWithoutLogo,
  ): Promise<SearchResponse> {
    setSearches((current) => ({
      ...current,
      [company.id]: { status: "loading" },
    }));

    try {
      const response = await fetch(
        `/api/company-logos?q=${encodeURIComponent(company.name)}`,
      );
      const payload = (await response.json()) as {
        message?: string;
        results?: LogoResult[];
      };

      if (!response.ok) {
        const message =
          payload.message ?? "Não foi possível procurar este logótipo.";
        setSearches((current) => ({
          ...current,
          [company.id]: { status: "error", message },
        }));
        return { status: response.status, message };
      }

      setSearches((current) => ({
        ...current,
        [company.id]: {
          status: "success",
          results: (payload.results ?? []).slice(0, 4),
        },
      }));
      return { status: response.status };
    } catch {
      const message = "Não foi possível contactar o serviço de logótipos.";
      setSearches((current) => ({
        ...current,
        [company.id]: { status: "error", message },
      }));
      return { status: 0, message };
    }
  }

  async function searchAll() {
    if (visibleCompanies.length === 0) return;

    setIsSearchingAll(true);
    setBatchMessage(undefined);
    setSaveResult(null);

    const [firstCompany, ...remainingCompanies] = visibleCompanies;
    const firstResult = await searchCompany(firstCompany);

    if (firstResult.status === 503) {
      setBatchMessage(firstResult.message);
      setIsSearchingAll(false);
      return;
    }

    for (let index = 0; index < remainingCompanies.length; index += 4) {
      const group = remainingCompanies.slice(index, index + 4);
      await Promise.all(group.map(searchCompany));
    }

    setIsSearchingAll(false);
  }

  function chooseResult(companyId: string, result: LogoResult) {
    setSearches((current) => {
      const state = current[companyId];
      if (state?.status !== "success") return current;

      return {
        ...current,
        [companyId]: { ...state, selected: result },
      };
    });
    setSaveResult(null);
  }

  function clearResult(companyId: string) {
    setSearches((current) => {
      const state = current[companyId];
      if (state?.status !== "success") return current;

      return {
        ...current,
        [companyId]: { ...state, selected: undefined },
      };
    });
  }

  function saveSelections() {
    startSaving(async () => {
      const result = await updateCompanyLogosAction(selections);
      setSaveResult(result);

      if (result.updatedIds.length > 0) {
        setSavedIds((current) => {
          const next = new Set(current);
          result.updatedIds.forEach((id) => next.add(id));
          return next;
        });
        router.refresh();
      }
    });
  }

  if (visibleCompanies.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="Todas as empresas têm logótipo"
        description="Não existem empresas por completar neste momento. Podes alterar qualquer imagem na edição individual."
        actionLabel="Voltar às empresas"
        actionHref="/empresas"
      />
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">
              {visibleCompanies.length} empresa(s) sem logótipo
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              A pesquisa não guarda nada automaticamente. Confirma apenas as
              correspondências corretas.
            </p>
          </div>
          <Button
            type="button"
            onClick={searchAll}
            disabled={isSearchingAll || isSaving}
            className="shrink-0"
          >
            {isSearchingAll ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : (
              <WandSparkles aria-hidden="true" className="size-4" />
            )}
            {isSearchingAll ? "A procurar..." : "Procurar todas"}
          </Button>
        </CardContent>
      </Card>

      {batchMessage ? (
        <p
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {batchMessage}
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {visibleCompanies.map((company) => {
          const state = searches[company.id] ?? { status: "idle" };

          return (
            <Card key={company.id} className="overflow-hidden">
              <CardContent>
                <div className="flex items-center gap-3">
                  <CompanyLogo name={company.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-bold text-slate-950">
                      {company.name}
                    </h2>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {company.website || "Website ainda por definir"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => searchCompany(company)}
                    disabled={state.status === "loading" || isSearchingAll}
                  >
                    {state.status === "loading" ? (
                      <LoaderCircle
                        aria-hidden="true"
                        className="size-4 animate-spin"
                      />
                    ) : state.status === "idle" ? (
                      <Search aria-hidden="true" className="size-4" />
                    ) : (
                      <RotateCcw aria-hidden="true" className="size-4" />
                    )}
                    {state.status === "loading"
                      ? "A procurar"
                      : state.status === "idle"
                        ? "Procurar"
                        : "Repetir"}
                  </Button>
                </div>

                {state.status === "idle" ? (
                  <p className="mt-5 rounded-xl bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
                    Ainda não pesquisado.
                  </p>
                ) : null}

                {state.status === "loading" ? (
                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[0, 1, 2, 3].map((item) => (
                      <span
                        key={item}
                        className="h-24 animate-pulse rounded-xl bg-slate-100"
                      />
                    ))}
                  </div>
                ) : null}

                {state.status === "error" ? (
                  <p
                    role="alert"
                    className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800"
                  >
                    {state.message}
                  </p>
                ) : null}

                {state.status === "success" && state.results.length === 0 ? (
                  <p className="mt-5 rounded-xl bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
                    Nenhuma sugestão encontrada. Mantém as iniciais ou adiciona
                    o URL na edição da empresa.
                  </p>
                ) : null}

                {state.status === "success" && state.results.length > 0 ? (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Escolhe apenas se reconheces a empresa
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {state.results.map((result) => {
                        const selected =
                          state.selected?.domain === result.domain;

                        return (
                          <button
                            key={result.domain}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => chooseResult(company.id, result)}
                            className={cn(
                              "relative flex min-w-0 flex-col items-center rounded-xl border bg-white p-3 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                              selected
                                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                : "border-slate-200 hover:border-blue-300",
                            )}
                          >
                            {selected ? (
                              <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-blue-600 text-white">
                                <Check
                                  aria-hidden="true"
                                  className="size-3.5"
                                />
                              </span>
                            ) : null}
                            <CompanyLogo
                              name={result.name}
                              logoUrl={result.logoUrl}
                              size="lg"
                            />
                            <span className="mt-2 block w-full truncate text-xs font-semibold text-slate-800">
                              {result.name}
                            </span>
                            <span className="mt-0.5 block w-full truncate text-[11px] text-slate-500">
                              {result.domain}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {state.selected ? (
                      <button
                        type="button"
                        onClick={() => clearResult(company.id)}
                        className="mt-3 text-xs font-semibold text-slate-500 hover:text-slate-900"
                      >
                        Não usar nenhuma destas sugestões
                      </button>
                    ) : (
                      <p className="mt-3 text-xs text-slate-500">
                        Sem seleção — esta empresa será ignorada ao guardar.
                      </p>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="sticky bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {selections.length} logótipo(s) selecionado(s)
            </p>
            {saveResult ? (
              <p
                role={saveResult.status === "error" ? "alert" : "status"}
                className={cn(
                  "mt-1 text-xs",
                  saveResult.status === "success"
                    ? "text-emerald-700"
                    : "text-red-700",
                )}
              >
                {saveResult.message}
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                As restantes empresas não serão alteradas.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href="/empresas"
              className={buttonClassName({ variant: "secondary" })}
            >
              Voltar
            </Link>
            <Button
              type="button"
              onClick={saveSelections}
              disabled={selections.length === 0 || isSaving || isSearchingAll}
            >
              {isSaving ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              ) : (
                <Save aria-hidden="true" className="size-4" />
              )}
              {isSaving ? "A guardar..." : "Guardar selecionados"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
