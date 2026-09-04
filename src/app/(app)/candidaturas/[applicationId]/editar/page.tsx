import { canCreateInterview } from "@/features/interviews/eligibility";
import { ArrowLeft, CalendarPlus, ListPlus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ApplicationForm } from "@/components/applications/application-form";
import { DeleteApplicationForm } from "@/components/applications/delete-application-form";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { updateApplicationAction } from "@/features/applications/actions";
import {
  getApplicationById,
  getCompanyOptions,
  getRecruiterOptions,
} from "@/features/applications/data";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const t = await getTranslations("Applications.editPage");
  const [application, companies, recruiters] = await Promise.all([
    getApplicationById(applicationId),
    getCompanyOptions(),
    getRecruiterOptions(),
  ]);

  if (!application) notFound();

  const action = updateApplicationAction.bind(null, application.id);
  const detailHref = `/candidaturas/${application.id}`;

  return (
    <div className="space-y-6">
      <Link
        href={detailHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("back")}
      </Link>
      <PageHeader
        title={t("title", { title: application.title })}
        description={t("description")}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/acoes/nova?candidatura=${application.id}`}
              className={buttonClassName({ variant: "secondary" })}
            >
              <ListPlus aria-hidden="true" className="size-4" />
              {t("newTask")}
            </Link>
            {canCreateInterview(application.status) ? (
              <Link
                href={`/entrevistas/nova?candidatura=${application.id}`}
                className={buttonClassName({ variant: "secondary" })}
              >
                <CalendarPlus aria-hidden="true" className="size-4" />
                {t("scheduleInterview")}
              </Link>
            ) : null}
          </div>
        }
      />
      <ApplicationForm
        action={action}
        companies={companies}
        recruiters={recruiters}
        initialValues={application}
        submitLabel={t("save")}
        cancelHref={detailHref}
      />

      <Card className="border-red-200">
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">{t("deleteTitle")}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("deleteDescription")}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <DeleteApplicationForm
            applicationId={application.id}
            title={application.title}
          />
        </CardContent>
      </Card>
    </div>
  );
}
