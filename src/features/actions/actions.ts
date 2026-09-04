"use server";

import { getTranslations } from "next-intl/server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionActionState } from "@/features/actions/types";
import {
  hasActionFieldErrors,
  isValidActionId,
  validateActionForm,
} from "@/features/actions/validation";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const actionsPath = "/acoes";

async function validationError(
  fieldErrors: NonNullable<ActionActionState["fieldErrors"]>,
): Promise<ActionActionState> {
  const t = await getTranslations("TaskActions");
  return {
    status: "error",
    message: t("reviewFields"),
    fieldErrors,
  };
}

async function saveError(): Promise<ActionActionState> {
  const t = await getTranslations("TaskActions");
  return {
    status: "error",
    message: t("saveFailed"),
  };
}

function revalidateActionPages() {
  revalidatePath(actionsPath);
  revalidatePath("/dashboard");
  revalidatePath("/candidaturas");
  revalidatePath("/candidaturas/[applicationId]", "page");
}

async function applicationBelongsToUser(applicationId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function createActionAction(
  _previousState: ActionActionState,
  formData: FormData,
): Promise<ActionActionState> {
  const t = await getTranslations("TaskActions");
  const { values, fieldErrors } = validateActionForm(
    formData,
    await getTranslations("TaskValidation"),
  );
  if (hasActionFieldErrors(fieldErrors)) return validationError(fieldErrors);

  const user = await requireCurrentUser();
  if (!(await applicationBelongsToUser(values.application_id, user.id))) {
    return validationError({
      applicationId: t("availableApplication"),
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("actions").insert({
    user_id: user.id,
    ...values,
  });

  if (error) return saveError();
  revalidateActionPages();
  redirect(`${actionsPath}?aviso=acao-criada`);
}

export async function updateActionAction(
  actionId: string,
  returnToApplication: boolean,
  _previousState: ActionActionState,
  formData: FormData,
): Promise<ActionActionState> {
  const t = await getTranslations("TaskActions");
  if (!isValidActionId(actionId)) {
    return { status: "error", message: t("invalidTask") };
  }

  const { values, fieldErrors } = validateActionForm(
    formData,
    await getTranslations("TaskValidation"),
  );
  if (hasActionFieldErrors(fieldErrors)) return validationError(fieldErrors);

  const user = await requireCurrentUser();
  if (!(await applicationBelongsToUser(values.application_id, user.id))) {
    return validationError({
      applicationId: t("availableApplication"),
    });
  }

  const supabase = await createClient();
  if (values.status === "completed") {
    const { data: existingAction, error: existingActionError } = await supabase
      .from("actions")
      .select("completed_at")
      .eq("id", actionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingActionError || !existingAction) {
      return { status: "error", message: t("unavailable") };
    }
    values.completed_at = existingAction.completed_at ?? values.completed_at;
  }

  const { data, error } = await supabase
    .from("actions")
    .update(values)
    .eq("id", actionId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return saveError();
  if (!data) {
    return { status: "error", message: t("unavailable") };
  }

  revalidateActionPages();
  redirect(
    returnToApplication
      ? `/candidaturas/${values.application_id}?aviso=acao-atualizada`
      : `${actionsPath}?aviso=acao-atualizada`,
  );
}

export async function deleteActionAction(
  actionId: string,
  returnToApplication: boolean,
  _previousState: ActionActionState,
  _formData: FormData,
): Promise<ActionActionState> {
  const t = await getTranslations("TaskActions");
  void _previousState;
  void _formData;

  if (!isValidActionId(actionId)) {
    return { status: "error", message: t("invalidTask") };
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("actions")
    .delete()
    .eq("id", actionId)
    .eq("user_id", user.id)
    .select("id, application_id")
    .maybeSingle();

  if (error) {
    return {
      status: "error",
      message: t("deleteFailed"),
    };
  }
  if (!data) {
    return { status: "error", message: t("unavailable") };
  }

  revalidateActionPages();
  redirect(
    returnToApplication
      ? `/candidaturas/${data.application_id}?aviso=acao-eliminada`
      : `${actionsPath}?aviso=acao-eliminada`,
  );
}

async function setActionCompletion(
  actionId: string,
  completed: boolean,
): Promise<ActionActionState> {
  const t = await getTranslations("TaskActions");
  if (!isValidActionId(actionId)) {
    return { status: "error", message: t("invalidTask") };
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("actions")
    .update({
      status: completed ? "completed" : "pending",
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", actionId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      status: "error",
      message: t("updateFailed"),
    };
  }

  revalidateActionPages();
  return { status: "idle" };
}

export async function completeActionAction(
  actionId: string,
  _previousState: ActionActionState,
  _formData: FormData,
) {
  void _previousState;
  void _formData;
  return setActionCompletion(actionId, true);
}

export async function reopenActionAction(
  actionId: string,
  _previousState: ActionActionState,
  _formData: FormData,
) {
  void _previousState;
  void _formData;
  return setActionCompletion(actionId, false);
}
