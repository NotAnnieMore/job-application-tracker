import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CompanyForm } from "@/components/companies/company-form";
import { DeleteCompanyForm } from "@/components/companies/delete-company-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { updateCompanyAction } from "@/features/companies/actions";
import { getCompanyById } from "@/features/companies/data";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const t = await getTranslations("Companies");
  const { companyId } = await params;
  const company = await getCompanyById(companyId);

  if (!company) notFound();

  const action = updateCompanyAction.bind(null, company.id);

  return (
    <div className="space-y-6">
      <Link
        href="/empresas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("back")}
      </Link>
      <PageHeader
        title={t("editName", { name: company.name })}
        description={t("editDescription")}
      />
      <CompanyForm
        action={action}
        initialValues={company}
        submitLabel={t("saveChanges")}
      />

      <Card className="border-red-200">
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">{t("delete")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("deleteHint")}</p>
          </div>
        </CardHeader>
        <CardContent>
          <DeleteCompanyForm
            companyId={company.id}
            companyName={company.name}
          />
        </CardContent>
      </Card>
    </div>
  );
}
