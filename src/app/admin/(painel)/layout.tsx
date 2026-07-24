import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminPainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
