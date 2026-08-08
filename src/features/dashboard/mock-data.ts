import type { ApplicationStatusValue } from "@/types/database.types";

export interface RecentApplication {
  id: string;
  role: string;
  company: string;
  companyInitial: string;
  companyColor: string;
  status: ApplicationStatusValue;
  applicationDate: string;
  nextAction: string;
  actionDate?: string;
}

export const recentApplications: RecentApplication[] = [
  {
    id: "demo-1",
    role: "Frontend Developer",
    company: "Coverflex",
    companyInitial: "C",
    companyColor: "bg-violet-600",
    status: "applied",
    applicationDate: "30/07/2026",
    nextAction: "Enviar follow-up",
    actionDate: "05/08/2026",
  },
  {
    id: "demo-2",
    role: "Software Engineer",
    company: "Feedzai",
    companyInitial: "F",
    companyColor: "bg-cyan-700",
    status: "interview_scheduled",
    applicationDate: "28/07/2026",
    nextAction: "Entrevista técnica",
    actionDate: "04/08/2026",
  },
  {
    id: "demo-3",
    role: "Full Stack Developer",
    company: "Sword Health",
    companyInitial: "S",
    companyColor: "bg-blue-600",
    status: "awaiting_response",
    applicationDate: "25/07/2026",
    nextAction: "Aguardar resposta",
    actionDate: "06/08/2026",
  },
  {
    id: "demo-4",
    role: "Backend Developer",
    company: "Blip",
    companyInitial: "B",
    companyColor: "bg-slate-950",
    status: "rejected",
    applicationDate: "20/07/2026",
    nextAction: "Sem ação pendente",
  },
  {
    id: "demo-5",
    role: "Cloud Engineer",
    company: "Critical TechWorks",
    companyInitial: "CT",
    companyColor: "bg-amber-600",
    status: "offer_received",
    applicationDate: "18/07/2026",
    nextAction: "Rever proposta",
    actionDate: "03/08/2026",
  },
];

export const upcomingInterviews = [
  {
    id: "interview-1",
    day: "04",
    month: "AGO",
    time: "14:00",
    role: "Software Engineer",
    company: "Feedzai",
    companyInitial: "F",
    companyColor: "bg-cyan-700",
  },
  {
    id: "interview-2",
    day: "07",
    month: "AGO",
    time: "11:30",
    role: "Frontend Developer",
    company: "Coverflex",
    companyInitial: "C",
    companyColor: "bg-violet-600",
  },
  {
    id: "interview-3",
    day: "11",
    month: "AGO",
    time: "15:00",
    role: "Product Engineer",
    company: "Remote",
    companyInitial: "R",
    companyColor: "bg-red-600",
  },
];

export const statusSummary = [
  { label: "Enviadas", value: 9, percentage: 82, color: "bg-blue-500" },
  { label: "Entrevistas", value: 4, percentage: 45, color: "bg-purple-500" },
  { label: "A aguardar", value: 7, percentage: 64, color: "bg-amber-400" },
  { label: "Rejeitadas", value: 5, percentage: 55, color: "bg-red-500" },
  { label: "Propostas", value: 3, percentage: 36, color: "bg-emerald-500" },
];

export const nextActions = [
  {
    id: "action-1",
    label: "Rever proposta — Critical TechWorks",
    date: "Hoje",
    urgent: true,
    completed: false,
  },
  {
    id: "action-2",
    label: "Preparar entrevista — Feedzai",
    date: "04/08/2026",
    urgent: false,
    completed: false,
  },
  {
    id: "action-3",
    label: "Enviar follow-up — Coverflex",
    date: "05/08/2026",
    urgent: false,
    completed: false,
  },
  {
    id: "action-4",
    label: "Pesquisar equipa — Sword Health",
    date: "Concluída",
    urgent: false,
    completed: true,
  },
];

export const recentActivity = [
  {
    id: "activity-1",
    type: "interview",
    title: "Entrevista agendada com a Feedzai",
    detail: "04/08/2026 às 14:00",
    relativeTime: "há 2 horas",
  },
  {
    id: "activity-2",
    type: "follow-up",
    title: "Follow-up definido para a Coverflex",
    detail: "Agendado para 05/08/2026",
    relativeTime: "há 5 horas",
  },
  {
    id: "activity-3",
    type: "application",
    title: "Candidatura adicionada",
    detail: "Frontend Developer — Coverflex",
    relativeTime: "há 1 dia",
  },
];
