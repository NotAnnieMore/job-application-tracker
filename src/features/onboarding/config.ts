export const CURRENT_ONBOARDING_VERSION = 1;

export const ONBOARDING_SESSION_STEP_KEY = "job-tracker-tour-step";

export const onboardingSteps = [
  {
    id: "dashboard-overview",
    route: "/dashboard",
    selector: "[data-tour='dashboard-overview']",
    titleKey: "steps.dashboard.title",
    descriptionKey: "steps.dashboard.description",
    side: "bottom",
    navigationHref: "/dashboard",
  },
  {
    id: "add-application",
    route: "/dashboard",
    selector: "[data-tour='add-application']",
    titleKey: "steps.addApplication.title",
    descriptionKey: "steps.addApplication.description",
    side: "bottom",
    navigationHref: "/dashboard",
    advanceOnTargetClick: true,
  },
  {
    id: "application-form",
    route: "/candidaturas/nova",
    selector: "[data-tour='application-form']",
    titleKey: "steps.applicationForm.title",
    descriptionKey: "steps.applicationForm.description",
    side: "top",
    navigationHref: "/candidaturas",
  },
  {
    id: "applications",
    route: "/candidaturas",
    selector: "[data-tour='applications']",
    titleKey: "steps.applications.title",
    descriptionKey: "steps.applications.description",
    side: "bottom",
    navigationHref: "/candidaturas",
  },
  {
    id: "interviews",
    route: "/entrevistas",
    selector: "[data-tour='interviews-header']",
    titleKey: "steps.interviews.title",
    descriptionKey: "steps.interviews.description",
    side: "bottom",
    navigationHref: "/entrevistas",
    advanceOnTargetClick: true,
  },
  {
    id: "interview-form",
    route: "/entrevistas/nova",
    selector: "[data-tour='interview-form']",
    titleKey: "steps.interviewForm.title",
    descriptionKey: "steps.interviewForm.description",
    side: "top",
    navigationHref: "/entrevistas",
  },
  {
    id: "recruiters",
    route: "/recrutadores",
    selector: "[data-tour='recruiters']",
    titleKey: "steps.recruiters.title",
    descriptionKey: "steps.recruiters.description",
    side: "bottom",
    navigationHref: "/recrutadores",
  },
  {
    id: "tasks",
    route: "/acoes",
    selector: "[data-tour='tasks']",
    titleKey: "steps.tasks.title",
    descriptionKey: "steps.tasks.description",
    side: "bottom",
    navigationHref: "/acoes",
  },
  {
    id: "statistics",
    route: "/dashboard",
    selector: "[data-tour='statistics']",
    titleKey: "steps.statistics.title",
    descriptionKey: "steps.statistics.description",
    side: "bottom",
    navigationHref: "/dashboard",
  },
] as const;

export type OnboardingStep = (typeof onboardingSteps)[number];
export type OnboardingStepId = OnboardingStep["id"];
