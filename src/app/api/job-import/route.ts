import { isIP } from "node:net";
import { resolve4, resolve6 } from "node:dns/promises";

import {
  mergeImportedJobData,
  parseIndeedJobHtml,
  parseLinkedInJobHtml,
  parseJobPostingHtml,
  parsePastedJobText,
} from "@/features/job-import/parser";
import type { JobImportResponse } from "@/features/job-import/types";
import {
  isIndeedHost,
  isLinkedInHost,
  normalizeJobUrl,
} from "@/features/job-import/url";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxTextLength = 20_000;
const maxHtmlBytes = 1_500_000;
const maxDescriptionLength = 5_000;

function jobImportResponse(payload: JobImportResponse, init?: ResponseInit) {
  return Response.json(payload, init);
}

function isPrivateAddress(address: string) {
  const normalized = address.toLowerCase();
  const mappedIpv4 = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/u)?.[1];
  if (mappedIpv4) return isPrivateAddress(mappedIpv4);
  if (normalized.includes(":")) {
    return (
      normalized === "::" ||
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      /^fe[89ab]/u.test(normalized) ||
      normalized.startsWith("ff") ||
      normalized.startsWith("2001:db8")
    );
  }
  const parts = normalized.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part)))
    return false;
  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    parts[0] === 0 ||
    parts[0] >= 224 ||
    (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 0) ||
    (parts[0] === 192 && parts[1] === 168) ||
    (parts[0] === 198 && parts[1] >= 18 && parts[1] <= 19)
  );
}

async function validatePublicUrl(rawUrl: string, normalizeJob = true) {
  const candidate = /^https?:\/\//iu.test(rawUrl)
    ? rawUrl
    : `https://${rawUrl}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("Introduz um endereço válido para a vaga.");
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error("Introduz um endereço HTTP ou HTTPS válido.");
  }
  if (
    !url.hostname.includes(".") ||
    url.hostname === "localhost" ||
    url.hostname.endsWith(".local")
  ) {
    throw new Error("Esse endereço não pode ser consultado.");
  }

  if (normalizeJob) url = normalizeJobUrl(url);

  const addresses = isIP(url.hostname)
    ? [url.hostname]
    : [
        ...(await resolve4(url.hostname).catch(() => [])),
        ...(await resolve6(url.hostname).catch(() => [])),
      ];
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) {
    throw new Error("Não foi possível confirmar o endereço da vaga.");
  }
  return url;
}

async function readLimitedText(response: Response) {
  const declaredLength = Number(response.headers.get("content-length") ?? "0");
  if (declaredLength > maxHtmlBytes)
    throw new Error("A página da vaga é demasiado grande.");
  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxHtmlBytes) {
      await reader.cancel();
      throw new Error("A página da vaga é demasiado grande.");
    }
    result += decoder.decode(value, { stream: true });
  }
  return result + decoder.decode();
}

async function fetchJobPage(initialUrl: URL, allowLinkedIn = false) {
  let current = initialUrl;
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const response = await fetch(current, {
      cache: "no-store",
      redirect: "manual",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.7",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8_000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirects === 3)
        throw new Error("A página redirecionou demasiadas vezes.");
      current = await validatePublicUrl(
        new URL(location, current).toString(),
        false,
      );
      if (!allowLinkedIn && isLinkedInHost(current.hostname.toLowerCase())) {
        throw new Error(
          "O LinkedIn só pode ser analisado através do texto colado.",
        );
      }
      continue;
    }
    if (!response.ok)
      throw new Error("O site não permitiu consultar esta vaga.");
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html"))
      throw new Error("O endereço não corresponde a uma página HTML.");
    return {
      html: await readLimitedText(response),
      finalUrl: current.toString(),
    };
  }
  throw new Error("Não foi possível abrir a página da vaga.");
}

function indeedImportUrl(url: URL) {
  const jobKey = url.searchParams.get("jk");
  if (!jobKey) return url;

  const importUrl = new URL(`https://${url.hostname}/m/basecamp/viewjob`);
  importUrl.searchParams.set("viewtype", "embedded");
  importUrl.searchParams.set("jk", jobKey);
  return importUrl;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims?.sub) {
    return jobImportResponse(
      { message: "A tua sessão expirou. Volta a iniciar sessão." },
      { status: 401 },
    );
  }

  let payload: { url?: unknown; text?: unknown };
  try {
    payload = (await request.json()) as { url?: unknown; text?: unknown };
  } catch {
    return jobImportResponse(
      { message: "O pedido não é válido." },
      { status: 400 },
    );
  }
  const rawUrl = typeof payload.url === "string" ? payload.url.trim() : "";
  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  if (!rawUrl && !text) {
    return jobImportResponse(
      { message: "Introduz o link ou cola o texto da vaga." },
      { status: 400 },
    );
  }
  if (rawUrl.length > 4_000 || text.length > maxTextLength) {
    return jobImportResponse(
      { message: "O link ou o texto ultrapassa o tamanho permitido." },
      { status: 400 },
    );
  }

  try {
    const url = rawUrl ? await validatePublicUrl(rawUrl) : null;
    const normalizedUrl = url?.toString() ?? "";
    const textData = text ? parsePastedJobText(text, normalizedUrl) : null;
    let pageData = null;
    const warnings: string[] = [];

    if (url && isLinkedInHost(url.hostname.toLowerCase())) {
      try {
        const page = await fetchJobPage(url, true);
        pageData = parseLinkedInJobHtml(page.html, page.finalUrl);
        if (!pageData) {
          warnings.push(
            "A estrutura pública do LinkedIn não foi reconhecida; revê os dados extraídos do texto.",
          );
        } else {
          warnings.push(
            "Dados obtidos da página pública do LinkedIn. Confirma sempre a modalidade e a descrição.",
          );
        }
      } catch (error) {
        if (!text) throw error;
        warnings.push(
          "O LinkedIn não permitiu a leitura pública; foram usados os dados do texto.",
        );
      }
    } else if (url) {
      try {
        const indeed = isIndeedHost(url.hostname.toLowerCase());
        const page = await fetchJobPage(indeed ? indeedImportUrl(url) : url);
        pageData = indeed
          ? parseIndeedJobHtml(page.html, page.finalUrl)
          : parseJobPostingHtml(page.html, page.finalUrl);
        if (!pageData)
          warnings.push(
            "O site não publicou dados estruturados; revê os campos extraídos do texto.",
          );
      } catch (error) {
        if (!text) {
          if (isIndeedHost(url.hostname.toLowerCase())) {
            throw new Error(
              "O Indeed não permitiu a leitura automática desta vaga. Podes manter o link e colar também o texto do anúncio.",
            );
          }
          throw error;
        }
        warnings.push(
          "O site não permitiu a importação automática; foram usados os dados do texto.",
        );
      }
    }

    const importedData = mergeImportedJobData(
      pageData,
      textData,
      normalizedUrl,
    );
    const descriptionLength = importedData.description.length;
    const data =
      descriptionLength > maxDescriptionLength
        ? {
            ...importedData,
            description: importedData.description.slice(
              0,
              maxDescriptionLength,
            ),
          }
        : importedData;
    if (descriptionLength > maxDescriptionLength) {
      warnings.push(
        `A descrição original tinha ${descriptionLength.toLocaleString("pt-PT")} caracteres. Foram mantidos os primeiros ${maxDescriptionLength.toLocaleString("pt-PT")} para respeitar o limite da candidatura.`,
      );
    }
    if (!data.title && !data.companyName && !data.description) {
      return jobImportResponse(
        {
          message:
            "Não foi possível reconhecer os dados. Cola também o texto completo da vaga.",
        },
        { status: 422 },
      );
    }
    return jobImportResponse({ data, warnings });
  } catch (error) {
    return jobImportResponse(
      {
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível importar a vaga.",
      },
      { status: 422 },
    );
  }
}
