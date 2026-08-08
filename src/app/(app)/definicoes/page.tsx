import { ProfileForm } from "@/components/profile/profile-form";
import { PageHeader } from "@/components/shared/page-header";
import { SuccessToast } from "@/components/shared/success-toast";
import { requireCurrentUser } from "@/lib/auth/session";

const notices: Record<string, string> = {
  "perfil-atualizado": "Perfil atualizado com sucesso.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string | string[] }>;
}) {
  const user = await requireCurrentUser();
  const status = (await searchParams).estado;
  const notice = typeof status === "string" ? notices[status] : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Definições"
        description="Gere os dados apresentados na tua conta."
      />
      <SuccessToast message={notice} />
      <ProfileForm
        key={`${user.fullName}-${user.avatarUrl}`}
        fullName={user.fullName}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />
    </div>
  );
}
