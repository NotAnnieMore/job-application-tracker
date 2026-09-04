import { PageSkeleton } from "@/components/shared/page-skeleton";
import { getTranslations } from "next-intl/server";

export default async function ApplicationsLoading() {
  const t = await getTranslations("Applications");
  return <PageSkeleton title={t("title")} description={t("description")} />;
}
