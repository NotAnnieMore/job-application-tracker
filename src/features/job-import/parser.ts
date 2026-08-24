import type { ImportedJobData } from "@/features/job-import/types";
import type { WorkModeValue } from "@/types/database.types";

type JsonObject = Record<string, unknown>;

const aboutHeadings = new Set([
  "about the job",
  "sobre a vaga",
  "sobre o emprego",
  "descrição da vaga",
  "descricao da vaga",
  "job description",
]);

function asObject(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function decodeEntities(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value.replace(
    /&(#x?[0-9a-f]+|[a-z]+);/giu,
    (match, entity: string) => {
      if (entity.startsWith("#x")) {
        return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
      }
      if (entity.startsWith("#")) {
        return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
      }
      return named[entity.toLowerCase()] ?? match;
    },
  );
}

function htmlToText(value: string) {
  return decodeEntities(
    value
      .replace(/<\s*br\s*\/?\s*>/giu, "\n")
      .replace(/<\/(p|div|li|h[1-6])\s*>/giu, "\n")
      .replace(/<li[^>]*>/giu, "• ")
      .replace(/<[^>]+>/gu, " "),
  )
    .replace(/\r/gu, "")
    .replace(/[ \t]+\n/gu, "\n")
    .replace(/\n{3,}/gu, "\n\n")
    .replace(/[ \t]{2,}/gu, " ")
    .trim();
}

function detectWorkMode(value: string): WorkModeValue | "" {
  const normalized = value.normalize("NFD").replace(/\p{Diacritic}/gu, "");

  if (/\b(hybrid|hibrid[oa])\b/iu.test(normalized)) return "hybrid";
  if (/\b(remote|remoto|remota|teletrabalho)\b/iu.test(normalized)) {
    return "remote";
  }
  if (/\b(on[ -]?site|presencial)\b/iu.test(normalized)) return "onsite";
  return "";
}

function sourceFromUrl(value: string) {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    if (hostname === "linkedin.com" || hostname.endsWith(".linkedin.com")) {
      return "LinkedIn";
    }
    if (hostname === "indeed.com" || hostname.endsWith(".indeed.com")) {
      return "Indeed";
    }
    return hostname.replace(/^www\./u, "");
  } catch {
    return "";
  }
}

function addressText(value: unknown) {
  const location = Array.isArray(value) ? value[0] : value;
  const locationObject = asObject(location);
  if (!locationObject) return stringValue(location);

  const address = asObject(locationObject.address);
  if (!address) return stringValue(locationObject.name);

  const countryObject = asObject(address.addressCountry);
  return [
    stringValue(address.addressLocality),
    stringValue(address.addressRegion),
    stringValue(countryObject?.name ?? address.addressCountry),
  ]
    .filter(Boolean)
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .join(", ");
}

function findJobPosting(value: unknown): JsonObject | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findJobPosting(item);
      if (found) return found;
    }
    return null;
  }

  const object = asObject(value);
  if (!object) return null;
  const rawType = object["@type"];
  const types = Array.isArray(rawType) ? rawType : [rawType];
  if (types.some((type) => stringValue(type).toLowerCase() === "jobposting")) {
    return object;
  }

  for (const nested of Object.values(object)) {
    const found = findJobPosting(nested);
    if (found) return found;
  }
  return null;
}

function absoluteUrl(value: string, pageUrl: string) {
  if (!value) return "";
  try {
    const url = new URL(value, pageUrl);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function organizationData(value: unknown, pageUrl: string) {
  const organization = asObject(value);
  if (!organization) {
    return { name: "", website: "", logoUrl: "" };
  }
  const logo = asObject(organization.logo);
  return {
    name: stringValue(organization.name),
    website: absoluteUrl(
      stringValue(organization.sameAs) || stringValue(organization.url),
      pageUrl,
    ),
    logoUrl: absoluteUrl(
      stringValue(logo?.url) || stringValue(organization.logo),
      pageUrl,
    ),
  };
}

function employmentTypeLabel(value: unknown) {
  const raw = Array.isArray(value) ? stringValue(value[0]) : stringValue(value);
  const normalized = raw.toUpperCase().replace(/[_-]+/gu, " ");
  const labels: Record<string, string> = {
    "FULL TIME": "Contrato sem termo",
    "PART TIME": "Part-time",
    CONTRACTOR: "Prestação de serviços",
    CONTRACT: "Contrato a termo",
    INTERN: "Estágio",
    INTERNSHIP: "Estágio",
    TEMPORARY: "Contrato a termo",
  };
  return labels[normalized] ?? raw;
}

export function parseJobPostingHtml(html: string, pageUrl: string) {
  const scripts = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu,
  );

  for (const match of scripts) {
    try {
      const parsed = JSON.parse(match[1].trim()) as unknown;
      const job = findJobPosting(parsed);
      if (!job) continue;

      const organization = organizationData(job.hiringOrganization, pageUrl);
      const description = htmlToText(stringValue(job.description));
      const location = addressText(job.jobLocation);
      const remoteHint = [
        stringValue(job.jobLocationType),
        location,
        description.slice(0, 1500),
      ].join(" ");

      return {
        jobUrl: pageUrl,
        title: stringValue(job.title),
        companyName: organization.name,
        companyWebsite: organization.website,
        companyLogoUrl: organization.logoUrl,
        location,
        workMode: detectWorkMode(remoteHint),
        employmentType: employmentTypeLabel(job.employmentType),
        description,
        source: sourceFromUrl(pageUrl),
      } satisfies ImportedJobData;
    } catch {
      // Some pages contain unrelated or invalid JSON-LD blocks. Try the next.
    }
  }

  return null;
}

function elementContent(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const content = html.match(pattern)?.[1];
    if (content) return htmlToText(content);
  }
  return "";
}

function jsonStringField(html: string, field: string) {
  const pattern = new RegExp(
    `"${field}"\\s*:\\s*("(?:\\\\.|[^"\\\\])*")`,
    "iu",
  );
  const rawValue = html.match(pattern)?.[1];
  if (!rawValue) return "";
  try {
    return stringValue(JSON.parse(rawValue));
  } catch {
    return "";
  }
}

function indeedEmploymentType(html: string) {
  const rawLabel = html.match(
    /"jobTypes"\s*:\s*\[[\s\S]{0,500}?"label"\s*:\s*("(?:\\.|[^"\\])*")/iu,
  )?.[1];
  if (!rawLabel) return "";
  try {
    return stringValue(JSON.parse(rawLabel));
  } catch {
    return "";
  }
}

export function parseIndeedJobHtml(
  html: string,
  pageUrl: string,
): ImportedJobData | null {
  const structuredData = parseJobPostingHtml(html, pageUrl);
  if (structuredData) return { ...structuredData, source: "Indeed" };

  const title =
    jsonStringField(html, "jobTitle") ||
    elementContent(html, [
      /<h1[^>]+data-testid=["']jobsearch-JobInfoHeader-title["'][^>]*>([\s\S]*?)<\/h1>/iu,
      /<h1[^>]+class=["'][^"']*jobsearch-JobInfoHeader-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/iu,
    ]);
  const companyName =
    jsonStringField(html, "companyName") ||
    elementContent(html, [
      /<[^>]+data-testid=["']inlineHeader-companyName["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/iu,
      /<[^>]+class=["'][^"']*jobsearch-InlineCompanyRating-companyHeader[^"']*["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/iu,
    ]);
  const location =
    jsonStringField(html, "formattedLocation") ||
    elementContent(html, [
      /<[^>]+data-testid=["']job-location["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/iu,
      /<[^>]+data-testid=["']inlineHeader-companyLocation["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/iu,
    ]);
  const description = htmlToText(
    jsonStringField(html, "sanitizedJobDescription") ||
      elementContent(html, [
        /<div[^>]+id=["']jobDescriptionText["'][^>]*>([\s\S]*?)<\/div>/iu,
      ]),
  ).slice(0, 5000);
  const logoUrl = absoluteUrl(jsonStringField(html, "logoUrl"), pageUrl);

  if (!title || !companyName) return null;

  return {
    jobUrl: pageUrl,
    title,
    companyName,
    companyWebsite: "",
    companyLogoUrl: logoUrl,
    location,
    workMode: detectWorkMode(
      `${title} ${location} ${description.slice(0, 1000)}`,
    ),
    employmentType: indeedEmploymentType(html),
    description,
    source: "Indeed",
  };
}

function classContent(html: string, tag: string, className: string) {
  const pattern = new RegExp(
    `<${tag}[^>]+class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)<\\/${tag}>`,
    "iu",
  );
  return htmlToText(html.match(pattern)?.[1] ?? "");
}

function linkedInLogo(html: string, pageUrl: string) {
  const imageTags = html.match(/<img\b[^>]*>/giu) ?? [];
  for (const tag of imageTags) {
    const delayedUrl = tag.match(/data-delayed-url=["']([^"']+)["']/iu)?.[1];
    if (!delayedUrl || !delayedUrl.includes("company-logo")) continue;
    return absoluteUrl(decodeEntities(delayedUrl), pageUrl);
  }
  return "";
}

function linkedInEmploymentType(html: string) {
  const criteria = html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/giu);
  for (const item of criteria) {
    const text = htmlToText(item[1]);
    const match = text.match(/Employment type\s+(.+)/iu);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

export function parseLinkedInJobHtml(
  html: string,
  pageUrl: string,
): ImportedJobData | null {
  const title = classContent(html, "h1", "top-card-layout__title");
  const companyName = classContent(html, "a", "topcard__org-name-link");
  const location = classContent(html, "span", "topcard__flavor--bullet");
  const description = classContent(html, "div", "show-more-less-html__markup");
  if (!title || !companyName) return null;

  return {
    jobUrl: pageUrl,
    title,
    companyName,
    companyWebsite: "",
    companyLogoUrl: linkedInLogo(html, pageUrl),
    location,
    workMode: detectWorkMode(`${title} ${location}`),
    employmentType: linkedInEmploymentType(html),
    description: description.slice(0, 5000),
    source: "LinkedIn",
  };
}

function cleanLine(value: string) {
  return value.replace(/\s+/gu, " ").trim();
}

function labelledValue(lines: string[], labels: string[]) {
  const pattern = new RegExp(
    `^(?:${labels.join("|")})\\s*[:–-]\\s*(.+)$`,
    "iu",
  );
  for (const line of lines) {
    const match = line.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

function headerCandidates(lines: string[], aboutIndex: number) {
  const limit = aboutIndex >= 0 ? aboutIndex : Math.min(lines.length, 12);
  const ignored =
    /^(guardar|save|candidatar|apply|partilhar|share|sobre a vaga|about the job|mostrar mais|show more|promovido|promoted)$/iu;
  return lines.slice(0, limit).filter((line) => !ignored.test(line));
}

export function parsePastedJobText(
  rawText: string,
  jobUrl: string,
): ImportedJobData {
  const lines = rawText
    .replace(/\r/gu, "")
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);
  const aboutIndex = lines.findIndex((line) =>
    aboutHeadings.has(line.toLowerCase()),
  );
  const header = headerCandidates(lines, aboutIndex);
  const labelledTitle = labelledValue(lines, ["vaga", "cargo", "job", "title"]);
  const labelledCompany = labelledValue(lines, ["empresa", "company"]);
  const labelledLocation = labelledValue(lines, [
    "local",
    "localização",
    "location",
  ]);
  const firstCompositeIndex = header.findIndex((line) => line.includes(" · "));
  const composite = firstCompositeIndex >= 0 ? header[firstCompositeIndex] : "";
  const compositeParts = composite.split(" · ").map(cleanLine).filter(Boolean);

  const title =
    labelledTitle ||
    header.find(
      (line, index) => index !== firstCompositeIndex && line.length <= 200,
    ) ||
    "";
  const companyName =
    labelledCompany ||
    compositeParts[0] ||
    header.find((line) => line !== title && line.length <= 160) ||
    "";
  const location =
    labelledLocation ||
    compositeParts.slice(1).join(" · ") ||
    header.find(
      (line) =>
        line !== title &&
        line !== companyName &&
        /\b(remote|remoto|hybrid|híbrido|presencial|lisboa|porto|portugal)\b/iu.test(
          line,
        ),
    ) ||
    "";
  const descriptionLines =
    aboutIndex >= 0 ? lines.slice(aboutIndex + 1) : lines;
  const description = descriptionLines.join("\n").slice(0, 5000);

  return {
    jobUrl,
    title,
    companyName,
    companyWebsite: "",
    companyLogoUrl: "",
    location,
    workMode: detectWorkMode([location, rawText].join(" ")),
    employmentType: "",
    description,
    source: sourceFromUrl(jobUrl) || "Outro",
  };
}

export function mergeImportedJobData(
  pageData: ImportedJobData | null,
  textData: ImportedJobData | null,
  jobUrl: string,
): ImportedJobData {
  const fallback: ImportedJobData = {
    jobUrl,
    title: "",
    companyName: "",
    companyWebsite: "",
    companyLogoUrl: "",
    location: "",
    workMode: "",
    employmentType: "",
    description: "",
    source: sourceFromUrl(jobUrl),
  };

  if (!pageData && !textData) return fallback;
  return Object.fromEntries(
    Object.keys(fallback).map((key) => {
      const typedKey = key as keyof ImportedJobData;
      if (typedKey === "jobUrl") return [typedKey, jobUrl];
      return [
        typedKey,
        textData?.[typedKey] || pageData?.[typedKey] || fallback[typedKey],
      ];
    }),
  ) as ImportedJobData;
}
