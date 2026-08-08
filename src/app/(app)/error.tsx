"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="flex min-h-96 flex-col items-center justify-center p-8 text-center">
      <title>Erro | Job Application Tracker</title>
      <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle aria-hidden="true" className="size-6" />
      </span>
      <h1 className="mt-4 text-xl font-bold text-slate-950">
        Não foi possível carregar esta página
      </h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Ocorreu um erro inesperado. Tenta novamente; se continuar, regressa ao
        dashboard.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button onClick={unstable_retry}>Tentar novamente</Button>
        <Link
          href="/dashboard"
          className={buttonClassName({ variant: "secondary" })}
        >
          Voltar ao dashboard
        </Link>
      </div>
    </Card>
  );
}
