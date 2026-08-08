import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <Card className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className={buttonClassName({ className: "mt-5" })}
        >
          {actionLabel}
        </Link>
      ) : actionLabel ? (
        <Button className="mt-5">{actionLabel}</Button>
      ) : null}
    </Card>
  );
}
