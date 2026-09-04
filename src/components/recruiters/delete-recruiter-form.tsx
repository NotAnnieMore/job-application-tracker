"use client";

import { useTranslations } from "next-intl";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { deleteRecruiterAction } from "@/features/recruiters/actions";
import { initialRecruiterActionState } from "@/features/recruiters/types";

export function DeleteRecruiterForm({
  recruiterId,
  recruiterName,
}: {
  recruiterId: string;
  recruiterName: string;
}) {
  const t = useTranslations("Recruiters");
  const action = deleteRecruiterAction.bind(null, recruiterId);
  const [state, formAction, pending] = useActionState(
    action,
    initialRecruiterActionState,
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
          if (!window.confirm(t("deleteConfirm", { name: recruiterName }))) {
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
