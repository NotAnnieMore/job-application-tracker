export const locales = ["pt-PT", "en-GB"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "pt-PT";
export const localeCookieName = "job-tracker-locale";

export function isAppLocale(value: string | undefined): value is AppLocale {
  return locales.some((locale) => locale === value);
}
