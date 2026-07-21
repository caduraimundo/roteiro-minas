import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado a partir de um Server Component; ignorado quando há
            // um proxy responsável por atualizar a sessão.
          }
        },
      },
    },
  );
}
