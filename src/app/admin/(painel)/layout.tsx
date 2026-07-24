import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";

// Só busca o e-mail pra exibir no header - a checagem de sessão/allowlist
// em si já acontece no proxy (src/proxy.ts) antes de qualquer rota deste
// grupo ser alcançada, e cada página continua com sua própria reconfere
// (mesmo padrão de antes, não duplicado aqui).
export default async function AdminPainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <AdminShell email={user?.email ?? ""}>{children}</AdminShell>;
}
