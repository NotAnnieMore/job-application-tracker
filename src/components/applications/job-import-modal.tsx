"use client";

import { ArrowLeft, FileSearch, LoaderCircle, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { workModeOptions } from "@/features/applications/constants";
import type {
  ImportedJobData,
  JobImportResponse,
} from "@/features/job-import/types";

const textareaClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-3 focus:ring-blue-100";
const maxDescriptionLength = 5_000;

type Phase = "input" | "review";

export function JobImportModal({
  initialUrl,
  onApply,
  onClose,
}: {
  initialUrl: string;
  onApply: (data: ImportedJobData) => void;
  onClose: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("JobImport");
  const enums = useTranslations("Enums.workMode");
  const [phase, setPhase] = useState<Phase>("input");
  const [url, setUrl] = useState(initialUrl);
  const [rawText, setRawText] = useState("");
  const [data, setData] = useState<ImportedJobData | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("input")?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function handleDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && !pending) {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
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

  async function analyseJob() {
    setPending(true);
    setError("");
    setWarnings([]);
    try {
      const response = await fetch("/api/job-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, text: rawText }),
      });
      const payload = (await response.json()) as JobImportResponse;
      if (!response.ok || !payload.data) {
        setError(payload.message ?? t("analyseFailed"));
        return;
      }
      setData(payload.data);
      setWarnings(payload.warnings ?? []);
      setPhase("review");
    } catch {
      setError(t("connectionFailed"));
    } finally {
      setPending(false);
    }
  }

  function update<K extends keyof ImportedJobData>(
    field: K,
    value: ImportedJobData[K],
  ) {
    setData((current) => (current ? { ...current, [field]: value } : current));
  }

  function applyData() {
    if (!data) return;
    if (!data.title.trim() || !data.companyName.trim()) {
      setError(t("requiredFields"));
      return;
    }
    onApply({
      ...data,
      title: data.title.trim(),
      companyName: data.companyName.trim(),
      location: data.location.trim(),
      description: data.description.trim().slice(0, maxDescriptionLength),
    });
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-import-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onKeyDown={handleDialogKeyDown}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileSearch aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 id="job-import-title" className="font-bold text-slate-950">
                {phase === "input" ? t("title") : t("reviewTitle")}
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {phase === "input" ? t("description") : t("reviewDescription")}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("close")}
            title={t("close")}
            disabled={pending}
            onClick={onClose}
          >
            <X aria-hidden="true" className="size-5" />
          </Button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {error}
            </p>
          ) : null}

          {phase === "input" ? (
            <>
              <FormField
                label={t("jobLink")}
                htmlFor="job-import-url"
                hint={t("jobLinkHint")}
              >
                <input
                  id="job-import-url"
                  type="url"
                  inputMode="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://..."
                  className={fieldClassName}
                  maxLength={4000}
                />
              </FormField>
              <FormField
                label={t("jobText")}
                htmlFor="job-import-text"
                hint={t("jobTextHint")}
              >
                <textarea
                  id="job-import-text"
                  value={rawText}
                  onChange={(event) => setRawText(event.target.value)}
                  rows={12}
                  maxLength={20_000}
                  placeholder={t("jobTextPlaceholder")}
                  className={textareaClassName}
                />
              </FormField>
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
                {t("privacy")}
              </div>
            </>
          ) : data ? (
            <>
              {warnings.map((warning) => (
                <p
                  key={warning}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                >
                  {warning}
                </p>
              ))}
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label={t("jobTitle")}
                  htmlFor="imported-title"
                  required
                >
                  <input
                    id="imported-title"
                    value={data.title}
                    onChange={(event) => update("title", event.target.value)}
                    className={fieldClassName}
                    maxLength={200}
                    required
                  />
                </FormField>
                <FormField
                  label={t("company")}
                  htmlFor="imported-company"
                  required
                >
                  <input
                    id="imported-company"
                    value={data.companyName}
                    onChange={(event) =>
                      update("companyName", event.target.value)
                    }
                    className={fieldClassName}
                    maxLength={160}
                    required
                  />
                </FormField>
                <FormField label={t("location")} htmlFor="imported-location">
                  <input
                    id="imported-location"
                    value={data.location}
                    onChange={(event) => update("location", event.target.value)}
                    className={fieldClassName}
                    maxLength={160}
                  />
                </FormField>
                <FormField label={t("workMode")} htmlFor="imported-work-mode">
                  <select
                    id="imported-work-mode"
                    value={data.workMode}
                    onChange={(event) =>
                      update(
                        "workMode",
                        event.target.value as ImportedJobData["workMode"],
                      )
                    }
                    className={fieldClassName}
                  >
                    <option value="">{t("noWorkMode")}</option>
                    {workModeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {enums(option.value)}
                      </option>
                    ))}
                  </select>
                </FormField>
                <div className="sm:col-span-2">
                  <FormField
                    label={t("aboutJob")}
                    htmlFor="imported-description"
                  >
                    <textarea
                      id="imported-description"
                      value={data.description}
                      onChange={(event) =>
                        update("description", event.target.value)
                      }
                      rows={12}
                      maxLength={maxDescriptionLength}
                      className={textareaClassName}
                    />
                    <p className="mt-1.5 text-right text-xs text-slate-500">
                      {data.description.length.toLocaleString(locale)}/
                      {(5_000).toLocaleString(locale)}
                    </p>
                  </FormField>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-500">
                {t("newCompanyHint")}
              </p>
            </>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            {phase === "review" ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setPhase("input");
                  setError("");
                }}
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
                {t("back")}
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={onClose}>
                {t("cancel")}
              </Button>
            )}
            <Button
              type="button"
              disabled={pending}
              onClick={phase === "input" ? analyseJob : applyData}
            >
              {pending ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              ) : (
                <Sparkles aria-hidden="true" className="size-4" />
              )}
              {pending
                ? t("analysing")
                : phase === "input"
                  ? t("analyse")
                  : t("fillApplication")}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
