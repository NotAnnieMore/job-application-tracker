export const locales = ["pt-PT", "en-GB"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en-GB";
export const localeCookieName = "job-tracker-locale";

export function isAppLocale(value: string | undefined): value is AppLocale {
  return locales.some((locale) => locale === value);
}

export function localeFromAcceptLanguage(
  acceptLanguage: string | null | undefined,
): AppLocale {
  const preferredLanguage = acceptLanguage
    ?.split(",", 1)[0]
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();

  return preferredLanguage === "pt-pt" || preferredLanguage === "pt-br"
    ? "pt-PT"
    : "en-GB";
}
