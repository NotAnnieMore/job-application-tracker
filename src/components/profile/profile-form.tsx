"use client";

import { ImagePlus, LoaderCircle, Save, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";

import { UserAvatar } from "@/components/profile/user-avatar";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { updateProfileAction } from "@/features/profile/actions";
import { initialProfileActionState } from "@/features/profile/types";
import { avatarMaxSize, avatarMimeTypes } from "@/features/profile/validation";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <Save aria-hidden="true" className="size-4" />
      )}
      {pending ? "A guardar..." : "Guardar alterações"}
    </Button>
  );
}

export function ProfileForm({
  fullName,
  email,
  avatarUrl,
}: {
  fullName: string;
  email: string;
  avatarUrl: string;
}) {
  const [state, formAction] = useActionState(
    updateProfileAction,
    initialProfileActionState,
  );
  const [name, setName] = useState(fullName);
  const [previewUrl, setPreviewUrl] = useState(avatarUrl);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [clientAvatarError, setClientAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef("");

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  function resetObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    resetObjectUrl();
    setClientAvatarError("");

    if (!file) {
      setPreviewUrl(removeAvatar ? "" : avatarUrl);
      return;
    }

    if (!avatarMimeTypes.includes(file.type)) {
      event.target.value = "";
      setClientAvatarError("Escolhe uma imagem JPG, PNG ou WebP.");
      setPreviewUrl(removeAvatar ? "" : avatarUrl);
      return;
    }

    if (file.size > avatarMaxSize) {
      event.target.value = "";
      setClientAvatarError("A imagem não pode ultrapassar 2 MB.");
      setPreviewUrl(removeAvatar ? "" : avatarUrl);
      return;
    }

    objectUrlRef.current = URL.createObjectURL(file);
    setPreviewUrl(objectUrlRef.current);
    setRemoveAvatar(false);
  }

  function handleRemoveAvatar() {
    resetObjectUrl();
    if (fileInputRef.current) fileInputRef.current.value = "";
    setClientAvatarError("");
    setPreviewUrl("");
    setRemoveAvatar(true);
  }

  const avatarError = clientAvatarError || state.fieldErrors?.avatar;

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="space-y-6"
    >
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
            <h2 className="font-bold text-slate-950">Perfil da conta</h2>
            <p className="mt-1 text-sm text-slate-500">
              A informação apresentada no cabeçalho da aplicação.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center rounded-2xl bg-slate-50 px-5 py-6 text-center">
            <UserAvatar fullName={name} imageUrl={previewUrl} size="lg" />
            <label
              htmlFor="profile-avatar"
              className={buttonClassName({
                variant: "secondary",
                size: "sm",
                className: "mt-5 cursor-pointer",
              })}
            >
              <ImagePlus aria-hidden="true" className="size-4" />
              {previewUrl ? "Alterar fotografia" : "Escolher fotografia"}
            </label>
            <input
              ref={fileInputRef}
              id="profile-avatar"
              name="avatar"
              type="file"
              accept={avatarMimeTypes.join(",")}
              className="sr-only"
              aria-describedby="profile-avatar-hint"
              onChange={handleAvatarChange}
            />
            <input
              type="hidden"
              name="removeAvatar"
              value={removeAvatar ? "true" : "false"}
            />
            {previewUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleRemoveAvatar}
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Remover
              </Button>
            ) : null}
            <p
              id="profile-avatar-hint"
              className="mt-3 text-xs leading-5 text-slate-500"
            >
              JPG, PNG ou WebP até 2 MB. Usa uma imagem quadrada para obteres o
              melhor resultado.
            </p>
            {avatarError ? (
              <p role="alert" className="mt-2 text-xs font-medium text-red-600">
                {avatarError}
              </p>
            ) : null}
          </div>

          <div className="grid content-start gap-5 md:grid-cols-2">
            <FormField
              label="Nome"
              htmlFor="profile-name"
              required
              error={state.fieldErrors?.name}
            >
              <input
                id="profile-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={fieldClassName}
                maxLength={120}
                aria-invalid={Boolean(state.fieldErrors?.name)}
                aria-describedby={
                  state.fieldErrors?.name ? "profile-name-error" : undefined
                }
                required
              />
            </FormField>
            <FormField
              label="Email"
              htmlFor="profile-email"
              hint="O email identifica a tua conta e não pode ser alterado aqui."
            >
              <input
                id="profile-email"
                type="email"
                value={email}
                className={fieldClassName}
                readOnly
                aria-describedby="profile-email-hint"
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
