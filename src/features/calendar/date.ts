export function formatAgendaDate(value: string, locale = "pt-PT") {
  const formatted = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));

  return formatted.charAt(0).toLocaleUpperCase(locale) + formatted.slice(1);
}
