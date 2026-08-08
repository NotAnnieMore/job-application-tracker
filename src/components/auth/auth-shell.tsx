import Link from "next/link";

import { AppLogo } from "@/components/shared/app-logo";
import { Badge } from "@/components/ui/badge";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[minmax(0,1fr)_minmax(520px,0.85fr)]">
      <title>{`${title} | Job Application Tracker`}</title>
      <section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3 text-sm font-bold">
          <AppLogo />
          Job Application Tracker
        </Link>
        <div className="max-w-xl">
          <p className="text-sm font-semibold tracking-wide text-blue-300 uppercase">
            A tua procura, organizada
          </p>
          <p className="mt-5 text-4xl leading-tight font-bold tracking-tight">
            Mantém cada oportunidade, entrevista e próxima ação num único lugar.
          </p>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            Uma visão simples do teu progresso, criada para reduzir tarefas
            esquecidas e decisões dispersas.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Acesso privado com dados isolados por utilizador
        </p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-10 flex items-center gap-3 font-bold text-slate-950 lg:hidden"
          >
            <AppLogo />
            Job Application Tracker
          </Link>
          <Badge variant="blue">Área privada</Badge>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-2 leading-7 text-slate-500">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
