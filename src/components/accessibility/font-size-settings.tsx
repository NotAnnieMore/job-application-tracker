"use client";

import { Type } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    <Card>
      <CardHeader>
        <div>
          <h2 className="font-bold text-slate-950">{t("title")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm ring-1 ring-slate-200">
              <Type aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <label
                htmlFor="font-size-scale"
                className="text-sm font-semibold text-slate-900"
              >
                {t("label", { value: fontScale })}
              </label>
              <input
                id="font-size-scale"
                type="range"
                min={FONT_SCALE_VALUES[0]}
                max={FONT_SCALE_VALUES[FONT_SCALE_VALUES.length - 1]}
                step={5}
                value={fontScale}
                onChange={(event) => applyFontScale(Number(event.target.value))}
                className="mt-3 block w-full cursor-pointer accent-blue-600"
              />
              <div
                aria-hidden="true"
                className="mt-1 flex justify-between text-xs text-slate-500"
              >
                <span>{t("smaller")}</span>
                <span>{t("default")}</span>
                <span>{t("larger")}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">{t("preview")}</p>
            <Button
              variant="secondary"
              size="sm"
              disabled={fontScale === DEFAULT_FONT_SCALE}
              onClick={() => applyFontScale(DEFAULT_FONT_SCALE)}
              className="shrink-0"
            >
              {t("reset")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
