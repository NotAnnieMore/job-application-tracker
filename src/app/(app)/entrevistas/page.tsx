import { CalendarDays, Clock3, MapPin, Plus, Video } from "lucide-react";

import { DemoNotice } from "@/components/shared/demo-notice";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { upcomingInterviews } from "@/features/interviews/mock-data";

export default function InterviewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Entrevistas"
        description="Prepara e acompanha todas as conversas agendadas."
        action={
          <Button>
            <Plus aria-hidden="true" className="size-4" />
            Nova entrevista
          </Button>
        }
      />
      <DemoNotice />
      <div className="space-y-4">
        {upcomingInterviews.map((interview, index) => (
          <Card key={interview.id}>
            <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                <span className="text-xl font-bold leading-none text-slate-950">
                  {interview.day}
                </span>
                <span className="mt-1 text-[10px] font-bold tracking-wide text-slate-500">
                  {interview.month}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-slate-950">{interview.role}</h2>
                  <Badge variant={index === 0 ? "purple" : "blue"}>
                    {index === 0 ? "Entrevista técnica" : "Entrevista inicial"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  {interview.company}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <Clock3 aria-hidden="true" className="size-4" />
                    {interview.time}
                  </span>
                  <span className="flex items-center gap-2">
                    <Video aria-hidden="true" className="size-4" />
                    Videochamada
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin aria-hidden="true" className="size-4" />
                    Remoto
                  </span>
                </div>
              </div>
              <Button variant="secondary">
                <CalendarDays aria-hidden="true" className="size-4" />
                Ver detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
