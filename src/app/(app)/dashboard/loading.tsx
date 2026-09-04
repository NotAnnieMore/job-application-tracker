import { PageSkeleton } from "@/components/shared/page-skeleton";
import { getTranslations } from "next-intl/server";

export default async function DashboardLoading() {
  const t = await getTranslations("Dashboard");
  return <PageSkeleton title={t("title")} description={t("description")} />;
}
