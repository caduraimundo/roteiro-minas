import { createClient } from "@/lib/supabase/server";

export type ConfiguracoesSite = {
  cadastur_numero: string | null;
  stats_seguidores_instagram: string | null;
  stats_roteiros_realizados: string | null;
  stats_avaliacao_media: string | null;
  cancelamento_texto: string | null;
};

/**
 * Mesma query de GET /api/configuracoes (tabela, colunas e client anon
 * idênticos) - direto aqui em vez de a Home fazer fetch da própria API:
 * não existe env var de URL base do site pra montar uma URL absoluta
 * num fetch server-side, e o padrão já estabelecido no projeto evita
 * chamada HTTP de servidor pra servidor quando dá pra consultar direto.
 */
export async function getConfiguracoesSite(): Promise<ConfiguracoesSite | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("configuracoes_site")
    .select(
      "cadastur_numero, stats_seguidores_instagram, stats_roteiros_realizados, stats_avaliacao_media, cancelamento_texto",
    )
    .single();

  if (error) {
    console.error("Erro ao buscar configurações do site:", error.message);
    return null;
  }

  return data;
}
