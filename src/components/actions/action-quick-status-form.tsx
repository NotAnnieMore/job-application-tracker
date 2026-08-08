"use client";

import { Check, LoaderCircle, RotateCcw } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  completeActionAction,
  reopenActionAction,
} from "@/features/actions/actions";
import { initialActionActionState } from "@/features/actions/types";
import type { ActionStatusValue } from "@/types/database.types";

export function ActionQuickStatusForm({
  actionId,
  status,
}: {
  actionId: string;
  status: ActionStatusValue;
}) {
  const serverAction = (
    status === "completed" ? reopenActionAction : completeActionAction
  ).bind(null, actionId);
  const [state, formAction, pending] = useActionState(
    serverAction,
    initialActionActionState,
  );

  if (status === "cancelled") return null;

  const completed = status === "completed";
  return (
    <form action={formAction} className="space-y-1">
      <Button
        type="submit"
        variant={completed ? "secondary" : "primary"}
        size="sm"
        disabled={pending}
        title={completed ? "Reabrir ação" : "Marcar como concluída"}
        aria-label={completed ? "Reabrir ação" : "Marcar como concluída"}
      >
        {pending ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : completed ? (
          <RotateCcw aria-hidden="true" className="size-4" />
        ) : (
          <Check aria-hidden="true" className="size-4" />
        )}
        <span className="hidden sm:inline">
          {completed ? "Reabrir" : "Concluir"}
        </span>
      </Button>
      {state.message ? (
        <p role="alert" className="max-w-36 text-xs font-medium text-red-600">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
