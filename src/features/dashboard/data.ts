import "server-only";

import { applicationStatusOptions } from "@/features/applications/constants";
import type {
  DashboardApplication,
  DashboardData,
  DashboardFollowUp,
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
  const [applicationsResult, opportunitiesResult, companiesResult] =
    await Promise.all([
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
    ]);

  if (
    applicationsResult.error ||
    opportunitiesResult.error ||
    companiesResult.error
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
      overdueFollowUps: activeApplications.filter(
        (application) =>
          application.followUpDate && application.followUpDate < today,
      ).length,
      upcomingFollowUps: activeApplications.filter(
        (application) =>
          application.followUpDate >= today &&
          application.followUpDate <= sevenDaysFromNow,
      ).length,
      totalCompanies: companiesResult.data.length,
      companiesWithApplications: companyIdsWithApplications.size,
    },
    recentApplications,
    followUps,
    statusSummary,
  };
}
