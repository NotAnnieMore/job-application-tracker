"use client";

import { CheckCircle2, LoaderCircle, Pencil, Save, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { updateInterviewOutcomeAction } from "@/features/interviews/actions";

const textareaClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-3 focus:ring-blue-100";

export function InterviewOutcomeEditor({
  interviewId,
  initialFeedback,
  initialResult,
}: {
  interviewId: string;
  initialFeedback: string;
  initialResult: string;
}) {
  const locale = useLocale();
  const t = useTranslations("InterviewEditors");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [result, setResult] = useState(initialResult);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function openEditor() {
    setError("");
    setSaved(false);
    setOpen(true);
  }

  function closeEditor() {
    if (pending) return;
    setFeedback(initialFeedback);
    setResult(initialResult);
    setError("");
    setOpen(false);
  }

  function saveOutcome(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const actionResult = await updateInterviewOutcomeAction(
        interviewId,
        feedback,
        result,
      );
      if (actionResult.status === "error") {
        setError(actionResult.message ?? t("notesSaveFailed"));
        return;
      }
      setOpen(false);
      setSaved(true);
      router.refresh();
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && !pending) {
      event.preventDefault();
      closeEditor();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {saved ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            {t("saved")}
          </span>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={openEditor}
        >
          <Pencil aria-hidden="true" className="size-4" />
          {t("editNotes")}
        </Button>
      </div>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeEditor();
              }}
            >
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="interview-outcome-title"
                className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
                onKeyDown={handleKeyDown}
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                  <div>
                    <h2
                      id="interview-outcome-title"
                      className="font-bold text-slate-950"
                    >
                      {t("outcomeAndNotes")}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {t("notesDescription")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("close")}
                    disabled={pending}
                    onClick={closeEditor}
                  >
                    <X aria-hidden="true" className="size-5" />
                  </Button>
                </div>

                <form onSubmit={saveOutcome} className="space-y-5 p-5 sm:p-6">
                  {error ? (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {error}
                    </p>
                  ) : null}
                  <div>
                    <label
                      htmlFor="interview-feedback-quick-edit"
                      className="text-sm font-semibold text-slate-700"
                    >
                      {t("feedbackAndNotes")}
                    </label>
                    <textarea
                      id="interview-feedback-quick-edit"
                      value={feedback}
                      onChange={(event) => setFeedback(event.target.value)}
                      rows={9}
                      maxLength={10_000}
                      autoFocus
                      className={`${textareaClassName} mt-2`}
                      placeholder={t("feedbackPlaceholder")}
                    />
                    <p className="mt-1.5 text-right text-xs text-slate-500">
                      {feedback.length.toLocaleString(locale)}/
                      {(10_000).toLocaleString(locale)}
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="interview-result-quick-edit"
                      className="text-sm font-semibold text-slate-700"
                    >
                      {t("result")}
                    </label>
                    <textarea
                      id="interview-result-quick-edit"
                      value={result}
                      onChange={(event) => setResult(event.target.value)}
                      rows={5}
                      maxLength={4_000}
                      className={`${textareaClassName} mt-2`}
                      placeholder={t("resultPlaceholder")}
                    />
                    <p className="mt-1.5 text-right text-xs text-slate-500">
                      {result.length.toLocaleString(locale)}/
                      {(4_000).toLocaleString(locale)}
                    </p>
                  </div>
                  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={pending}
                      onClick={closeEditor}
                    >
                      {t("cancel")}
                    </Button>
                    <Button type="submit" disabled={pending}>
                      {pending ? (
                        <LoaderCircle
                          aria-hidden="true"
                          className="size-4 animate-spin"
                        />
                      ) : (
                        <Save aria-hidden="true" className="size-4" />
                      )}
                      {pending ? t("saving") : t("saveNotes")}
                    </Button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
