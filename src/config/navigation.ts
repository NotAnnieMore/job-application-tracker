import {
  Building2,
  CalendarDays,
  FileText,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const mainNavigation: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Candidaturas", href: "/candidaturas", icon: FileText },
  { label: "Empresas", href: "/empresas", icon: Building2 },
  { label: "Recrutadores", href: "/recrutadores", icon: Users },
  { label: "Entrevistas", href: "/entrevistas", icon: CalendarDays },
  { label: "Ações", href: "/acoes", icon: ListChecks },
  { label: "Definições", href: "/definicoes", icon: Settings },
];
