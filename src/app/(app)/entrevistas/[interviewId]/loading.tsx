import { PageSkeleton } from "@/components/shared/page-skeleton";
import { getTranslations } from "next-intl/server";

export default async function InterviewDetailsLoading() {
  const t = await getTranslations("Interviews");
  return <PageSkeleton description={t("loadingDetails")} />;
}
