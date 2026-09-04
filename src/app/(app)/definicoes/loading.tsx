import { PageSkeleton } from "@/components/shared/page-skeleton";
import { getTranslations } from "next-intl/server";

export default async function SettingsLoading() {
  const t = await getTranslations("Settings");
  return <PageSkeleton title={t("title")} description={t("description")} />;
}
