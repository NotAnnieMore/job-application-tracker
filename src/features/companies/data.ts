import "server-only";

import type {
  CompanyDetails,
  CompanyFormValues,
  CompanyListItem,
} from "@/features/companies/types";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { CompanyRow } from "@/types/database.types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toCompanyValues(company: CompanyRow): CompanyFormValues {
  return {
    name: company.name,
    website: company.website ?? "",
    location: company.location ?? "",
    industry: company.industry ?? "",
    workMode: company.work_mode ?? "",
    notes: company.notes ?? "",
  };
}

export async function getCompanies(): Promise<CompanyListItem[]> {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const [companiesResult, opportunitiesResult, applicationsResult] =
    await Promise.all([
      supabase
        .from("companies")
        .select(
          "id, user_id, name, website, location, industry, work_mode, notes, created_at, updated_at",
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
    ]);

  if (
    companiesResult.error ||
    opportunitiesResult.error ||
    applicationsResult.error
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

  applicationsResult.data.forEach((application) => {
    const companyId = companyByOpportunity.get(application.opportunity_id);
    if (!companyId) return;

    applicationCountByCompany.set(
      companyId,
      (applicationCountByCompany.get(companyId) ?? 0) + 1,
    );
  });

  return companiesResult.data.map((company) => ({
    id: company.id,
    ...toCompanyValues(company),
    applicationCount: applicationCountByCompany.get(company.id) ?? 0,
  }));
}

export async function getCompanyById(
  companyId: string,
): Promise<CompanyDetails | null> {
  if (!uuidPattern.test(companyId)) return null;

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select(
      "id, user_id, name, website, location, industry, work_mode, notes, created_at, updated_at",
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
