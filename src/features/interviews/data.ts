import "server-only";

import {
  lisbonOffsetForInstant,
  toLisbonLocalInput,
} from "@/features/interviews/date";
import type {
  InterviewApplicationOption,
  InterviewDetails,
  InterviewListFilters,
  InterviewListItem,
  InterviewRecruiterOption,
} from "@/features/interviews/types";
import { isValidInterviewId } from "@/features/interviews/validation";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function getInterviewApplicationOptions(): Promise<
  InterviewApplicationOption[]
> {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const [applicationsResult, opportunitiesResult, companiesResult] =
    await Promise.all([
      supabase
        .from("applications")
        .select(
          "id, opportunity_id, primary_recruiter_id, interview_preparation, questions_for_company",
        )
        .eq("user_id", user.id),
      supabase
        .from("opportunities")
        .select("id, company_id, title")
        .eq("user_id", user.id),
      supabase
        .from("companies")
        .select("id, name, logo_url")
        .eq("user_id", user.id),
    ]);

  if (
    applicationsResult.error ||
    opportunitiesResult.error ||
    companiesResult.error
  ) {
    throw new Error("Não foi possível consultar as candidaturas.");
  }

  const opportunities = new Map(
    opportunitiesResult.data.map((opportunity) => [
      opportunity.id,
      opportunity,
    ]),
  );
  const companies = new Map(
    companiesResult.data.map((company) => [company.id, company]),
  );

  return applicationsResult.data
    .flatMap((application) => {
      const opportunity = opportunities.get(application.opportunity_id);
      const company = opportunity
        ? companies.get(opportunity.company_id)
        : null;
      if (!opportunity || !company) return [];

      return [
        {
          id: application.id,
          title: opportunity.title,
          companyId: company.id,
          companyName: company.name,
          companyLogoUrl: company.logo_url ?? "",
          primaryRecruiterId: application.primary_recruiter_id ?? "",
          interviewPreparation: application.interview_preparation ?? "",
          questionsForCompany: application.questions_for_company ?? "",
        },
      ];
    })
    .sort((left, right) =>
      `${left.companyName} ${left.title}`.localeCompare(
        `${right.companyName} ${right.title}`,
        "pt-PT",
      ),
    );
}

export async function getInterviewRecruiterOptions(): Promise<
  InterviewRecruiterOption[]
> {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recruiters")
    .select("id, name, company_id")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) throw new Error("Não foi possível consultar os contactos.");
  return data.map((recruiter) => ({
    id: recruiter.id,
    name: recruiter.name,
    companyId: recruiter.company_id ?? "",
  }));
}

export async function getInterviews(
  filters: InterviewListFilters = {},
): Promise<InterviewListItem[]> {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  let interviewsQuery = supabase
    .from("interviews")
    .select(
      "id, application_id, recruiter_id, interview_type, scheduled_at, status, format, duration_minutes, location_or_url",
    )
    .eq("user_id", user.id);

  if (filters.status)
    interviewsQuery = interviewsQuery.eq("status", filters.status);
  if (filters.applicationId) {
    interviewsQuery = interviewsQuery.eq(
      "application_id",
      filters.applicationId,
    );
  }

  const [
    interviewsResult,
    applicationsResult,
    opportunitiesResult,
    companiesResult,
    recruitersResult,
  ] = await Promise.all([
    interviewsQuery,
    supabase
      .from("applications")
      .select("id, opportunity_id")
      .eq("user_id", user.id),
    supabase
      .from("opportunities")
      .select("id, company_id, title")
      .eq("user_id", user.id),
    supabase
      .from("companies")
      .select("id, name, logo_url")
      .eq("user_id", user.id),
    supabase.from("recruiters").select("id, name").eq("user_id", user.id),
  ]);

  if (
    interviewsResult.error ||
    applicationsResult.error ||
    opportunitiesResult.error ||
    companiesResult.error ||
    recruitersResult.error
  ) {
    throw new Error("Não foi possível consultar as entrevistas.");
  }

  const applications = new Map(
    applicationsResult.data.map((application) => [application.id, application]),
  );
  const opportunities = new Map(
    opportunitiesResult.data.map((opportunity) => [
      opportunity.id,
      opportunity,
    ]),
  );
  const companies = new Map(
    companiesResult.data.map((company) => [company.id, company]),
  );
  const recruiters = new Map(
    recruitersResult.data.map((recruiter) => [recruiter.id, recruiter]),
  );

  const now = Date.now();
  return interviewsResult.data
    .flatMap((interview) => {
      const application = applications.get(interview.application_id);
      const opportunity = application
        ? opportunities.get(application.opportunity_id)
        : null;
      const company = opportunity
        ? companies.get(opportunity.company_id)
        : null;
      if (!application || !opportunity || !company) return [];

      return [
        {
          id: interview.id,
          applicationId: application.id,
          title: opportunity.title,
          companyName: company.name,
          companyLogoUrl: company.logo_url ?? "",
          recruiterName: interview.recruiter_id
            ? (recruiters.get(interview.recruiter_id)?.name ?? "")
            : "",
          interviewType: interview.interview_type,
          scheduledAt: interview.scheduled_at,
          status: interview.status,
          format: interview.format,
          durationMinutes: interview.duration_minutes,
          locationOrUrl: interview.location_or_url ?? "",
          isUpcoming:
            interview.status === "scheduled" &&
            Date.parse(interview.scheduled_at) >= now,
        },
      ];
    })
    .sort((left, right) => {
      if (left.isUpcoming !== right.isUpcoming) return left.isUpcoming ? -1 : 1;
      return left.isUpcoming
        ? left.scheduledAt.localeCompare(right.scheduledAt)
        : right.scheduledAt.localeCompare(left.scheduledAt);
    });
}

export async function getInterviewById(
  interviewId: string,
): Promise<InterviewDetails | null> {
  if (!isValidInterviewId(interviewId)) return null;

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interviews")
    .select(
      "id, application_id, recruiter_id, interview_type, scheduled_at, status, format, duration_minutes, location_or_url, participants, preparation, feedback, result",
    )
    .eq("id", interviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error("Não foi possível consultar a entrevista.");
  if (!data) return null;

  return {
    id: data.id,
    applicationId: data.application_id,
    recruiterId: data.recruiter_id ?? "",
    interviewType: data.interview_type,
    scheduledAtLocal: toLisbonLocalInput(data.scheduled_at),
    timezoneOffset: lisbonOffsetForInstant(data.scheduled_at),
    status: data.status,
    format: data.format,
    durationMinutes: data.duration_minutes.toString(),
    locationOrUrl: data.location_or_url ?? "",
    participants: data.participants.join("\n"),
    preparation: data.preparation ?? "",
    feedback: data.feedback ?? "",
    result: data.result ?? "",
  };
}
