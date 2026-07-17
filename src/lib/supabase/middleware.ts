import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Atualiza a sessão do Supabase e expõe o usuário autenticado + o client
 * usado, pra quem chamar poder tomar decisões adicionais (ex: guarda de
 * rota) sem duplicar a lógica de refresh de cookies.
 *
 * `box` é um wrapper mutável em vez de retornar `response` direto: o
 * client do Supabase mantém um closure sobre `box.response` (igual ao
 * padrão já usado aqui antes), então chamadas feitas DEPOIS que esta
 * função retornar (ex: `supabase.auth.signOut()` no proxy) continuam
 * atualizando o mesmo objeto - basta ler `box.response` de novo no final.
 */
export async function updateSession(request: NextRequest) {
  const box = { response: NextResponse.next({ request }) };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          box.response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            box.response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Mantém a sessão do Supabase renovada; necessário para que Server
  // Components tenham acesso a um usuário autenticado válido.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { box, user, supabase };
}
