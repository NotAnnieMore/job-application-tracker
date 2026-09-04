import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { CompanyForm } from "@/components/companies/company-form";
import { PageHeader } from "@/components/shared/page-header";
import { createCompanyAction } from "@/features/companies/actions";
import { emptyCompanyFormValues } from "@/features/companies/types";

export default async function NewCompanyPage() {
  const t = await getTranslations("Companies");
  return (
    <div className="space-y-6">
      <Link
        href="/empresas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("back")}
      </Link>
      <PageHeader title={t("new")} description={t("newDescription")} />
      <CompanyForm
        action={createCompanyAction}
        initialValues={emptyCompanyFormValues}
        submitLabel={t("save")}
      />
    </div>
  );
}
