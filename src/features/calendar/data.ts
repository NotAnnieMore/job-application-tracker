import "server-only";

import type {
  AgendaData,
  AgendaFilters,
  AgendaItem,
} from "@/features/calendar/types";
import { getLisbonToday } from "@/features/actions/date";
import { toLisbonLocalInput } from "@/features/interviews/date";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatusValue } from "@/types/database.types";

const inactiveApplicationStatuses = new Set<ApplicationStatusValue>([
  "rejected",
  "withdrawn",
]);

function addDays(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));

  return date.toISOString().slice(0, 10);
}

function timingForDate(date: string, today: string) {
  if (date < today) return "overdue" as const;
  if (date === today) return "today" as const;
  return "upcoming" as const;
}

function matchesPeriod(
  item: AgendaItem,
  period: AgendaFilters["period"],
  today: string,
) {
  if (!period || period === "all") return true;
  if (period === "overdue") return item.date < today;
  if (period === "today") return item.date === today;

  const endDate = addDays(today, period === "next_7" ? 7 : 30);
  return item.date >= today && item.date <= endDate;
}

export async function getAgendaData(
  filters: AgendaFilters = {},
): Promise<AgendaData> {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const [
    applicationsResult,
    opportunitiesResult,
    companiesResult,
    interviewsResult,
    actionsResult,
  ] = await Promise.all([
    supabase
      .from("applications")
      .select("id, opportunity_id, status, follow_up_date, next_action_summary")
      .eq("user_id", user.id),
    supabase
      .from("opportunities")
      .select("id, company_id, title")
      .eq("user_id", user.id),
    supabase
      .from("companies")
      .select("id, name, logo_url")
      .eq("user_id", user.id),
    supabase
      .from("interviews")
      .select("id, application_id, interview_type, scheduled_at")
      .eq("user_id", user.id)
      .eq("status", "scheduled"),
    supabase
      .from("actions")
      .select("id, application_id, description, due_date, priority")
      .eq("user_id", user.id)
      .eq("status", "pending"),
  ]);

  if (
    applicationsResult.error ||
    opportunitiesResult.error ||
    companiesResult.error ||
    interviewsResult.error ||
    actionsResult.error
  ) {
    throw new Error("Não foi possível consultar os dados da agenda.");
  }

  const applications = new Map(
    applicationsResult.data.map((application) => [application.id, application]),
  );
  const opportunities = new Map(
    opportunitiesResult.data.map((opportunity) => [
      opportunity.id,
      opportunity,
    ]),
  );
  const companies = new Map(
    companiesResult.data.map((company) => [company.id, company]),
  );
  const today = getLisbonToday();

  function contextForApplication(applicationId: string) {
    const application = applications.get(applicationId);
    const opportunity = application
      ? opportunities.get(application.opportunity_id)
      : null;
    const company = opportunity ? companies.get(opportunity.company_id) : null;

    return application && opportunity && company
      ? { application, opportunity, company }
      : null;
  }

  const followUps: AgendaItem[] = applicationsResult.data.flatMap(
    (application) => {
      if (
        !application.follow_up_date ||
        inactiveApplicationStatuses.has(application.status)
      ) {
        return [];
      }

      const context = contextForApplication(application.id);
      if (!context) return [];

      return [
        {
          id: `follow-up-${application.id}`,
          kind: "follow_up",
          applicationId: application.id,
          title: context.opportunity.title,
          companyName: context.company.name,
          companyLogoUrl: context.company.logo_url ?? "",
          description:
            application.next_action_summary || "Fazer follow-up da candidatura",
          date: application.follow_up_date,
          scheduledAt: "",
          timing: timingForDate(application.follow_up_date, today),
          href: `/candidaturas/${application.id}`,
        },
      ];
    },
  );

  const interviews: AgendaItem[] = interviewsResult.data.flatMap(
    (interview) => {
      const context = contextForApplication(interview.application_id);
      if (!context) return [];
      const date = toLisbonLocalInput(interview.scheduled_at).slice(0, 10);

      return [
        {
          id: `interview-${interview.id}`,
          kind: "interview",
          applicationId: interview.application_id,
          title: context.opportunity.title,
          companyName: context.company.name,
          companyLogoUrl: context.company.logo_url ?? "",
          description: interview.interview_type,
          date,
          scheduledAt: interview.scheduled_at,
          timing: timingForDate(date, today),
          href: `/entrevistas?candidatura=${interview.application_id}`,
        },
      ];
    },
  );

  const actions: AgendaItem[] = actionsResult.data.flatMap((action) => {
    if (!action.due_date) return [];
    const context = contextForApplication(action.application_id);
    if (!context) return [];

    return [
      {
        id: `action-${action.id}`,
        kind: "action",
        applicationId: action.application_id,
        title: context.opportunity.title,
        companyName: context.company.name,
        companyLogoUrl: context.company.logo_url ?? "",
        description: action.description,
        date: action.due_date,
        scheduledAt: "",
        priority: action.priority,
        timing: timingForDate(action.due_date, today),
        href: `/acoes?candidatura=${action.application_id}`,
      },
    ];
  });

  const allItems = [...followUps, ...interviews, ...actions];
  const nextSevenDays = addDays(today, 7);
  const kindOrder = { interview: 0, follow_up: 1, action: 2 } as const;
  const items = allItems
    .filter((item) => !filters.kind || item.kind === filters.kind)
    .filter((item) => matchesPeriod(item, filters.period, today))
    .sort((left, right) => {
      const dateOrder = left.date.localeCompare(right.date);
      if (dateOrder !== 0) return dateOrder;
      if (left.scheduledAt || right.scheduledAt) {
        const timeOrder = (
          left.scheduledAt || `${left.date}T23:59:59Z`
        ).localeCompare(right.scheduledAt || `${right.date}T23:59:59Z`);
        if (timeOrder !== 0) return timeOrder;
      }
      return kindOrder[left.kind] - kindOrder[right.kind];
    });

  return {
    today,
    items,
    summary: {
      overdue: allItems.filter((item) => item.timing === "overdue").length,
      today: allItems.filter((item) => item.timing === "today").length,
      nextSevenDays: allItems.filter(
        (item) => item.date > today && item.date <= nextSevenDays,
      ).length,
      unscheduledActions: actionsResult.data.filter(
        (action) => !action.due_date,
      ).length,
    },
  };
}
