import { PageSkeleton } from "@/components/shared/page-skeleton";
import { getTranslations } from "next-intl/server";

export default async function InterviewsLoading() {
  const t = await getTranslations("Interviews");
  return <PageSkeleton title={t("title")} description={t("description")} />;
}
