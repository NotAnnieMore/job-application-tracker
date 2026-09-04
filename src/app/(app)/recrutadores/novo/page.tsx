import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { RecruiterForm } from "@/components/recruiters/recruiter-form";
import { PageHeader } from "@/components/shared/page-header";
import { createRecruiterAction } from "@/features/recruiters/actions";
import { getRecruiterCompanyOptions } from "@/features/recruiters/data";
import { emptyRecruiterFormValues } from "@/features/recruiters/types";

export default async function NewRecruiterPage({
  searchParams,
}: {
  searchParams: Promise<{ empresa?: string | string[] }>;
}) {
  const t = await getTranslations("Recruiters");
  const companies = await getRecruiterCompanyOptions();
  const companyParam = (await searchParams).empresa;
  const companyId =
    typeof companyParam === "string" &&
    companies.some((company) => company.id === companyParam)
      ? companyParam
      : "";

  return (
    <div className="space-y-6">
      <Link
        href="/recrutadores"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("back")}
      </Link>
      <PageHeader title={t("new")} description={t("newDescription")} />
      <RecruiterForm
        action={createRecruiterAction}
        companies={companies}
        initialValues={{ ...emptyRecruiterFormValues, companyId }}
        submitLabel={t("save")}
      />
    </div>
  );
}
