import {
  CalendarClock,
  CircleAlert,
  Filter,
  ListChecks,
  Pencil,
  Plus,
} from "lucide-react";
import Link from "next/link";

import {
  ActionPriorityBadge,
  ActionStatusBadge,
} from "@/components/actions/action-badges";
import { ActionQuickStatusForm } from "@/components/actions/action-quick-status-form";
import { AutoSubmitSelect } from "@/components/applications/auto-submit-select";
import { CompanyLogo } from "@/components/companies/company-logo";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ActiveFilters,
  type ActiveFilter,
} from "@/components/shared/active-filters";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  actionPriorityOptions,
  actionStatusOptions,
} from "@/features/actions/constants";
import { formatActionDate } from "@/features/actions/date";
import {
  getActionApplicationOptions,
  getActions,
} from "@/features/actions/data";
import type { ActionDueFilter } from "@/features/actions/types";
import type {
  ActionPriorityValue,
  ActionStatusValue,
} from "@/types/database.types";

const notices: Record<string, string> = {
  "acao-criada": "Ação criada com sucesso.",
  "acao-atualizada": "Ação atualizada com sucesso.",
  "acao-eliminada": "Ação eliminada com sucesso.",
};

const dueFilterOptions: Array<{ value: ActionDueFilter; label: string }> = [
  { value: "overdue", label: "Em atraso" },
  { value: "today", label: "Para hoje" },
  { value: "upcoming", label: "Futuras" },
  { value: "no_date", label: "Sem prazo" },
];

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function validStatus(value: string): value is ActionStatusValue {
  return actionStatusOptions.some((option) => option.value === value);
}

function validPriority(value: string): value is ActionPriorityValue {
  return actionPriorityOptions.some((option) => option.value === value);
}

function validTiming(value: string): value is ActionDueFilter {
  return dueFilterOptions.some((option) => option.value === value);
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export default async function ActionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawStatus = singleValue(params.estado);
  const rawPriority = singleValue(params.prioridade);
  const rawTiming = singleValue(params.prazo);
  const rawDueFrom = singleValue(params.desde);
  const rawDueTo = singleValue(params.ate);
  const status = validStatus(rawStatus) ? rawStatus : undefined;
  const priority = validPriority(rawPriority) ? rawPriority : undefined;
  const timing = validTiming(rawTiming) ? rawTiming : undefined;
  const dueFrom = validDate(rawDueFrom) ? rawDueFrom : undefined;
  const dueTo = validDate(rawDueTo) ? rawDueTo : undefined;
  const applicationId = singleValue(params.candidatura);
  const [data, applications] = await Promise.all([
    getActions({
      status,
      priority,
      applicationId: applicationId || undefined,
      timing,
      dueFrom,
      dueTo,
    }),
    getActionApplicationOptions(),
  ]);
  const notice = notices[singleValue(params.aviso)];
  const activeFilters: ActiveFilter[] = [
    ...(status
      ? [
          {
            label: "Estado",
            value:
              actionStatusOptions.find((option) => option.value === status)
                ?.label ?? status,
          },
        ]
      : []),
    ...(priority
      ? [
          {
            label: "Prioridade",
            value:
              actionPriorityOptions.find((option) => option.value === priority)
                ?.label ?? priority,
          },
        ]
      : []),
    ...(timing
      ? [
          {
            label: "Prazo",
            value:
              dueFilterOptions.find((option) => option.value === timing)
                ?.label ?? timing,
          },
        ]
      : []),
    ...(applicationId
      ? [
          {
            label: "Candidatura",
            value:
              applications.find(
                (application) => application.id === applicationId,
              )?.title ?? "Desconhecida",
          },
        ]
      : []),
    ...(dueFrom ? [{ label: "Desde", value: formatActionDate(dueFrom) }] : []),
    ...(dueTo ? [{ label: "Até", value: formatActionDate(dueTo) }] : []),
  ];
  const hasFilters = activeFilters.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ações"
        description="Organiza as tarefas concretas que mantêm cada candidatura em movimento."
        action={
          <Link href="/acoes/nova" className={buttonClassName()}>
            <Plus aria-hidden="true" className="size-4" />
            Nova ação
          </Link>
        }
      />

      {notice ? (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {notice}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Pendentes",
            value: data.summary.pending,
            tone: "text-blue-700",
          },
          {
            label: "Em atraso",
            value: data.summary.overdue,
            tone: "text-red-600",
          },
          {
            label: "Para hoje",
            value: data.summary.dueToday,
            tone: "text-amber-600",
          },
          {
            label: "Concluídas",
            value: data.summary.completed,
            tone: "text-emerald-600",
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent>
              <p className={`text-3xl font-bold ${item.tone}`}>{item.value}</p>
              <p className="mt-1 text-sm text-slate-500">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <form
          action="/acoes"
          method="get"
          className="grid items-end gap-3 p-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <AutoSubmitSelect
            name="estado"
            defaultValue={status ?? ""}
            aria-label="Filtrar por estado"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Todos os estados</option>
            {actionStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AutoSubmitSelect>
          <AutoSubmitSelect
            name="prioridade"
            defaultValue={priority ?? ""}
            aria-label="Filtrar por prioridade"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Todas as prioridades</option>
            {actionPriorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AutoSubmitSelect>
          <AutoSubmitSelect
            name="prazo"
            defaultValue={timing ?? ""}
            aria-label="Filtrar por prazo"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Todos os prazos</option>
            {dueFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AutoSubmitSelect>
          <AutoSubmitSelect
            name="candidatura"
            defaultValue={applicationId}
            aria-label="Filtrar por candidatura"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Todas as candidaturas</option>
            {applications.map((application) => (
              <option key={application.id} value={application.id}>
                {application.companyName} — {application.title}
              </option>
            ))}
          </AutoSubmitSelect>
          <label className="grid gap-1.5 text-xs font-semibold text-slate-600">
            Prazo desde
            <input
              type="date"
              name="desde"
              defaultValue={dueFrom ?? ""}
              max={dueTo}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold text-slate-600">
            Prazo até
            <input
              type="date"
              name="ate"
              defaultValue={dueTo ?? ""}
              min={dueFrom}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            />
          </label>
          <button
            type="submit"
            className={buttonClassName({ variant: "secondary" })}
          >
            <Filter aria-hidden="true" className="size-4" />
            Aplicar datas
          </button>
        </form>
      </Card>

      <ActiveFilters filters={activeFilters} clearHref="/acoes" />

      {data.items.length === 0 ? (
        <EmptyState
          icon={hasFilters ? CircleAlert : ListChecks}
          title={
            hasFilters ? "Nenhuma ação encontrada" : "Ainda não existem ações"
          }
          description={
            hasFilters
              ? "Altera ou limpa os filtros para voltares a ver todas as ações."
              : "Cria uma tarefa concreta para manteres o próximo passo visível."
          }
          actionLabel={hasFilters ? "Limpar filtros" : "Criar ação"}
          actionHref={hasFilters ? "/acoes" : "/acoes/nova"}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-slate-100">
            {data.items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <CompanyLogo
                    name={item.companyName}
                    logoUrl={item.companyLogoUrl}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-semibold ${
                        item.status === "completed"
                          ? "text-slate-400 line-through"
                          : "text-slate-900"
                      }`}
                    >
                      {item.description}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {item.title} · {item.companyName}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <ActionStatusBadge status={item.status} />
                      <ActionPriorityBadge priority={item.priority} />
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          item.timing === "overdue"
                            ? "text-red-600"
                            : item.timing === "today"
                              ? "text-amber-600"
                              : "text-slate-500"
                        }`}
                      >
                        <CalendarClock
                          aria-hidden="true"
                          className="size-3.5"
                        />
                        {item.dueDate
                          ? item.timing === "today"
                            ? "Hoje"
                            : item.timing === "overdue"
                              ? `Em atraso · ${formatActionDate(item.dueDate)}`
                              : formatActionDate(item.dueDate)
                          : "Sem prazo"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-auto">
                  <ActionQuickStatusForm
                    actionId={item.id}
                    status={item.status}
                  />
                  <Link
                    href={`/acoes/${item.id}/editar`}
                    aria-label={`Editar ${item.description}`}
                    className={buttonClassName({
                      variant: "secondary",
                      size: "icon",
                    })}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
