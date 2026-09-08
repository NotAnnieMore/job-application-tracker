"use client";

import { Type } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

const FONT_SCALE_STORAGE_KEY = "job-tracker-font-scale";
const FONT_SCALE_CHANGE_EVENT = "job-tracker-font-scale-change";
const FONT_SCALE_VALUES = [90, 95, 100, 105, 110] as const;
const DEFAULT_FONT_SCALE = 100;

function normalizeFontScale(value: string | null | undefined) {
  const parsed = Number(value);
  return FONT_SCALE_VALUES.includes(
    parsed as (typeof FONT_SCALE_VALUES)[number],
  )
    ? parsed
    : DEFAULT_FONT_SCALE;
}

function readFontScale() {
  return normalizeFontScale(document.documentElement.dataset.fontScale);
}

function readServerFontScale() {
  return DEFAULT_FONT_SCALE;
}

function applyFontScale(value: number, persist = true) {
  const scale = normalizeFontScale(String(value));
  const root = document.documentElement;
  root.dataset.fontScale = String(scale);
  root.style.setProperty("--app-font-scale", String(scale / 100));

  if (persist) {
    window.localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(scale));
    window.dispatchEvent(new Event(FONT_SCALE_CHANGE_EVENT));
  }
}

function subscribeToFontScale(callback: () => void) {
  const handlePreferenceChange = () => callback();
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== FONT_SCALE_STORAGE_KEY) return;
    applyFontScale(normalizeFontScale(event.newValue), false);
    callback();
  };

  window.addEventListener(FONT_SCALE_CHANGE_EVENT, handlePreferenceChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(FONT_SCALE_CHANGE_EVENT, handlePreferenceChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function FontSizeSettings() {
  const t = useTranslations("Settings.fontSize");
  const fontScale = useSyncExternalStore(
    subscribeToFontScale,
    readFontScale,
    readServerFontScale,
  );

  return (
    <section className="flex min-w-0 flex-col justify-between gap-4 p-4 sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <Type aria-hidden="true" className="size-4.5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-950">{t("title")}</h3>
          <p className="mt-0.5 text-sm leading-5 text-slate-500">
            {t("description")}
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="font-size-scale"
            className="text-sm font-semibold text-slate-900"
          >
            {t("label", { value: fontScale })}
          </label>
          <Button
            variant="ghost"
            size="sm"
            disabled={fontScale === DEFAULT_FONT_SCALE}
            onClick={() => applyFontScale(DEFAULT_FONT_SCALE)}
            className="h-7 shrink-0 px-2 text-xs"
          >
            {t("reset")}
          </Button>
        </div>
        <input
          id="font-size-scale"
          type="range"
          min={FONT_SCALE_VALUES[0]}
          max={FONT_SCALE_VALUES[FONT_SCALE_VALUES.length - 1]}
          step={5}
          value={fontScale}
          onChange={(event) => applyFontScale(Number(event.target.value))}
          className="mt-2 block w-full cursor-pointer accent-blue-600"
        />
        <div
          aria-hidden="true"
          className="mt-0.5 flex justify-between text-xs text-slate-500"
        >
          <span>{t("smaller")}</span>
          <span>{t("default")}</span>
          <span>{t("larger")}</span>
        </div>
      </div>
    </section>
  );
}
