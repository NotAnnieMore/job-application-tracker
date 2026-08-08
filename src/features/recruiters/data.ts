import "server-only";

import type {
  RecruiterCompanyOption,
  RecruiterDetails,
  RecruiterFormValues,
  RecruiterListFilters,
  RecruiterListItem,
} from "@/features/recruiters/types";
import { isValidRecruiterId } from "@/features/recruiters/validation";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { RecruiterRow } from "@/types/database.types";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-PT");
}

function toRecruiterValues(recruiter: RecruiterRow): RecruiterFormValues {
  return {
    companyId: recruiter.company_id ?? "",
    name: recruiter.name,
    email: recruiter.email ?? "",
    phone: recruiter.phone ?? "",
    jobTitle: recruiter.job_title ?? "",
    linkedinUrl: recruiter.linkedin_url ?? "",
    notes: recruiter.notes ?? "",
  };
}

export async function getRecruiterCompanyOptions(): Promise<
  RecruiterCompanyOption[]
> {
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

export async function getRecruiters(
  filters: RecruiterListFilters = {},
): Promise<RecruiterListItem[]> {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const [recruitersResult, companiesResult, applicationsResult] =
    await Promise.all([
      supabase
        .from("recruiters")
        .select(
          "id, user_id, company_id, name, email, phone, job_title, linkedin_url, notes, created_at, updated_at",
        )
        .eq("user_id", user.id)
        .order("name", { ascending: true }),
      supabase
        .from("companies")
        .select("id, name, logo_url")
        .eq("user_id", user.id),
      supabase
        .from("applications")
        .select("primary_recruiter_id")
        .eq("user_id", user.id)
        .not("primary_recruiter_id", "is", null),
    ]);

  if (
    recruitersResult.error ||
    companiesResult.error ||
    applicationsResult.error
  ) {
    throw new Error("Não foi possível consultar os recrutadores.");
  }

  const companies = new Map(
    companiesResult.data.map((company) => [company.id, company]),
  );
  const applicationCountByRecruiter = new Map<string, number>();
  applicationsResult.data.forEach((application) => {
    if (!application.primary_recruiter_id) return;
    applicationCountByRecruiter.set(
      application.primary_recruiter_id,
      (applicationCountByRecruiter.get(application.primary_recruiter_id) ?? 0) +
        1,
    );
  });

  let recruiters = recruitersResult.data.map((recruiter) => {
    const company = recruiter.company_id
      ? companies.get(recruiter.company_id)
      : null;

    return {
      id: recruiter.id,
      ...toRecruiterValues(recruiter),
      companyName: company?.name ?? "",
      companyLogoUrl: company?.logo_url ?? "",
      applicationCount: applicationCountByRecruiter.get(recruiter.id) ?? 0,
    };
  });

  if (filters.query) {
    const query = normalizeSearch(filters.query);
    recruiters = recruiters.filter((recruiter) =>
      normalizeSearch(
        `${recruiter.name} ${recruiter.jobTitle} ${recruiter.email} ${recruiter.companyName}`,
      ).includes(query),
    );
  }
  if (filters.companyId) {
    recruiters = recruiters.filter(
      (recruiter) => recruiter.companyId === filters.companyId,
    );
  }

  return recruiters;
}

export async function getRecruiterById(
  recruiterId: string,
): Promise<RecruiterDetails | null> {
  if (!isValidRecruiterId(recruiterId)) return null;

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recruiters")
    .select(
      "id, user_id, company_id, name, email, phone, job_title, linkedin_url, notes, created_at, updated_at",
    )
    .eq("id", recruiterId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error("Não foi possível consultar o recrutador.");
  if (!data) return null;

  return { id: data.id, ...toRecruiterValues(data) };
}
