import { getTranslations } from "next-intl/server";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export default async function CompaniesLoading() {
  const t = await getTranslations("Companies");
  return <PageSkeleton title={t("title")} description={t("description")} />;
}
