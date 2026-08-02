import { Check, ListChecks, Plus } from "lucide-react";

import { DemoNotice } from "@/components/shared/demo-notice";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { nextActions } from "@/features/dashboard/mock-data";
import { cn } from "@/lib/utils";

export default function ActionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Ações"
        description="Mantém visíveis os follow-ups e tarefas que exigem atenção."
        action={
          <Button>
            <Plus aria-hidden="true" className="size-4" />
            Nova ação
          </Button>
        }
      />
      <DemoNotice />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card>
          <CardContent className="divide-y divide-slate-100 p-0">
            {nextActions.map((action) => (
              <div key={action.id} className="flex items-center gap-4 p-5">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-lg border",
                    action.completed
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 bg-white",
                  )}
                >
                  {action.completed ? (
                    <Check aria-hidden="true" className="size-3.5" />
                  ) : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "font-semibold",
                      action.completed
                        ? "text-slate-400 line-through"
                        : "text-slate-800",
                    )}
                  >
                    {action.label}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-sm",
                      action.urgent
                        ? "font-semibold text-red-600"
                        : "text-slate-500",
                    )}
                  >
                    {action.date}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardContent>
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ListChecks aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-4 text-3xl font-bold text-slate-950">3</p>
            <p className="mt-1 text-sm text-slate-500">ações pendentes</p>
            <div className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <p>
                <span className="font-bold text-red-600">1</span> para hoje
              </p>
              <p className="mt-2">
                <span className="font-bold text-slate-900">1</span> concluída
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
