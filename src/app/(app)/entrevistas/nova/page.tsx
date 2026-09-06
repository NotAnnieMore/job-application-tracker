import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { InterviewForm } from "@/components/interviews/interview-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { createInterviewAction } from "@/features/interviews/actions";
import {
  getInterviewApplicationOptions,
  getInterviewRecruiterOptions,
} from "@/features/interviews/data";
import { emptyInterviewFormValues } from "@/features/interviews/types";

export default async function NewInterviewPage({
  searchParams,
}: {
  searchParams: Promise<{ candidatura?: string | string[] }>;
}) {
  const t = await getTranslations("Interviews");
  const tForm = await getTranslations("InterviewForm");
  const [applications, recruiters] = await Promise.all([
    getInterviewApplicationOptions({ forCreation: true }),
    getInterviewRecruiterOptions(),
  ]);
  const applicationParam = (await searchParams).candidatura;
  const applicationId =
    typeof applicationParam === "string" &&
    applications.some((application) => application.id === applicationParam)
      ? applicationParam
      : "";
  const selectedApplication = applications.find(
    (application) => application.id === applicationId,
  );

  return (
    <div className="space-y-6">
      <Link
        href="/entrevistas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("back")}
      </Link>
      {applications.length === 0 ? (
        <div className="space-y-6" data-tour="interview-form">
          <PageHeader title={t("new")} description={t("newDescription")} />
          <EmptyState
            icon={BriefcaseBusiness}
            title={t("noEligibleApplications")}
            description={t("creationEligibility")}
            actionLabel={t("viewApplications")}
            actionHref="/candidaturas"
          />
        </div>
      ) : (
        <InterviewForm
          action={createInterviewAction}
          applications={applications}
          recruiters={recruiters}
          initialValues={{
            ...emptyInterviewFormValues,
            interviewType: tForm("types.initial"),
            applicationId,
            recruiterId: selectedApplication?.primaryRecruiterId ?? "",
          }}
          submitLabel={t("saveInterview")}
          headerTitle={t("new")}
          headerDescription={t("newDescription")}
        />
      )}
    </div>
  );
}
