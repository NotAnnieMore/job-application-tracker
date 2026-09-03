"use client";

import { ChevronDown, LoaderCircle } from "lucide-react";
import { useId, useState, useTransition } from "react";

import { updateInterviewStatusAction } from "@/features/interviews/actions";
import { interviewStatusOptions } from "@/features/interviews/constants";
import { cn } from "@/lib/utils";
import type { InterviewStatusValue } from "@/types/database.types";

type StatusMessage = {
  tone: "warning" | "error";
  text: string;
};

const statusClasses: Record<InterviewStatusValue, string> = {
  scheduled: "border-blue-100 bg-blue-50 text-blue-700",
  completed: "border-emerald-100 bg-emerald-50 text-emerald-700",
  cancelled: "border-slate-200 bg-slate-100 text-slate-700",
};

export function InterviewQuickStatusForm({
  interviewId,
  status,
  className,
}: {
  interviewId: string;
  status: InterviewStatusValue;
  className?: string;
}) {
  const errorId = useId();
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [message, setMessage] = useState<StatusMessage | null>(null);
  const [pending, startTransition] = useTransition();

  function changeStatus(nextStatus: InterviewStatusValue) {
    const previousStatus = selectedStatus;
    setSelectedStatus(nextStatus);
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await updateInterviewStatusAction(
          interviewId,
          nextStatus,
        );

        if (result.status === "success") return;
        if (result.status === "warning") {
          setMessage({
            tone: "warning",
            text:
              result.message ??
              "A entrevista foi atualizada, mas a candidatura não.",
          });
          return;
        }
        setSelectedStatus(previousStatus);
        setMessage({
          tone: "error",
          text: result.message ?? "Não foi possível atualizar o estado.",
        });
      } catch {
        setSelectedStatus(previousStatus);
        setMessage({
          tone: "error",
          text: "Não foi possível atualizar o estado. Tenta novamente.",
        });
      }
    });
  }

  return (
    <div className={cn("min-w-0", className)}>
      <label className="relative block min-w-0">
        <span className="sr-only">Alterar estado da entrevista</span>
        <select
          value={selectedStatus}
          disabled={pending}
          onChange={(event) =>
            changeStatus(event.currentTarget.value as InterviewStatusValue)
          }
          className={cn(
            "interview-quick-status h-8 w-full max-w-full appearance-none rounded-lg border py-1 pr-8 pl-2.5 text-xs font-semibold outline-none transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70",
            statusClasses[selectedStatus],
          )}
          aria-describedby={message ? errorId : undefined}
          aria-busy={pending}
        >
          {interviewStatusOptions.map((option) => (
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
          id={errorId}
          role="alert"
          className={cn(
            "mt-1 max-w-52 text-xs font-medium",
            message.tone === "warning" ? "text-amber-700" : "text-red-600",
          )}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
