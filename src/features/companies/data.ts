import "server-only";

import type {
  CompanyDetails,
  CompanyFormValues,
  CompanyListItem,
  CompanyWithoutLogo,
} from "@/features/companies/types";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isValidUuid } from "@/lib/validation";
import type { CompanyRow } from "@/types/database.types";

function toCompanyValues(company: CompanyRow): CompanyFormValues {
  return {
    name: company.name,
    website: company.website ?? "",
    logoUrl: company.logo_url ?? "",
    location: company.location ?? "",
    industry: company.industry ?? "",
    workMode: company.work_mode ?? "",
    notes: company.notes ?? "",
  };
}

export async function getCompanies(): Promise<CompanyListItem[]> {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const [
    companiesResult,
    opportunitiesResult,
    applicationsResult,
    recruitersResult,
  ] = await Promise.all([
    supabase
      .from("companies")
      .select(
        "id, user_id, name, website, logo_url, location, industry, work_mode, notes, created_at, updated_at",
      )
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
    supabase
      .from("opportunities")
      .select("id, company_id")
      .eq("user_id", user.id),
    supabase
      .from("applications")
      .select("opportunity_id")
      .eq("user_id", user.id),
    supabase
      .from("recruiters")
      .select("company_id")
      .eq("user_id", user.id)
      .not("company_id", "is", null),
  ]);

  if (
    companiesResult.error ||
    opportunitiesResult.error ||
    applicationsResult.error ||
    recruitersResult.error
  ) {
    throw new Error("Não foi possível consultar as empresas.");
  }

  const companyByOpportunity = new Map(
    opportunitiesResult.data.map((opportunity) => [
      opportunity.id,
      opportunity.company_id,
    ]),
  );
  const applicationCountByCompany = new Map<string, number>();
  const recruiterCountByCompany = new Map<string, number>();

  applicationsResult.data.forEach((application) => {
    const companyId = companyByOpportunity.get(application.opportunity_id);
    if (!companyId) return;

    applicationCountByCompany.set(
      companyId,
      (applicationCountByCompany.get(companyId) ?? 0) + 1,
    );
  });
  recruitersResult.data.forEach((recruiter) => {
    if (!recruiter.company_id) return;
    recruiterCountByCompany.set(
      recruiter.company_id,
      (recruiterCountByCompany.get(recruiter.company_id) ?? 0) + 1,
    );
  });

  return companiesResult.data.map((company) => ({
    id: company.id,
    ...toCompanyValues(company),
    applicationCount: applicationCountByCompany.get(company.id) ?? 0,
    recruiterCount: recruiterCountByCompany.get(company.id) ?? 0,
  }));
}

export async function getCompanyById(
  companyId: string,
): Promise<CompanyDetails | null> {
  if (!isValidUuid(companyId)) return null;

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select(
      "id, user_id, name, website, logo_url, location, industry, work_mode, notes, created_at, updated_at",
    )
    .eq("id", companyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível consultar a empresa.");
  }

  if (!data) return null;

  return {
    id: data.id,
    ...toCompanyValues(data),
  };
}

export async function getCompaniesWithoutLogo(): Promise<CompanyWithoutLogo[]> {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, website")
    .eq("user_id", user.id)
    .is("logo_url", null)
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Não foi possível consultar as empresas sem logótipo.");
  }

  return data.map((company) => ({
    id: company.id,
    name: company.name,
    website: company.website ?? "",
  }));
}
