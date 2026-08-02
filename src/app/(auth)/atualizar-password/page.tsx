import { AuthShell } from "@/components/auth/auth-shell";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <AuthShell
      title="Definir nova palavra-passe"
      description="Escolhe uma nova palavra-passe para voltares a aceder à tua conta."
    >
      <UpdatePasswordForm />
    </AuthShell>
  );
}
