"use client";

import { useTranslations } from "next-intl";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { deleteCompanyAction } from "@/features/companies/actions";
import { initialCompanyActionState } from "@/features/companies/types";

export function DeleteCompanyForm({
  companyId,
  companyName,
}: {
  companyId: string;
  companyName: string;
}) {
  const t = useTranslations("Companies");
  const action = deleteCompanyAction.bind(null, companyId);
  const [state, formAction, pending] = useActionState(
    action,
    initialCompanyActionState,
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
          if (!window.confirm(t("deleteConfirm", { name: companyName }))) {
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
