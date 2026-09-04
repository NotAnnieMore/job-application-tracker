import { getTranslations } from "next-intl/server";
import { ListX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

export default async function ActionNotFound() {
  const t = await getTranslations("Tasks");
  return (
    <>
      <title>{t("notFoundMetadata")}</title>
      <EmptyState
        icon={ListX}
        title={t("notFound")}
        description={t("notFoundDescription")}
        actionLabel={t("back")}
        actionHref="/acoes"
        headingLevel="h1"
      />
    </>
  );
}
