"use server";

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

function validationError(
  fieldErrors: NonNullable<ActionActionState["fieldErrors"]>,
): ActionActionState {
  return {
    status: "error",
    message: "Revê os campos assinalados.",
    fieldErrors,
  };
}

function saveError(): ActionActionState {
  return {
    status: "error",
    message: "Não foi possível guardar a ação. Tenta novamente.",
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
  const { values, fieldErrors } = validateActionForm(formData);
  if (hasActionFieldErrors(fieldErrors)) return validationError(fieldErrors);

  const user = await requireCurrentUser();
  if (!(await applicationBelongsToUser(values.application_id, user.id))) {
    return validationError({
      applicationId: "Seleciona uma candidatura disponível.",
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
  if (!isValidActionId(actionId)) {
    return { status: "error", message: "A ação indicada não é válida." };
  }

  const { values, fieldErrors } = validateActionForm(formData);
  if (hasActionFieldErrors(fieldErrors)) return validationError(fieldErrors);

  const user = await requireCurrentUser();
  if (!(await applicationBelongsToUser(values.application_id, user.id))) {
    return validationError({
      applicationId: "Seleciona uma candidatura disponível.",
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
      return { status: "error", message: "A ação já não está disponível." };
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
    return { status: "error", message: "A ação já não está disponível." };
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
  void _previousState;
  void _formData;

  if (!isValidActionId(actionId)) {
    return { status: "error", message: "A ação indicada não é válida." };
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
      message: "Não foi possível eliminar a ação. Tenta novamente.",
    };
  }
  if (!data) {
    return { status: "error", message: "A ação já não está disponível." };
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
  if (!isValidActionId(actionId)) {
    return { status: "error", message: "A ação indicada não é válida." };
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
      message: "Não foi possível atualizar a ação. Tenta novamente.",
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
