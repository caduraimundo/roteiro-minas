import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";

// /admin não tem tela própria - só decide pra onde mandar quem chegar
// aqui. Mesma checagem de sessão/allowlist que as outras páginas do
// grupo fazem antes de qualquer redirect, pra não abrir uma exceção
// silenciosa só porque o destino também é um redirect.
export default async function AdminRoot() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email || !ADMIN_ALLOWLIST.includes(user.email)) {
    redirect("/admin/login");
  }

  redirect("/admin/dashboard");
}
