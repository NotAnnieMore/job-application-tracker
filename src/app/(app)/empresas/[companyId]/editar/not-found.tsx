import { Building2 } from "lucide-react";
import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CompanyNotFound() {
  return (
    <Card className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Building2 aria-hidden="true" className="size-6" />
      </span>
      <h1 className="mt-4 text-xl font-bold text-slate-950">
        Empresa não encontrada
      </h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        A empresa pode ter sido eliminada ou não pertencer à tua conta.
      </p>
      <Link href="/empresas" className={buttonClassName({ className: "mt-5" })}>
        Voltar às empresas
      </Link>
    </Card>
  );
}
