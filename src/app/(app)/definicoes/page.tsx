import { ProfileForm } from "@/components/profile/profile-form";
import { PageHeader } from "@/components/shared/page-header";
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
      {notice ? (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {notice}
        </p>
      ) : null}
      <ProfileForm
        key={`${user.fullName}-${user.avatarUrl}`}
        fullName={user.fullName}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />
    </div>
  );
}
