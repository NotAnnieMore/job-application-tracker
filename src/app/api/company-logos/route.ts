import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

type BrandfetchResult = {
  name?: unknown;
  domain?: unknown;
};

function normalizeDomain(value: string) {
  try {
    const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(candidate);

    if (!url.hostname.includes(".") || url.username || url.password)
      return null;
    return url.hostname.toLocaleLowerCase("en-US");
  } catch {
    return null;
  }
}

function logoUrl(domain: string, clientId: string) {
  const identifier = encodeURIComponent(domain);
  const credential = encodeURIComponent(clientId);
  return `https://cdn.brandfetch.io/domain/${identifier}/w/128/h/128/fallback/404/type/icon?c=${credential}`;
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const t = await getTranslations("CompanyLogoApi");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return Response.json({ message: t("sessionExpired") }, { status: 401 });
  }

  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (query.length < 2 || query.length > 120) {
    return Response.json({ message: t("queryLength") }, { status: 400 });
  }

  const clientId = process.env.BRANDFETCH_CLIENT_ID?.trim();

  if (!clientId) {
    return Response.json(
      {
        message: t("notConfigured"),
      },
      { status: 503 },
    );
  }

  try {
    const endpoint = `https://api.brandfetch.io/v2/search/${encodeURIComponent(query)}?c=${encodeURIComponent(clientId)}`;
    const response = await fetch(endpoint, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(7000),
    });

    if (response.status === 429) {
      return Response.json(
        {
          message: t("rateLimited"),
        },
        { status: 429 },
      );
    }

    if (!response.ok) {
      return Response.json({ message: t("serviceFailed") }, { status: 502 });
    }

    const payload = (await response.json()) as unknown;
    const rawResults: BrandfetchResult[] = Array.isArray(payload)
      ? payload
      : [];
    const seenDomains = new Set<string>();
    const results = rawResults.flatMap((result) => {
      if (
        typeof result.name !== "string" ||
        typeof result.domain !== "string"
      ) {
        return [];
      }

      const domain = normalizeDomain(result.domain);
      if (!domain || seenDomains.has(domain)) return [];
      seenDomains.add(domain);

      return [
        {
          name: result.name.trim() || domain,
          domain,
          website: `https://${domain}`,
          logoUrl: logoUrl(domain, clientId),
        },
      ];
    });

    return Response.json({ results: results.slice(0, 6) });
  } catch {
    return Response.json({ message: t("connectionFailed") }, { status: 502 });
  }
}
