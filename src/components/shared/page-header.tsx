import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <title>{`${title} | Job Application Tracker`}</title>
      <div className="min-w-0">
        <h1 className="break-words text-2xl font-bold tracking-tight text-slate-950 [overflow-wrap:anywhere] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 break-words text-sm leading-6 text-slate-500 [overflow-wrap:anywhere] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
