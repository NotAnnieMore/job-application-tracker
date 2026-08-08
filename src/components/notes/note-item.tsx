"use client";

import { LoaderCircle, Pencil, Save, Trash2 } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { deleteNoteAction, updateNoteAction } from "@/features/notes/actions";
import type { ApplicationNote } from "@/features/notes/types";
import { initialNoteActionState } from "@/features/notes/types";

const textareaClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100";

function formatNoteDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Lisbon",
  }).format(new Date(value));
}

export function NoteItem({ note }: { note: ApplicationNote }) {
  const updateAction = updateNoteAction.bind(null, note.applicationId, note.id);
  const deleteAction = deleteNoteAction.bind(null, note.applicationId, note.id);
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateAction,
    initialNoteActionState,
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteAction,
    initialNoteActionState,
  );
  const wasEdited = note.updatedAt !== note.createdAt;

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {note.content}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            {formatNoteDate(note.createdAt)}
            {wasEdited ? " · editada" : ""}
          </p>
        </div>
      </div>

      <details className="group mt-3 border-t border-slate-200 pt-3">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <Pencil aria-hidden="true" className="size-3.5" />
          Editar nota
        </summary>
        <form action={updateFormAction} className="mt-3 space-y-3">
          <label htmlFor={`note-${note.id}`} className="sr-only">
            Conteúdo da nota
          </label>
          <textarea
            id={`note-${note.id}`}
            name="content"
            rows={5}
            defaultValue={note.content}
            maxLength={5000}
            required
            className={textareaClassName}
            aria-invalid={Boolean(updateState.fieldErrors?.content)}
          />
          {updateState.message ? (
            <p role="alert" className="text-sm font-medium text-red-600">
              {updateState.fieldErrors?.content ?? updateState.message}
            </p>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={updatePending}>
              {updatePending ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              ) : (
                <Save aria-hidden="true" className="size-4" />
              )}
              {updatePending ? "A guardar..." : "Guardar nota"}
            </Button>
          </div>
        </form>
        <form action={deleteFormAction} className="mt-2">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={deletePending}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={(event) => {
              if (!window.confirm("Eliminar esta nota?")) {
                event.preventDefault();
              }
            }}
          >
            {deletePending ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : (
              <Trash2 aria-hidden="true" className="size-4" />
            )}
            Eliminar
          </Button>
          {deleteState.message ? (
            <p role="alert" className="mt-2 text-sm font-medium text-red-600">
              {deleteState.message}
            </p>
          ) : null}
        </form>
      </details>
    </article>
  );
}
