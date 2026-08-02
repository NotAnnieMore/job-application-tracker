import "server-only";

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    return new URL(configuredUrl).origin;
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL deve ser um URL absoluto, por exemplo http://localhost:3000.",
    );
  }
}
