import { CalendarX2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/shared/empty-state";

export default async function InterviewDetailsNotFound() {
  const t = await getTranslations("Interviews");
  return (
    <>
      <title>{t("notFoundMetadata")}</title>
      <EmptyState
        icon={CalendarX2}
        title={t("notFound")}
        description={t("notFoundDescription")}
        actionLabel={t("back")}
        actionHref="/entrevistas"
        headingLevel="h1"
      />
    </>
  );
}
