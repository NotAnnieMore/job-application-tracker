import messages from "../../messages/en-GB.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: "pt-PT" | "en-GB";
    Messages: typeof messages;
  }
}
