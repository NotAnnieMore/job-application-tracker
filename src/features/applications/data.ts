import "server-only";

import type {
  ApplicationDetails,
  ApplicationListFilters,
  ApplicationListItem,
  CompanyOption,
  RecruiterOption,
} from "@/features/applications/types";
import { isValidApplicationId } from "@/features/applications/validation";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-PT");
}

export async function getCompanyOptions(): Promise<CompanyOption[]> {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) throw new Error("Não foi possível consultar as empresas.");
  return data;
}

export async function getRecruiterOptions(): Promise<RecruiterOption[]> {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recruiters")
    .select("id, name, company_id")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) throw new Error("Não foi possível consultar os recrutadores.");
  return data.map((recruiter) => ({
    id: recruiter.id,
    name: recruiter.name,
    companyId: recruiter.company_id ?? "",
  }));
}

export async function getApplications(
  filters: ApplicationListFilters = {},
): Promise<ApplicationListItem[]> {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const [
    applicationsResult,
    opportunitiesResult,
    companiesResult,
    recruitersResult,
  ] = await Promise.all([
    supabase
      .from("applications")
      .select(
        "id, opportunity_id, primary_recruiter_id, status, application_date, next_action_summary, follow_up_date",
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
    supabase.from("recruiters").select("id, name").eq("user_id", user.id),
  ]);

  if (
    applicationsResult.error ||
    opportunitiesResult.error ||
    companiesResult.error ||
    recruitersResult.error
  ) {
    throw new Error("Não foi possível consultar as candidaturas.");
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
  const recruiters = new Map(
    recruitersResult.data.map((recruiter) => [recruiter.id, recruiter]),
  );

  let items = applicationsResult.data.flatMap((application) => {
    const opportunity = opportunities.get(application.opportunity_id);
    const company = opportunity ? companies.get(opportunity.company_id) : null;
    if (!opportunity || !company) return [];

    const recruiter = application.primary_recruiter_id
      ? recruiters.get(application.primary_recruiter_id)
      : null;

    return [
      {
        id: application.id,
        title: opportunity.title,
        companyId: company.id,
        companyName: company.name,
        companyLogoUrl: company.logo_url ?? "",
        status: application.status,
        applicationDate: application.application_date,
        location: opportunity.location ?? "",
        workMode: opportunity.work_mode,
        nextActionSummary: application.next_action_summary ?? "",
        followUpDate: application.follow_up_date ?? "",
        recruiterId: application.primary_recruiter_id ?? "",
        recruiterName: recruiter?.name ?? "",
      },
    ];
  });

  if (filters.query) {
    const query = normalizeSearch(filters.query);
    items = items.filter((item) =>
      normalizeSearch(
        `${item.title} ${item.companyName} ${item.recruiterName}`,
      ).includes(query),
    );
  }

  if (filters.status) {
    items = items.filter((item) => item.status === filters.status);
  }
  if (filters.companyId) {
    items = items.filter((item) => item.companyId === filters.companyId);
  }
  if (filters.recruiterId) {
    items = items.filter((item) => item.recruiterId === filters.recruiterId);
  }
  if (filters.workMode) {
    items = items.filter((item) => item.workMode === filters.workMode);
  }
  if (filters.dateFrom) {
    const dateFrom = filters.dateFrom;
    items = items.filter((item) => item.applicationDate >= dateFrom);
  }
  if (filters.dateTo) {
    const dateTo = filters.dateTo;
    items = items.filter((item) => item.applicationDate <= dateTo);
  }

  items.sort((left, right) => {
    if (filters.sort === "oldest") {
      return left.applicationDate.localeCompare(right.applicationDate);
    }
    if (filters.sort === "follow_up") {
      if (!left.followUpDate) return 1;
      if (!right.followUpDate) return -1;
      return left.followUpDate.localeCompare(right.followUpDate);
    }
    return right.applicationDate.localeCompare(left.applicationDate);
  });

  return items;
}

export async function getApplicationById(
  applicationId: string,
): Promise<ApplicationDetails | null> {
  if (!isValidApplicationId(applicationId)) return null;

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select(
      "id, opportunity_id, primary_recruiter_id, status, application_date, source, expected_salary, summary_notes, next_action_summary, follow_up_date, interview_preparation, questions_for_company",
    )
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (applicationError) {
    throw new Error("Não foi possível consultar a candidatura.");
  }
  if (!application) return null;

  const { data: opportunity, error: opportunityError } = await supabase
    .from("opportunities")
    .select(
      "id, company_id, title, location, work_mode, employment_type, salary_min, salary_max, currency, job_url, skills, summary",
    )
    .eq("id", application.opportunity_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (opportunityError || !opportunity) {
    throw new Error("Não foi possível consultar a vaga da candidatura.");
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, logo_url, website")
    .eq("id", opportunity.company_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (companyError || !company) {
    throw new Error("Não foi possível consultar a empresa da candidatura.");
  }

  let recruiter: {
    name: string;
    email: string | null;
    phone: string | null;
    linkedin_url: string | null;
  } | null = null;

  if (application.primary_recruiter_id) {
    const { data, error } = await supabase
      .from("recruiters")
      .select("name, email, phone, linkedin_url")
      .eq("id", application.primary_recruiter_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      throw new Error("Não foi possível consultar o contacto da candidatura.");
    }
    recruiter = data;
  }

  return {
    id: application.id,
    companyId: opportunity.company_id,
    companyName: company.name,
    companyLogoUrl: company.logo_url ?? "",
    companyWebsite: company.website ?? "",
    primaryRecruiterId: application.primary_recruiter_id ?? "",
    recruiterName: recruiter?.name ?? "",
    recruiterEmail: recruiter?.email ?? "",
    recruiterPhone: recruiter?.phone ?? "",
    recruiterLinkedinUrl: recruiter?.linkedin_url ?? "",
    title: opportunity.title,
    location: opportunity.location ?? "",
    workMode: opportunity.work_mode ?? "",
    employmentType: opportunity.employment_type ?? "",
    salaryMin: opportunity.salary_min?.toString() ?? "",
    salaryMax: opportunity.salary_max?.toString() ?? "",
    currency: opportunity.currency,
    jobUrl: opportunity.job_url ?? "",
    skills: opportunity.skills.join(", "),
    opportunitySummary: opportunity.summary ?? "",
    status: application.status,
    applicationDate: application.application_date,
    source: application.source ?? "",
    expectedSalary: application.expected_salary?.toString() ?? "",
    summaryNotes: application.summary_notes ?? "",
    nextActionSummary: application.next_action_summary ?? "",
    followUpDate: application.follow_up_date ?? "",
    interviewPreparation: application.interview_preparation ?? "",
    questionsForCompany: application.questions_for_company ?? "",
  };
}
