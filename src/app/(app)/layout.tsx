import { AppShell } from "@/components/layout/app-shell";
import { requireCurrentUser } from "@/lib/auth/session";

export default async function PrivateAreaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireCurrentUser();

  return <AppShell user={user}>{children}</AppShell>;
}
