"use client";

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
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <Save aria-hidden="true" className="size-4" />
      )}
      {pending ? "A guardar..." : label}
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
            <h2 className="font-bold text-slate-950">Detalhes da ação</h2>
            <p className="mt-1 text-sm text-slate-500">
              Define uma tarefa concreta ligada a uma candidatura.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormField
              label="Candidatura"
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
                <option value="">Seleciona uma candidatura</option>
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
              label="Tarefa"
              htmlFor="action-description"
              required
              hint="Ex.: adaptar o CV, preparar teste técnico ou enviar agradecimento."
              error={state.fieldErrors?.description}
            >
              <textarea
                id="action-description"
                name="description"
                rows={4}
                defaultValue={initialValues.description}
                placeholder="O que precisas de fazer?"
                className={textareaClassName}
                maxLength={500}
                required
              />
            </FormField>
          </div>

          <FormField
            label="Data limite"
            htmlFor="action-due-date"
            hint="Pode ficar vazia se ainda não existir um prazo."
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
            label="Prioridade"
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
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Estado"
            htmlFor="action-status"
            hint="Também podes concluir rapidamente a tarefa na lista de ações."
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
                  {option.label}
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
          Cancelar
        </Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
