import { getTranslations } from "next-intl/server";
import { Users } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

export default async function RecruiterNotFound() {
  const t = await getTranslations("Recruiters");
  return (
    <>
      <title>{t("notFoundMetadata")}</title>
      <EmptyState
        icon={Users}
        title={t("notFound")}
        description={t("notFoundDescription")}
        actionLabel={t("back")}
        actionHref="/recrutadores"
        headingLevel="h1"
      />
    </>
  );
}
