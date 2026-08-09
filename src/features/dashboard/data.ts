import "server-only";

import {
  applicationStatusOptions,
  normalizeApplicationStatus,
} from "@/features/applications/constants";
import type {
  DashboardActivity,
  DashboardApplication,
  DashboardAction,
  DashboardData,
  DashboardInterview,
  DashboardTrendPoint,
} from "@/features/dashboard/types";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatusValue } from "@/types/database.types";

const inactiveStatuses = new Set<ApplicationStatusValue>([
  "rejected",
  "withdrawn",
]);
const interviewStatuses = new Set<ApplicationStatusValue>([
  "interview_scheduled",
  "awaiting_response",
]);
const responseStatuses = new Set<ApplicationStatusValue>([
  "interview_scheduled",
  "awaiting_response",
  "offer_received",
  "rejected",
]);

function lisbonDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function isoDate(year: number, month: number, day: number) {
  return [
    year,
    month.toString().padStart(2, "0"),
    day.toString().padStart(2, "0"),
  ].join("-");
}

function addDays(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return isoDate(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  );
}

function getApplicationTrend(
  applications: DashboardApplication[],
  currentYear: number,
  currentMonth: number,
): DashboardTrendPoint[] {
  const currentMonthIndex = currentYear * 12 + currentMonth - 1;
  const values = Array.from({ length: 6 }, (_, index) => {
    const monthIndex = currentMonthIndex - 5 + index;
    const year = Math.floor(monthIndex / 12);
    const month = (monthIndex % 12) + 1;
    const key = `${year}-${month.toString().padStart(2, "0")}`;

    return {
      key,
      label: new Intl.DateTimeFormat("pt-PT", {
        month: "short",
        timeZone: "UTC",
      })
        .format(new Date(Date.UTC(year, month - 1, 1)))
        .replace(".", "")
        .toLocaleUpperCase("pt-PT"),
      value: applications.filter((application) =>
        application.applicationDate.startsWith(key),
      ).length,
    };
  });
  const maximum = Math.max(...values.map((value) => value.value), 1);

  return values.map((value) => ({
    ...value,
    percentage: Math.round((value.value / maximum) * 100),
  }));
}

function activityLabel(
  createdAt: string,
  updatedAt: string,
  labels: {
    created: string;
    updated: string;
  },
) {
  return createdAt === updatedAt ? labels.created : labels.updated;
}

function toDashboardApplication(
  application: {
    id: string;
    opportunity_id: string;
    status: ApplicationStatusValue;
    application_date: string;
    next_action_summary: string | null;
    follow_up_date: string | null;
  },
  opportunity: {
    company_id: string;
    title: string;
    location: string | null;
    work_mode: DashboardApplication["workMode"];
  },
  company: { name: string; logo_url: string | null },
): DashboardApplication {
  return {
    id: application.id,
    title: opportunity.title,
    companyName: company.name,
    companyLogoUrl: company.logo_url ?? "",
    status: normalizeApplicationStatus(application.status),
    applicationDate: application.application_date,
    location: opportunity.location ?? "",
    workMode: opportunity.work_mode,
    nextActionSummary: application.next_action_summary ?? "",
    followUpDate: application.follow_up_date ?? "",
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const [
    applicationsResult,
    opportunitiesResult,
    companiesResult,
    interviewsResult,
    actionsResult,
    notesResult,
  ] = await Promise.all([
    supabase
      .from("applications")
      .select(
        "id, opportunity_id, status, application_date, next_action_summary, follow_up_date, created_at, updated_at",
      )
      .eq("user_id", user.id),
    supabase
      .from("opportunities")
      .select("id, company_id, title, location, work_mode")
      .eq("user_id", user.id),
    supabase
      .from("companies")
      .select("id, name, logo_url")
      .eq("user_id", user.id),
    supabase
      .from("interviews")
      .select(
        "id, application_id, interview_type, scheduled_at, status, format, created_at, updated_at",
      )
      .eq("user_id", user.id),
    supabase
      .from("actions")
      .select(
        "id, application_id, description, due_date, priority, status, created_at, updated_at",
      )
      .eq("user_id", user.id),
    supabase
      .from("notes")
      .select("id, application_id, content, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(10),
  ]);

  if (
    applicationsResult.error ||
    opportunitiesResult.error ||
    companiesResult.error ||
    interviewsResult.error ||
    actionsResult.error ||
    notesResult.error
  ) {
    throw new Error("Não foi possível consultar os dados do dashboard.");
  }

  const opportunities = new Map(
    opportunitiesResult.data.map((opportunity) => [
      opportunity.id,
      opportunity,
    ]),
  );
  const companies = new Map(
    companiesResult.data.map((company) => [company.id, company]),
  );
  const applicationRecords = new Map(
    applicationsResult.data.map((application) => [application.id, application]),
  );
  const applicationCreatedAt = new Map(
    applicationsResult.data.map((application) => [
      application.id,
      application.created_at,
    ]),
  );
  const applications = applicationsResult.data.flatMap((application) => {
    const opportunity = opportunities.get(application.opportunity_id);
    const company = opportunity ? companies.get(opportunity.company_id) : null;
    if (!opportunity || !company) return [];

    return [toDashboardApplication(application, opportunity, company)];
  });
  const todayParts = lisbonDateParts(new Date());
  const today = isoDate(todayParts.year, todayParts.month, todayParts.day);
  const thirtyDaysAgo = addDays(today, -29);
  const sevenDaysFromNow = addDays(today, 7);
  const activeApplications = applications.filter(
    (application) => !inactiveStatuses.has(application.status),
  );
  const companyIdsWithApplications = new Set(
    applicationsResult.data.flatMap((application) => {
      const opportunity = opportunities.get(application.opportunity_id);
      return opportunity ? [opportunity.company_id] : [];
    }),
  );

  const recentApplications = [...applications]
    .sort((left, right) => {
      const byDate = right.applicationDate.localeCompare(left.applicationDate);
      if (byDate !== 0) return byDate;
      return (applicationCreatedAt.get(right.id) ?? "").localeCompare(
        applicationCreatedAt.get(left.id) ?? "",
      );
    })
    .slice(0, 5);

  const pendingActions: DashboardAction[] = actionsResult.data
    .filter((action) => action.status === "pending")
    .flatMap((action) => {
      const application = applicationsResult.data.find(
        (item) => item.id === action.application_id,
      );
      const opportunity = application
        ? opportunities.get(application.opportunity_id)
        : null;
      const company = opportunity
        ? companies.get(opportunity.company_id)
        : null;
      if (!application || !opportunity || !company) return [];

      return [
        {
          id: action.id,
          description: action.description,
          dueDate: action.due_date ?? "",
          priority: action.priority,
          timing: !action.due_date
            ? ("no_date" as const)
            : action.due_date < today
              ? ("overdue" as const)
              : action.due_date === today
                ? ("today" as const)
                : ("upcoming" as const),
          title: opportunity.title,
          companyName: company.name,
          companyLogoUrl: company.logo_url ?? "",
        },
      ];
    })
    .sort((left, right) => {
      if (left.dueDate && right.dueDate) {
        const dateOrder = left.dueDate.localeCompare(right.dueDate);
        if (dateOrder !== 0) return dateOrder;
      } else if (left.dueDate !== right.dueDate) {
        return left.dueDate ? -1 : 1;
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
      return priorityOrder[left.priority] - priorityOrder[right.priority];
    })
    .slice(0, 6);

  const statusSummary = applicationStatusOptions.flatMap((option) => {
    const value = applications.filter(
      (application) => application.status === option.value,
    ).length;
    if (value === 0) return [];

    return [
      {
        status: option.value,
        label: option.label,
        value,
        percentage:
          applications.length === 0
            ? 0
            : Math.round((value / applications.length) * 100),
      },
    ];
  });

  const now = Date.now();
  const allUpcomingInterviews: DashboardInterview[] = interviewsResult.data
    .filter(
      (interview) =>
        interview.status === "scheduled" &&
        Date.parse(interview.scheduled_at) >= now,
    )
    .flatMap((interview) => {
      const application = applicationsResult.data.find(
        (item) => item.id === interview.application_id,
      );
      const opportunity = application
        ? opportunities.get(application.opportunity_id)
        : null;
      const company = opportunity
        ? companies.get(opportunity.company_id)
        : null;
      if (!application || !opportunity || !company) return [];

      return [
        {
          id: interview.id,
          title: opportunity.title,
          companyName: company.name,
          companyLogoUrl: company.logo_url ?? "",
          interviewType: interview.interview_type,
          scheduledAt: interview.scheduled_at,
          format: interview.format,
        },
      ];
    })
    .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt));
  const upcomingInterviews = allUpcomingInterviews.slice(0, 4);

  function getActivityContext(applicationId: string) {
    const application = applicationRecords.get(applicationId);
    const opportunity = application
      ? opportunities.get(application.opportunity_id)
      : null;
    const company = opportunity ? companies.get(opportunity.company_id) : null;

    return application && opportunity && company
      ? { application, opportunity, company }
      : null;
  }

  const applicationActivity: DashboardActivity[] =
    applicationsResult.data.flatMap((application) => {
      const context = getActivityContext(application.id);
      if (!context) return [];

      return [
        {
          id: `application-${application.id}`,
          kind: "application",
          label: activityLabel(application.created_at, application.updated_at, {
            created: "Candidatura criada",
            updated: "Candidatura atualizada",
          }),
          description: `${context.opportunity.title} · ${context.company.name}`,
          occurredAt: application.updated_at,
          href: "/candidaturas",
        },
      ];
    });

  const noteActivity: DashboardActivity[] = notesResult.data.flatMap((note) => {
    const context = getActivityContext(note.application_id);
    if (!context) return [];
    const excerpt = note.content.replace(/\s+/gu, " ").trim().slice(0, 72);

    return [
      {
        id: `note-${note.id}`,
        kind: "note",
        label: activityLabel(note.created_at, note.updated_at, {
          created: "Nota adicionada",
          updated: "Nota atualizada",
        }),
        description: `${excerpt}${note.content.length > 72 ? "…" : ""} · ${context.company.name}`,
        occurredAt: note.updated_at,
        href: `/candidaturas/${note.application_id}#notas`,
      },
    ];
  });

  const interviewActivity: DashboardActivity[] = interviewsResult.data.flatMap(
    (interview) => {
      const context = getActivityContext(interview.application_id);
      if (!context) return [];

      return [
        {
          id: `interview-${interview.id}`,
          kind: "interview",
          label: activityLabel(interview.created_at, interview.updated_at, {
            created: "Entrevista registada",
            updated: "Entrevista atualizada",
          }),
          description: `${interview.interview_type} · ${context.company.name}`,
          occurredAt: interview.updated_at,
          href: "/entrevistas",
        },
      ];
    },
  );

  const actionActivity: DashboardActivity[] = actionsResult.data.flatMap(
    (action) => {
      const context = getActivityContext(action.application_id);
      if (!context) return [];

      return [
        {
          id: `action-${action.id}`,
          kind: "action",
          label: activityLabel(action.created_at, action.updated_at, {
            created: "Tarefa criada",
            updated: "Tarefa atualizada",
          }),
          description: `${action.description} · ${context.company.name}`,
          occurredAt: action.updated_at,
          href: "/acoes",
        },
      ];
    },
  );

  const recentActivity = [
    ...applicationActivity,
    ...noteActivity,
    ...interviewActivity,
    ...actionActivity,
  ]
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
    .slice(0, 8);
  const applicationTrend = getApplicationTrend(
    applications,
    todayParts.year,
    todayParts.month,
  );
  const sentApplications = applications.filter(
    (application) => application.status !== "interested",
  );
  const respondedApplications = sentApplications.filter((application) =>
    responseStatuses.has(application.status),
  );

  return {
    stats: {
      totalApplications: applications.length,
      applicationsLast30Days: applications.filter(
        (application) =>
          application.applicationDate >= thirtyDaysAgo &&
          application.applicationDate <= today,
      ).length,
      activeApplications: activeApplications.length,
      interviewApplications: activeApplications.filter((application) =>
        interviewStatuses.has(application.status),
      ).length,
      overdueActions: actionsResult.data.filter(
        (action) =>
          action.status === "pending" &&
          action.due_date &&
          action.due_date < today,
      ).length,
      upcomingActions: actionsResult.data.filter(
        (action) =>
          action.status === "pending" &&
          action.due_date &&
          action.due_date >= today &&
          action.due_date <= sevenDaysFromNow,
      ).length,
      upcomingInterviews: allUpcomingInterviews.length,
      offersReceived: applications.filter(
        (application) => application.status === "offer_received",
      ).length,
      rejections: applications.filter(
        (application) => application.status === "rejected",
      ).length,
      responseRate:
        sentApplications.length === 0
          ? 0
          : Math.round(
              (respondedApplications.length / sentApplications.length) * 100,
            ),
      respondedApplications: respondedApplications.length,
      sentApplications: sentApplications.length,
      totalCompanies: companiesResult.data.length,
      companiesWithApplications: companyIdsWithApplications.size,
    },
    recentApplications,
    pendingActions,
    upcomingInterviews,
    statusSummary,
    applicationTrend,
    recentActivity,
  };
}
