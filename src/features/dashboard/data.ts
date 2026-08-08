import "server-only";

import { applicationStatusOptions } from "@/features/applications/constants";
import type {
  DashboardApplication,
  DashboardAction,
  DashboardData,
  DashboardFollowUp,
  DashboardInterview,
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
  "interview_completed",
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
    status: application.status,
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
  ] = await Promise.all([
    supabase
      .from("applications")
      .select(
        "id, opportunity_id, status, application_date, next_action_summary, follow_up_date, created_at",
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
        "id, application_id, interview_type, scheduled_at, status, format",
      )
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

  const followUps: DashboardFollowUp[] = activeApplications
    .filter((application) => application.followUpDate)
    .sort((left, right) => left.followUpDate.localeCompare(right.followUpDate))
    .slice(0, 6)
    .map((application) => ({
      id: application.id,
      title: application.title,
      companyName: application.companyName,
      companyLogoUrl: application.companyLogoUrl,
      followUpDate: application.followUpDate,
      nextActionSummary: application.nextActionSummary,
      timing:
        application.followUpDate < today
          ? "overdue"
          : application.followUpDate === today
            ? "today"
            : "upcoming",
    }));

  const pendingActions: DashboardAction[] = actionsResult.data
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
  const upcomingInterviews: DashboardInterview[] = interviewsResult.data
    .filter((interview) => Date.parse(interview.scheduled_at) >= now)
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
    .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt))
    .slice(0, 4);

  return {
    today,
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
        (action) => action.due_date && action.due_date < today,
      ).length,
      upcomingActions: actionsResult.data.filter(
        (action) =>
          action.due_date &&
          action.due_date >= today &&
          action.due_date <= sevenDaysFromNow,
      ).length,
      totalCompanies: companiesResult.data.length,
      companiesWithApplications: companyIdsWithApplications.size,
    },
    recentApplications,
    followUps,
    pendingActions,
    upcomingInterviews,
    statusSummary,
  };
}
