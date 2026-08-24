function isLinkedInHost(hostname: string) {
  return hostname === "linkedin.com" || hostname.endsWith(".linkedin.com");
}

function isIndeedHost(hostname: string) {
  return hostname === "indeed.com" || hostname.endsWith(".indeed.com");
}

function validLinkedInJobId(value: string | null) {
  return value?.match(/^\d{6,20}$/u)?.[0] ?? "";
}

function validIndeedJobKey(value: string | null) {
  return value?.match(/^[a-z0-9_-]{6,64}$/iu)?.[0] ?? "";
}

export function normalizeJobUrl(url: URL) {
  const hostname = url.hostname.toLowerCase();

  if (isLinkedInHost(hostname)) {
    const pathJobId = url.pathname.match(
      /^\/jobs\/view\/(?:[^/]*-)?(\d{6,20})(?:\/|$)/iu,
    )?.[1];
    const jobId =
      validLinkedInJobId(pathJobId ?? null) ||
      validLinkedInJobId(url.searchParams.get("currentJobId"));

    if (!jobId) {
      throw new Error(
        "No LinkedIn, seleciona uma vaga antes de copiar o link. O endereço deve incluir currentJobId ou /jobs/view/ID.",
      );
    }

    return new URL(`https://www.linkedin.com/jobs/view/${jobId}/`);
  }

  if (isIndeedHost(hostname)) {
    const jobKey =
      validIndeedJobKey(url.searchParams.get("jk")) ||
      validIndeedJobKey(url.searchParams.get("vjk"));

    if (!jobKey) {
      throw new Error(
        "No Indeed, abre ou seleciona uma vaga antes de copiar o link. O endereço deve incluir jk ou vjk.",
      );
    }

    const canonicalUrl = new URL(`https://${hostname}/viewjob`);
    canonicalUrl.searchParams.set("jk", jobKey);
    return canonicalUrl;
  }

  return url;
}

export { isIndeedHost, isLinkedInHost };
