import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import {
  isAppLocale,
  localeCookieName,
  localeFromAcceptLanguage,
} from "@/i18n/config";

const messages = {
  "pt-PT": () =>
    import("../../messages/pt-PT.json").then((module) => module.default),
  "en-GB": () =>
    import("../../messages/en-GB.json").then((module) => module.default),
};

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const requestedLocale = cookieStore.get(localeCookieName)?.value;
  const locale = isAppLocale(requestedLocale)
    ? requestedLocale
    : localeFromAcceptLanguage((await headers()).get("accept-language"));

  return {
    locale,
    messages: await messages[locale](),
    timeZone: "Europe/Lisbon",
  };
});
