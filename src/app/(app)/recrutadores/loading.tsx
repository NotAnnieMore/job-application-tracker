import { getTranslations } from "next-intl/server";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export default async function RecruitersLoading() {
  const t = await getTranslations("Recruiters");
  return <PageSkeleton title={t("title")} description={t("description")} />;
}
