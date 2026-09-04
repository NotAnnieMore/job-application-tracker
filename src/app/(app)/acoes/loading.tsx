import { getTranslations } from "next-intl/server";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export default async function ActionsLoading() {
  const t = await getTranslations("Tasks");
  return <PageSkeleton title={t("title")} description={t("description")} />;
}
