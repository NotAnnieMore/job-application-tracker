"use client";

import { useTranslations } from "next-intl";

import { LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import {
  actionPriorityOptions,
  actionStatusOptions,
} from "@/features/actions/constants";
import type {
  ActionActionState,
  ActionApplicationOption,
  ActionFormValues,
} from "@/features/actions/types";
import { initialActionActionState } from "@/features/actions/types";

type ActionFormAction = (
  state: ActionActionState,
  formData: FormData,
) => Promise<ActionActionState>;

const textareaClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-3 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

function SubmitButton({ label }: { label: string }) {
  const t = useTranslations("TaskForm");
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <Save aria-hidden="true" className="size-4" />
      )}
      {pending ? t("saving") : label}
    </Button>
  );
}

export function ActionForm({
  action,
  applications,
  initialValues,
  submitLabel,
  cancelHref = "/acoes",
}: {
  action: ActionFormAction;
  applications: ActionApplicationOption[];
  initialValues: ActionFormValues;
  submitLabel: string;
  cancelHref?: string;
}) {
  const t = useTranslations("TaskForm");
  const tStatus = useTranslations("Enums.taskStatus");
  const tPriority = useTranslations("Enums.taskPriority");
  const [state, formAction] = useActionState(action, initialActionActionState);

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {state.message}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">{t("details")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormField
              label={t("application")}
              htmlFor="action-application"
              required
              error={state.fieldErrors?.applicationId}
            >
              <select
                id="action-application"
                name="applicationId"
                defaultValue={initialValues.applicationId}
                className={fieldClassName}
                required
              >
                <option value="">{t("selectApplication")}</option>
                {applications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.companyName} — {application.title}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="md:col-span-2">
            <FormField
              label={t("task")}
              htmlFor="action-description"
              required
              hint={t("taskHint")}
              error={state.fieldErrors?.description}
            >
              <textarea
                id="action-description"
                name="description"
                rows={4}
                defaultValue={initialValues.description}
                placeholder={t("taskPlaceholder")}
                className={textareaClassName}
                maxLength={500}
                required
              />
            </FormField>
          </div>

          <FormField
            label={t("dueDate")}
            htmlFor="action-due-date"
            hint={t("dueDateHint")}
            error={state.fieldErrors?.dueDate}
          >
            <input
              id="action-due-date"
              name="dueDate"
              type="date"
              defaultValue={initialValues.dueDate}
              className={fieldClassName}
            />
          </FormField>

          <FormField
            label={t("priority")}
            htmlFor="action-priority"
            required
            error={state.fieldErrors?.priority}
          >
            <select
              id="action-priority"
              name="priority"
              defaultValue={initialValues.priority}
              className={fieldClassName}
              required
            >
              {actionPriorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {tPriority(option.value)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label={t("status")}
            htmlFor="action-status"
            hint={t("statusHint")}
            error={state.fieldErrors?.status}
          >
            <select
              id="action-status"
              name="status"
              defaultValue={initialValues.status}
              className={fieldClassName}
              required
            >
              {actionStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {tStatus(option.value)}
                </option>
              ))}
            </select>
          </FormField>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={cancelHref}
          className={buttonClassName({ variant: "secondary" })}
        >
          {t("cancel")}
        </Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
