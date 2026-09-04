import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteRecruiterForm } from "@/components/recruiters/delete-recruiter-form";
import { RecruiterForm } from "@/components/recruiters/recruiter-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { updateRecruiterAction } from "@/features/recruiters/actions";
import {
  getRecruiterById,
  getRecruiterCompanyOptions,
} from "@/features/recruiters/data";

export default async function EditRecruiterPage({
  params,
}: {
  params: Promise<{ recruiterId: string }>;
}) {
  const t = await getTranslations("Recruiters");
  const { recruiterId } = await params;
  const [recruiter, companies] = await Promise.all([
    getRecruiterById(recruiterId),
    getRecruiterCompanyOptions(),
  ]);

  if (!recruiter) notFound();
  const action = updateRecruiterAction.bind(null, recruiter.id);

  return (
    <div className="space-y-6">
      <Link
        href="/recrutadores"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("back")}
      </Link>
      <PageHeader
        title={t("editName", { name: recruiter.name })}
        description={t("editDescription")}
      />
      <RecruiterForm
        action={action}
        companies={companies}
        initialValues={recruiter}
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
          <DeleteRecruiterForm
            recruiterId={recruiter.id}
            recruiterName={recruiter.name}
          />
        </CardContent>
      </Card>
    </div>
  );
}
