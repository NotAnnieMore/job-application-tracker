import { getLocale, getTranslations } from "next-intl/server";
import {
  BellRing,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  ChevronRight,
  CircleAlert,
  ListChecks,
  Plus,
} from "lucide-react";
import Link from "next/link";

import { ActionPriorityBadge } from "@/components/actions/action-badges";
import { AutoSubmitSelect } from "@/components/applications/auto-submit-select";
import { CompanyLogo } from "@/components/companies/company-logo";
import {
  ActiveFilters,
  type ActiveFilter,
} from "@/components/shared/active-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAgendaData } from "@/features/calendar/data";
import { formatAgendaDate } from "@/features/calendar/date";
import type {
  AgendaItem,
  AgendaItemKind,
  AgendaPeriod,
} from "@/features/calendar/types";
import { formatInterviewTime } from "@/features/interviews/date";

const kindOptions: Array<{ value: AgendaItemKind }> = [
  { value: "interview" },
  { value: "follow_up" },
  { value: "action" },
];

const periodOptions: Array<{ value: AgendaPeriod }> = [
  { value: "all" },
  { value: "overdue" },
  { value: "today" },
  { value: "next_7" },
  { value: "next_30" },
];

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function validKind(value: string): value is AgendaItemKind {
  return kindOptions.some((option) => option.value === value);
}

function validPeriod(value: string): value is AgendaPeriod {
  return periodOptions.some((option) => option.value === value);
}

function addDays(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

function groupItems(items: AgendaItem[]) {
  const groups = new Map<string, AgendaItem[]>();
  for (const item of items) {
    groups.set(item.date, [...(groups.get(item.date) ?? []), item]);
  }
  return [...groups.entries()];
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const t = await getTranslations("Agenda");
  const itemPresentation = {
    interview: {
      label: t("item_interview"),
      icon: CalendarDays,
      badge: "border-violet-200 bg-violet-50 text-violet-700",
      iconBox: "bg-violet-50 text-violet-600",
    },
    follow_up: {
      label: t("item_follow_up"),
      icon: BellRing,
      badge: "border-amber-200 bg-amber-50 text-amber-700",
      iconBox: "bg-amber-50 text-amber-600",
    },
    action: {
      label: t("item_action"),
      icon: ListChecks,
      badge: "border-blue-200 bg-blue-50 text-blue-700",
      iconBox: "bg-blue-50 text-blue-600",
    },
  } as const;
  const params = await searchParams;
  const rawKind = singleValue(params.tipo);
  const rawPeriod = singleValue(params.periodo);
  const kind = validKind(rawKind) ? rawKind : undefined;
  const period = validPeriod(rawPeriod) ? rawPeriod : "all";
  const data = await getAgendaData({ kind, period });
  const tomorrow = addDays(data.today, 1);
  const groups = groupItems(data.items);
  const activeFilters: ActiveFilter[] = [
    ...(kind
      ? [
          {
            label: t("type"),
            value: t(`kind_${kind}`),
          },
        ]
      : []),
    ...(period !== "all"
      ? [
          {
            label: t("period"),
            value: t(`period_${period}`),
          },
        ]
      : []),
  ];
  const hasFilters = activeFilters.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Link href="/acoes/nova" className={buttonClassName()}>
            <Plus aria-hidden="true" className="size-4" />
            {t("newTask")}
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: t("period_overdue"),
            value: data.summary.overdue,
            href: "/agenda?periodo=overdue",
            icon: CircleAlert,
            tone: "text-red-600",
            background: "bg-red-50",
          },
          {
            label: t("dueToday"),
            value: data.summary.today,
            href: "/agenda?periodo=today",
            icon: CalendarClock,
            tone: "text-amber-600",
            background: "bg-amber-50",
          },
          {
            label: t("period_next_7"),
            value: data.summary.nextSevenDays,
            href: "/agenda?periodo=next_7",
            icon: CalendarRange,
            tone: "text-blue-600",
            background: "bg-blue-50",
          },
          {
            label: t("undatedTasks"),
            value: data.summary.unscheduledActions,
            href: "/acoes?estado=pending&prazo=no_date",
            icon: ListChecks,
            tone: "text-slate-600",
            background: "bg-slate-100",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Card className="h-full transition-colors hover:border-blue-200 hover:bg-blue-50/20">
                <CardContent className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-3xl font-bold ${item.tone}`}>
                      {item.value.toLocaleString(locale)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{item.label}</p>
                  </div>
                  <span
                    className={`flex size-11 items-center justify-center rounded-2xl ${item.background} ${item.tone}`}
                  >
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <form
          action="/agenda"
          method="get"
          className="grid gap-3 p-4 md:grid-cols-2"
        >
          <label>
            <span className="sr-only">{t("filterType")}</span>
            <AutoSubmitSelect
              name="tipo"
              defaultValue={kind ?? ""}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            >
              <option value="">{t("allTypes")}</option>
              {kindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`kind_${option.value}`)}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label>
            <span className="sr-only">{t("filterPeriod")}</span>
            <AutoSubmitSelect
              name="periodo"
              defaultValue={period}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`period_${option.value}`)}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
        </form>
      </Card>

      <ActiveFilters filters={activeFilters} clearHref="/agenda" />

      {groups.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title={hasFilters ? t("emptyFiltered") : t("empty")}
          description={
            hasFilters ? t("emptyFilteredDescription") : t("emptyDescription")
          }
          actionLabel={hasFilters ? t("clearFilters") : t("createTask")}
          actionHref={hasFilters ? "/agenda" : "/acoes/nova"}
        />
      ) : (
        <div className="space-y-5">
          {groups.map(([date, items]) => {
            const isOverdue = date < data.today;
            const heading =
              date === data.today
                ? t("todayDate", { date: formatAgendaDate(date, locale) })
                : date === tomorrow
                  ? t("tomorrowDate", { date: formatAgendaDate(date, locale) })
                  : formatAgendaDate(date, locale);

            return (
              <section key={date} aria-labelledby={`agenda-${date}`}>
                <div className="mb-2 flex items-center gap-3">
                  <h2
                    id={`agenda-${date}`}
                    className={`text-sm font-bold ${isOverdue ? "text-red-600" : "text-slate-700"}`}
                  >
                    {heading}
                  </h2>
                  {isOverdue ? (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                      {t("period_overdue")}
                    </span>
                  ) : null}
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <Card className={isOverdue ? "border-red-100" : undefined}>
                  <div className="divide-y divide-slate-100">
                    {items.map((item) => {
                      const presentation = itemPresentation[item.kind];
                      const Icon = presentation.icon;

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="group flex items-center gap-3 p-4 transition-colors hover:bg-slate-50 sm:gap-4"
                        >
                          <CompanyLogo
                            name={item.companyName}
                            logoUrl={item.companyLogoUrl}
                            size="md"
                          />
                          <span
                            className={`hidden size-10 shrink-0 items-center justify-center rounded-xl sm:flex ${presentation.iconBox}`}
                          >
                            <Icon aria-hidden="true" className="size-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="truncate font-semibold text-slate-900">
                                {item.description ||
                                  (item.kind === "follow_up"
                                    ? t("followUpDescription")
                                    : "")}
                              </span>
                              <span
                                className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${presentation.badge}`}
                              >
                                {presentation.label}
                              </span>
                              {item.priority ? (
                                <ActionPriorityBadge priority={item.priority} />
                              ) : null}
                            </span>
                            <span className="mt-1 block truncate text-sm text-slate-500">
                              {item.title} · {item.companyName}
                            </span>
                          </span>
                          {item.scheduledAt ? (
                            <span className="shrink-0 text-sm font-semibold text-violet-700">
                              {formatInterviewTime(item.scheduledAt, locale)}
                            </span>
                          ) : null}
                          <ChevronRight
                            aria-hidden="true"
                            className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5"
                          />
                        </Link>
                      );
                    })}
                  </div>
                </Card>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
