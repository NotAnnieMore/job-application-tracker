"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { driver, type Driver, type DriveStep, type Side } from "driver.js";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

import { OnboardingWelcome } from "@/components/onboarding/onboarding-welcome";
import { completeOnboardingAction } from "@/features/onboarding/actions";
import {
  CURRENT_ONBOARDING_VERSION,
  ONBOARDING_SESSION_STEP_KEY,
  onboardingSteps,
} from "@/features/onboarding/config";

type OnboardingContextValue = {
  startTour: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);
const NAVIGATION_COMPANION_CLASS = "job-tracker-tour-navigation";

function clearNavigationCompanion() {
  document
    .querySelectorAll(`.${NAVIGATION_COMPANION_CLASS}`)
    .forEach((element) => element.remove());
}

function highlightNavigationCompanion(href: string) {
  clearNavigationCompanion();
  const candidates = document.querySelectorAll<HTMLElement>(
    `[data-navigation-href="${href}"]`,
  );
  const visibleItem = Array.from(candidates).find(
    (element) => element.getClientRects().length > 0,
  );
  if (!visibleItem) return;

  const rectangle = visibleItem.getBoundingClientRect();
  const spotlight = visibleItem.cloneNode(true) as HTMLElement;
  spotlight.classList.add(NAVIGATION_COMPANION_CLASS);
  spotlight.removeAttribute("href");
  spotlight.removeAttribute("aria-current");
  spotlight.setAttribute("aria-hidden", "true");
  spotlight.setAttribute("tabindex", "-1");
  Object.assign(spotlight.style, {
    top: `${rectangle.top}px`,
    left: `${rectangle.left}px`,
    width: `${rectangle.width}px`,
    height: `${rectangle.height}px`,
  });
  document.body.appendChild(spotlight);
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("useOnboarding must be used inside OnboardingProvider");
  }

  return context;
}

export function OnboardingProvider({
  children,
  onboardingVersion,
}: {
  children: ReactNode;
  onboardingVersion: number;
}) {
  const t = useTranslations("Onboarding");
  const pathname = usePathname();
  const router = useRouter();
  const driverRef = useRef<Driver | null>(null);
  const persistedRef = useRef(onboardingVersion >= CURRENT_ONBOARDING_VERSION);
  const [showWelcome, setShowWelcome] = useState(
    onboardingVersion < CURRENT_ONBOARDING_VERSION,
  );
  const [tourRequest, setTourRequest] = useState(0);

  const markAsSeen = useCallback(() => {
    if (persistedRef.current) return;
    persistedRef.current = true;
    startTransition(() => {
      void completeOnboardingAction();
    });
  }, []);

  const closeTour = useCallback(
    (instance: Driver) => {
      window.sessionStorage.removeItem(ONBOARDING_SESSION_STEP_KEY);
      clearNavigationCompanion();
      setShowWelcome(false);
      markAsSeen();
      instance.destroy();
      if (driverRef.current === instance) driverRef.current = null;
    },
    [markAsSeen],
  );

  const navigateToStep = useCallback(
    (instance: Driver, index: number) => {
      const step = onboardingSteps[index];
      if (!step) {
        closeTour(instance);
        return;
      }

      if (step.route === pathname) {
        instance.moveTo(index);
        return;
      }

      window.sessionStorage.setItem(ONBOARDING_SESSION_STEP_KEY, step.id);
      instance.destroy();
      if (driverRef.current === instance) driverRef.current = null;
      router.push(step.route);
    },
    [closeTour, pathname, router],
  );

  const launchTour = useCallback(
    (startIndex: number) => {
      driverRef.current?.destroy();

      let activeInstance: Driver | null = null;
      const steps: DriveStep[] = onboardingSteps.map((step, index) => ({
        element: step.selector,
        waitForElement: 5000,
        advanceOnClick:
          "advanceOnTargetClick" in step && step.advanceOnTargetClick,
        disableActiveInteraction:
          "advanceOnTargetClick" in step && step.advanceOnTargetClick
            ? false
            : undefined,
        onHighlighted: () => highlightNavigationCompanion(step.navigationHref),
        onDeselected: clearNavigationCompanion,
        popover: {
          title: t(step.titleKey),
          description: t(step.descriptionKey),
          side: step.side as Side,
          align: "start",
          progressText: t("progress", {
            current: index + 1,
            total: onboardingSteps.length,
          }),
          nextBtnText:
            index === onboardingSteps.length - 1 ? t("finish") : t("next"),
          prevBtnText: t("previous"),
          onNextClick: () => {
            if (activeInstance) navigateToStep(activeInstance, index + 1);
          },
          onPrevClick: () => {
            if (activeInstance) navigateToStep(activeInstance, index - 1);
          },
          onPopoverRender: (popover) => {
            popover.closeButton.setAttribute("aria-label", t("close"));
            if (index === onboardingSteps.length - 1) return;

            const skipButton = document.createElement("button");
            skipButton.type = "button";
            skipButton.className = "job-tracker-tour-skip";
            skipButton.textContent = t("skip");
            skipButton.addEventListener("click", () => {
              if (activeInstance) closeTour(activeInstance);
            });
            popover.footerButtons.prepend(skipButton);
          },
        },
      }));

      const instance = driver({
        steps,
        animate: true,
        duration: 250,
        overlayColor: "#020617",
        overlayOpacity: 0.76,
        smoothScroll: true,
        allowClose: true,
        allowScroll: false,
        overlayClickBehavior: "close",
        stagePadding: 8,
        stageRadius: 16,
        disableActiveInteraction: true,
        allowKeyboardControl: true,
        popoverClass: "job-tracker-tour",
        popoverOffset: 12,
        showButtons: ["previous", "next", "close"],
        showProgress: true,
        onDestroyStarted: (_element, _step, options) => {
          closeTour(options.driver);
        },
        onDestroyed: () => {
          clearNavigationCompanion();
          if (driverRef.current === activeInstance) driverRef.current = null;
        },
      });

      activeInstance = instance;
      driverRef.current = instance;
      window.sessionStorage.removeItem(ONBOARDING_SESSION_STEP_KEY);
      instance.drive(startIndex);
    },
    [closeTour, navigateToStep, t],
  );

  const startTour = useCallback(() => {
    setShowWelcome(false);
    const firstStep = onboardingSteps[0];
    window.sessionStorage.setItem(ONBOARDING_SESSION_STEP_KEY, firstStep.id);

    if (pathname === firstStep.route) {
      setTourRequest((request) => request + 1);
    } else {
      router.push(firstStep.route);
    }
  }, [pathname, router]);

  const skipWelcome = useCallback(() => {
    setShowWelcome(false);
    markAsSeen();
  }, [markAsSeen]);

  useEffect(() => {
    const stepId = window.sessionStorage.getItem(ONBOARDING_SESSION_STEP_KEY);
    if (!stepId) return;

    const index = onboardingSteps.findIndex((step) => step.id === stepId);
    if (index < 0) {
      window.sessionStorage.removeItem(ONBOARDING_SESSION_STEP_KEY);
      return;
    }
    if (onboardingSteps[index].route !== pathname) return;

    const timeout = window.setTimeout(() => launchTour(index), 0);
    return () => window.clearTimeout(timeout);
  }, [launchTour, pathname, tourRequest]);

  useEffect(
    () => () => {
      driverRef.current?.destroy();
    },
    [],
  );

  const context = useMemo(() => ({ startTour }), [startTour]);

  return (
    <OnboardingContext.Provider value={context}>
      {children}
      {showWelcome ? (
        <OnboardingWelcome onStart={startTour} onSkip={skipWelcome} />
      ) : null}
    </OnboardingContext.Provider>
  );
}
