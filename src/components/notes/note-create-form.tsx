"use client";

import { LoaderCircle, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { createNoteAction } from "@/features/notes/actions";
import { initialNoteActionState } from "@/features/notes/types";

const textareaClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-3 focus:ring-blue-100";

function SubmitButton() {
  const t = useTranslations("Notes");
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <Plus aria-hidden="true" className="size-4" />
      )}
      {pending ? t("saving") : t("add")}
    </Button>
  );
}

export function NoteCreateForm({ applicationId }: { applicationId: string }) {
  const t = useTranslations("Notes");
  const action = createNoteAction.bind(null, applicationId);
  const [state, formAction] = useActionState(action, initialNoteActionState);

  return (
    <form action={formAction} className="space-y-3">
      <label htmlFor="new-note" className="sr-only">
        {t("new")}
      </label>
      <textarea
        id="new-note"
        name="content"
        rows={4}
        maxLength={5000}
        required
        placeholder={t("placeholder")}
        className={textareaClassName}
        aria-describedby={
          state.fieldErrors?.content ? "new-note-error" : undefined
        }
        aria-invalid={Boolean(state.fieldErrors?.content)}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {state.message ? (
            <p
              id="new-note-error"
              role="alert"
              className="text-sm font-medium text-red-600"
            >
              {state.fieldErrors?.content ?? state.message}
            </p>
          ) : (
            <p className="text-xs text-slate-500">{t("orderHint")}</p>
          )}
        </div>
        <SubmitButton />
      </div>
    </form>
  );
}
