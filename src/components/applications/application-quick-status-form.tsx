"use client";

import { ChevronDown, LoaderCircle } from "lucide-react";
import { useId, useState, useTransition } from "react";

import { updateApplicationStatusAction } from "@/features/applications/actions";
import {
  applicationStatusOptions,
  normalizeApplicationStatus,
} from "@/features/applications/constants";
import { cn } from "@/lib/utils";
import type { ApplicationStatusValue } from "@/types/database.types";

const statusClasses: Record<ApplicationStatusValue, string> = {
  interested: "border-slate-200 bg-slate-100 text-slate-700",
  applied: "border-blue-100 bg-blue-50 text-blue-700",
  interview_scheduled: "border-purple-100 bg-purple-50 text-purple-700",
  interview_completed: "border-amber-100 bg-amber-50 text-amber-700",
  awaiting_response: "border-amber-100 bg-amber-50 text-amber-700",
  offer_received: "border-emerald-100 bg-emerald-50 text-emerald-700",
  rejected: "border-red-100 bg-red-50 text-red-700",
  withdrawn: "border-slate-200 bg-slate-100 text-slate-700",
};

export function ApplicationQuickStatusForm({
  applicationId,
  status,
  className,
}: {
  applicationId: string;
  status: ApplicationStatusValue;
  className?: string;
}) {
  const normalizedStatus = normalizeApplicationStatus(status);
  const statusErrorId = useId();
  const [selectedStatus, setSelectedStatus] =
    useState<ApplicationStatusValue>(normalizedStatus);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function changeStatus(nextStatus: ApplicationStatusValue) {
    const previousStatus = selectedStatus;
    setSelectedStatus(nextStatus);
    setMessage("");

    startTransition(async () => {
      try {
        const result = await updateApplicationStatusAction(
          applicationId,
          nextStatus,
        );

        if (result.status !== "error") return;
        setSelectedStatus(previousStatus);
        setMessage(result.message ?? "Não foi possível atualizar o estado.");
      } catch {
        setSelectedStatus(previousStatus);
        setMessage("Não foi possível atualizar o estado. Tenta novamente.");
      }
    });
  }

  return (
    <div className={cn("min-w-0", className)}>
      <label className="relative block min-w-0">
        <span className="sr-only">Alterar estado da candidatura</span>
        <select
          value={selectedStatus}
          disabled={pending}
          onChange={(event) =>
            changeStatus(event.currentTarget.value as ApplicationStatusValue)
          }
          className={cn(
            "h-8 w-full max-w-full appearance-none rounded-lg border py-1 pr-8 pl-2.5 text-xs font-semibold outline-none transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70",
            statusClasses[selectedStatus],
          )}
          aria-describedby={message ? statusErrorId : undefined}
          aria-busy={pending}
        >
          {applicationStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {pending ? (
          <LoaderCircle
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 animate-spin"
          />
        ) : (
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2"
          />
        )}
      </label>
      {message ? (
        <p
          id={statusErrorId}
          role="alert"
          className="mt-1 max-w-44 text-xs font-medium text-red-600"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
