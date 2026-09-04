"use client";

import { useTranslations } from "next-intl";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { deleteActionAction } from "@/features/actions/actions";
import { initialActionActionState } from "@/features/actions/types";

export function DeleteActionForm({
  actionId,
  description,
  returnToApplication = false,
}: {
  actionId: string;
  description: string;
  returnToApplication?: boolean;
}) {
  const t = useTranslations("Tasks");
  const action = deleteActionAction.bind(null, actionId, returnToApplication);
  const [state, formAction, pending] = useActionState(
    action,
    initialActionActionState,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {state.message}
        </p>
      ) : null}
      <Button
        type="submit"
        variant="danger"
        disabled={pending}
        onClick={(event) => {
          if (!window.confirm(t("deleteConfirm", { description }))) {
            event.preventDefault();
          }
        }}
      >
        {pending ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Trash2 aria-hidden="true" className="size-4" />
        )}
        {pending ? t("deleting") : t("delete")}
      </Button>
    </form>
  );
}
