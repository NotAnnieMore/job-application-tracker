import { Info } from "lucide-react";

export function DemoNotice({
  children = "Esta página apresenta dados de demonstração. Ainda não existem operações ligadas à base de dados.",
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <p className="leading-6">{children}</p>
    </div>
  );
}
