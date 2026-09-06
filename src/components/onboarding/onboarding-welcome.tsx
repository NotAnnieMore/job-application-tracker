"use client";

import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { Compass } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function OnboardingWelcome({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip: () => void;
}) {
  const t = useTranslations("Onboarding");
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current
      ?.querySelector<HTMLElement>("[data-onboarding-primary]")
      ?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onSkip();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable.at(-1)!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-[2px]">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
      >
        <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <Compass aria-hidden="true" className="size-6" />
        </span>
        <h2
          id={titleId}
          className="mt-5 text-2xl font-bold tracking-tight text-slate-950"
        >
          {t("welcomeTitle")}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-slate-600">
          {t("welcomeDescription")}
        </p>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onSkip}>
            {t("skip")}
          </Button>
          <Button type="button" data-onboarding-primary onClick={onStart}>
            {t("startTour")}
          </Button>
        </div>
      </div>
    </div>
  );
}
