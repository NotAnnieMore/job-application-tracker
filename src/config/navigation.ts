import {
  Building2,
  CalendarDays,
  CalendarRange,
  FileText,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  labelKey:
    | "dashboard"
    | "calendar"
    | "applications"
    | "companies"
    | "recruiters"
    | "interviews"
    | "tasks"
    | "settings";
  href: string;
  icon: LucideIcon;
}

export const mainNavigation: NavigationItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "calendar", href: "/agenda", icon: CalendarRange },
  { labelKey: "applications", href: "/candidaturas", icon: FileText },
  { labelKey: "companies", href: "/empresas", icon: Building2 },
  { labelKey: "recruiters", href: "/recrutadores", icon: Users },
  { labelKey: "interviews", href: "/entrevistas", icon: CalendarDays },
  { labelKey: "tasks", href: "/acoes", icon: ListChecks },
  { labelKey: "settings", href: "/definicoes", icon: Settings },
];
