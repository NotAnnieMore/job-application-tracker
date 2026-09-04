import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { ApplicationForm } from "@/components/applications/application-form";
import { PageHeader } from "@/components/shared/page-header";
import { createApplicationAction } from "@/features/applications/actions";
import {
  getCompanyOptions,
  getRecruiterOptions,
} from "@/features/applications/data";
import { createEmptyApplicationFormValues } from "@/features/applications/types";

export default async function NewApplicationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const t = await getTranslations("Applications.newPage");
  const startWithJobImport = query.importar === "vaga";
  const [companies, recruiters] = await Promise.all([
    getCompanyOptions(),
    getRecruiterOptions(),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/candidaturas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("back")}
      </Link>
      <PageHeader title={t("title")} description={t("description")} />
      <ApplicationForm
        action={createApplicationAction}
        companies={companies}
        recruiters={recruiters}
        initialValues={createEmptyApplicationFormValues()}
        submitLabel={t("save")}
        useBrowserDateDefault
        startWithJobImport={startWithJobImport}
      />
    </div>
  );
}
