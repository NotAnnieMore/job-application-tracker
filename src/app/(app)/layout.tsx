import { AppShell } from "@/components/layout/app-shell";

export default function PrivateAreaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
