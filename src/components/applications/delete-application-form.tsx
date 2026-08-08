"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { deleteApplicationAction } from "@/features/applications/actions";
import { initialApplicationActionState } from "@/features/applications/types";

export function DeleteApplicationForm({
  applicationId,
  title,
}: {
  applicationId: string;
  title: string;
}) {
  const action = deleteApplicationAction.bind(null, applicationId);
  const [state, formAction, pending] = useActionState(
    action,
    initialApplicationActionState,
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
          if (
            !window.confirm(
              `Eliminar a candidatura a ${title}? Entrevistas, notas e ações associadas também serão eliminadas.`,
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        {pending ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Trash2 aria-hidden="true" className="size-4" />
        )}
        {pending ? "A eliminar..." : "Eliminar candidatura"}
      </Button>
    </form>
  );
}
