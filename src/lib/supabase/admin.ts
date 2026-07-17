// ATENÇÃO: client com privilégio de service role - bypassa RLS e tem acesso
// total ao banco. NUNCA importar este arquivo em Client Components ou em
// qualquer arquivo com "use client" - a service role key não pode chegar
// no bundle do browser. Uso restrito a código server-side que precisa
// chamar funções sem grant público (ex: buscar_dados_ticket,
// marcar_ticket_enviado) - não usar pra mais nada além disso.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.",
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
