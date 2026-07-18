import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Troca o código pela sessão e redireciona pra /admin sempre que a troca
 * funcionar - sucesso ou fracasso da autorização não é mais decidido
 * aqui. A allowlist é checada de forma independente em proxy.ts (guarda
 * de rota) e na janela principal (src/app/admin/login/page.tsx), que
 * agora decide sucesso/negado com a sessão já criada, sem depender de
 * nada que a pop-up precise saber sobre si mesma (padrão do Roleon).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}/admin`);
    }
  }

  return NextResponse.redirect(`${origin}/admin/login`);
}
