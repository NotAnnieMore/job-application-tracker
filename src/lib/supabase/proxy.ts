import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database.types";

const PUBLIC_ROUTES = new Set([
  "/login",
  "/registo",
  "/recuperar-password",
  "/api/health",
]);

function copyAuthState(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));

  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(header);
    if (value) target.headers.set(header, value);
  }

  return target;
}

function authRedirect(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return copyAuthState(response, NextResponse.redirect(url));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseConfig();
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headersToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        Object.entries(headersToSet).forEach(([name, value]) =>
          supabaseResponse.headers.set(name, value),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);
  const pathname = request.nextUrl.pathname;
  const isAuthCallback = pathname.startsWith("/auth/");
  const isPasswordUpdate = pathname === "/atualizar-password";
  const isPublicRoute = PUBLIC_ROUTES.has(pathname) || isAuthCallback;
  const isPublicAuthEntry =
    pathname === "/login" ||
    pathname === "/registo" ||
    pathname === "/recuperar-password";

  if (!isAuthenticated && !isPublicRoute && !isPasswordUpdate) {
    return authRedirect(request, supabaseResponse, "/login");
  }

  if (!isAuthenticated && isPasswordUpdate) {
    return authRedirect(request, supabaseResponse, "/recuperar-password");
  }

  if (isAuthenticated && isPublicAuthEntry) {
    return authRedirect(request, supabaseResponse, "/dashboard");
  }

  return supabaseResponse;
}
