import { X } from "lucide-react";
import Link from "next/link";

export type ActiveFilter = {
  label: string;
  value: string;
};

export function ActiveFilters({
  filters,
  clearHref,
}: {
  filters: ActiveFilter[];
  clearHref: string;
}) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
      <span className="mr-1 text-xs font-bold tracking-wide text-blue-800 uppercase">
        Filtros ativos
      </span>
      {filters.map((filter) => (
        <span
          key={`${filter.label}-${filter.value}`}
          className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-2.5 py-1 text-xs text-slate-600"
        >
          <span className="font-semibold text-slate-800">{filter.label}:</span>
          {filter.value}
        </span>
      ))}
      <Link
        href={clearHref}
        className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <X aria-hidden="true" className="size-3.5" />
        Limpar todos
      </Link>
    </div>
  );
}
