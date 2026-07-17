import { createClient } from "@/lib/supabase/server";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import type { User } from "@supabase/supabase-js";

export class AdminSessionError extends Error {}

/**
 * Confere sessão + allowlist - centraliza a checagem que toda rota
 * /api/admin/* precisa repetir, pra não esquecer numa rota nova. Lança
 * AdminSessionError se falhar; os handlers convertem isso em 401.
 * Não retorna o client de sessão - as queries de dado usam o
 * `service_role` (src/lib/supabase/admin.ts), já que essas tabelas não
 * têm SELECT público via RLS.
 */
export async function requireAdminSession(): Promise<{ user: User }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email || !ADMIN_ALLOWLIST.includes(user.email)) {
    throw new AdminSessionError("Sessão inválida ou e-mail não autorizado.");
  }

  return { user };
}
