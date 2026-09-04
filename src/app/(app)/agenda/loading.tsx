import { getTranslations } from "next-intl/server";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export default async function AgendaLoading() {
  const t = await getTranslations("Agenda");
  return <PageSkeleton title={t("title")} description={t("description")} />;
}
