"use server";

import { cookies } from "next/headers";

import { isAppLocale, localeCookieName } from "@/i18n/config";

export async function setLocaleAction(locale: string) {
  if (!isAppLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
