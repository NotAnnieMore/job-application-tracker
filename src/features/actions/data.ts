import "server-only";

import { getLisbonToday } from "@/features/actions/date";
import type {
  ActionApplicationOption,
  ActionDetails,
  ActionListData,
  ActionListFilters,
  ActionListItem,
} from "@/features/actions/types";
import { isValidActionId } from "@/features/actions/validation";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const priorityOrder = { high: 0, medium: 1, low: 2 } as const;

export async function getActionApplicationOptions(): Promise<
  ActionApplicationOption[]
> {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const [applicationsResult, opportunitiesResult, companiesResult] =
    await Promise.all([
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
          companyName: company.name,
          companyLogoUrl: company.logo_url ?? "",
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

export async function getActions(
  filters: ActionListFilters = {},
): Promise<ActionListData> {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const [
    actionsResult,
    applicationsResult,
    opportunitiesResult,
    companiesResult,
  ] = await Promise.all([
    supabase
      .from("actions")
      .select(
        "id, application_id, description, due_date, status, priority, completed_at, updated_at",
      )
      .eq("user_id", user.id),
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
  ]);

  if (
    actionsResult.error ||
    applicationsResult.error ||
    opportunitiesResult.error ||
    companiesResult.error
  ) {
    throw new Error("Não foi possível consultar as ações.");
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
  const today = getLisbonToday();
  const allItems: ActionListItem[] = actionsResult.data.flatMap((action) => {
    const application = applications.get(action.application_id);
    const opportunity = application
      ? opportunities.get(application.opportunity_id)
      : null;
    const company = opportunity ? companies.get(opportunity.company_id) : null;
    if (!application || !opportunity || !company) return [];

    return [
      {
        id: action.id,
        applicationId: application.id,
        description: action.description,
        dueDate: action.due_date ?? "",
        status: action.status,
        priority: action.priority,
        completedAt: action.completed_at ?? "",
        title: opportunity.title,
        companyName: company.name,
        companyLogoUrl: company.logo_url ?? "",
        timing:
          !action.due_date || action.status !== "pending"
            ? "no_date"
            : action.due_date < today
              ? "overdue"
              : action.due_date === today
                ? "today"
                : "upcoming",
        updatedAt: action.updated_at,
      },
    ];
  });

  const items = allItems
    .filter((action) => !filters.status || action.status === filters.status)
    .filter(
      (action) => !filters.priority || action.priority === filters.priority,
    )
    .filter(
      (action) =>
        !filters.applicationId ||
        action.applicationId === filters.applicationId,
    )
    .sort((left, right) => {
      const leftPending = left.status === "pending";
      const rightPending = right.status === "pending";
      if (leftPending !== rightPending) return leftPending ? -1 : 1;
      if (leftPending) {
        if (left.dueDate && right.dueDate) {
          const dateOrder = left.dueDate.localeCompare(right.dueDate);
          if (dateOrder !== 0) return dateOrder;
        } else if (left.dueDate !== right.dueDate) {
          return left.dueDate ? -1 : 1;
        }
        return priorityOrder[left.priority] - priorityOrder[right.priority];
      }
      return right.updatedAt.localeCompare(left.updatedAt);
    });

  return {
    items,
    today,
    summary: {
      pending: allItems.filter((action) => action.status === "pending").length,
      overdue: allItems.filter((action) => action.timing === "overdue").length,
      dueToday: allItems.filter((action) => action.timing === "today").length,
      completed: allItems.filter((action) => action.status === "completed")
        .length,
    },
  };
}

export async function getActionById(
  actionId: string,
): Promise<ActionDetails | null> {
  if (!isValidActionId(actionId)) return null;

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("actions")
    .select("id, application_id, description, due_date, status, priority")
    .eq("id", actionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error("Não foi possível consultar a ação.");
  if (!data) return null;

  return {
    id: data.id,
    applicationId: data.application_id,
    description: data.description,
    dueDate: data.due_date ?? "",
    status: data.status,
    priority: data.priority,
  };
}
