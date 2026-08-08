import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";

export default function ApplicationNotFound() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <title>Candidatura não encontrada | Job Application Tracker</title>
      <h1 className="text-xl font-bold text-slate-950">
        Candidatura não encontrada
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Esta candidatura pode ter sido eliminada ou não pertencer à tua conta.
      </p>
      <Link
        href="/candidaturas"
        className={buttonClassName({ className: "mt-6" })}
      >
        Voltar às candidaturas
      </Link>
    </div>
  );
}
