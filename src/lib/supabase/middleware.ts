import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Fail fast: Supabase é dependência crítica aqui (auth + única fonte de
// dado do site) - sem fallback gracioso, só um erro claro o mais cedo
// possível em vez do erro genérico que a lib do Supabase daria lá na frente.
// A função (em vez de só `if` + `const`) existe porque o TS não propaga o
// narrowing de um `const` do escopo do módulo pra dentro de funções
// aninhadas - com o retorno tipado `string`, o closure abaixo recebe o
// tipo certo sem precisar de `!`.
function obrigatoria(valor: string | undefined, nome: string): string {
  if (!valor) {
    throw new Error(`${nome} ausente - verifique as env vars`);
  }
  return valor;
}

const supabaseUrl = obrigatoria(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "NEXT_PUBLIC_SUPABASE_URL",
);
const supabaseAnonKey = obrigatoria(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
);

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
    supabaseUrl,
    supabaseAnonKey,
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
