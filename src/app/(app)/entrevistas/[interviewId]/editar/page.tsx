import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { DeleteInterviewForm } from "@/components/interviews/delete-interview-form";
import { InterviewForm } from "@/components/interviews/interview-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { updateInterviewAction } from "@/features/interviews/actions";
import {
  getInterviewApplicationOptions,
  getInterviewById,
  getInterviewRecruiterOptions,
} from "@/features/interviews/data";

export default async function EditInterviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ interviewId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations("Interviews");
  const [{ interviewId }, query] = await Promise.all([params, searchParams]);
  const [interview, applications, recruiters] = await Promise.all([
    getInterviewById(interviewId),
    getInterviewApplicationOptions(),
    getInterviewRecruiterOptions(),
  ]);

  if (!interview) notFound();
  const returnToApplication = query.regressar === "candidatura";
  const returnHref = returnToApplication
    ? `/entrevistas/${interview.id}?regressar=candidatura`
    : `/entrevistas/${interview.id}`;
  const action = updateInterviewAction.bind(
    null,
    interview.id,
    returnToApplication,
  );

  return (
    <div className="space-y-6">
      <Link
        href={returnHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("backToSummary")}
      </Link>
      <PageHeader
        title={t("prepareTitle", { type: interview.interviewType })}
        description={t("editDescription")}
      />
      <InterviewForm
        action={action}
        applications={applications}
        recruiters={recruiters}
        initialValues={interview}
        submitLabel={t("saveChanges")}
        cancelHref={returnHref}
      />

      <Card className="border-red-200">
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">{t("deleteInterview")}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("deleteDescription")}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <DeleteInterviewForm
            interviewId={interview.id}
            interviewType={interview.interviewType}
            returnToApplication={returnToApplication}
          />
        </CardContent>
      </Card>
    </div>
  );
}
