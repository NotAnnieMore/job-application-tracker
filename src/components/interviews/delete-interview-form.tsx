"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { deleteInterviewAction } from "@/features/interviews/actions";
import { initialInterviewActionState } from "@/features/interviews/types";

export function DeleteInterviewForm({
  interviewId,
  interviewType,
  returnToApplication = false,
}: {
  interviewId: string;
  interviewType: string;
  returnToApplication?: boolean;
}) {
  const action = deleteInterviewAction.bind(
    null,
    interviewId,
    returnToApplication,
  );
  const [state, formAction, pending] = useActionState(
    action,
    initialInterviewActionState,
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
          if (!window.confirm(`Eliminar “${interviewType}”?`)) {
            event.preventDefault();
          }
        }}
      >
        {pending ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Trash2 aria-hidden="true" className="size-4" />
        )}
        {pending ? "A eliminar..." : "Eliminar entrevista"}
      </Button>
    </form>
  );
}
