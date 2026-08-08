const lisbonTimeZone = "Europe/Lisbon";

function dateTimeParts(value: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: lisbonTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function toLisbonLocalInput(isoValue: string) {
  const values = dateTimeParts(new Date(isoValue));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function lisbonOffsetForInstant(isoValue: string) {
  const date = new Date(isoValue);
  const values = dateTimeParts(date);
  const localAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
  );

  return Math.round((date.getTime() - localAsUtc) / 60_000).toString();
}

export function formatInterviewDateTime(isoValue: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: lisbonTimeZone,
  }).format(new Date(isoValue));
}

export function formatInterviewDay(isoValue: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    timeZone: lisbonTimeZone,
  }).format(new Date(isoValue));
}

export function formatInterviewMonth(isoValue: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    month: "short",
    timeZone: lisbonTimeZone,
  })
    .format(new Date(isoValue))
    .replace(".", "")
    .toLocaleUpperCase("pt-PT");
}

export function formatInterviewTime(isoValue: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: lisbonTimeZone,
  }).format(new Date(isoValue));
}
