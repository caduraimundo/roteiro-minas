import { getConfiguracoesSite } from "@/data/configuracoes";

// Mesmo conteúdo/estilo do rodapé já usado na Home (src/app/page.tsx) -
// extraído aqui pra reutilizar em páginas novas (Termos, Política de
// reembolso) sem duplicar a busca de configuracoes_site nem o JSX. A
// Home continua com o rodapé inline por enquanto, pra não misturar
// refactor com as páginas novas desta rodada.
export async function Footer() {
  const configuracoes = await getConfiguracoesSite();

  return (
    <footer className="border-t border-zinc-200 py-6 text-center dark:border-zinc-800">
      <p className="font-body text-xs text-zinc-500 dark:text-zinc-500">
        Cadastur {configuracoes?.cadastur_numero ?? "—"}
      </p>
      <p className="font-body text-xs text-zinc-500 dark:text-zinc-500">
        {configuracoes?.stats_seguidores_instagram ?? "—"} seguidores no
        Instagram · {configuracoes?.stats_roteiros_realizados ?? "—"}{" "}
        roteiros realizados · avaliação média{" "}
        {configuracoes?.stats_avaliacao_media ?? "—"}
      </p>
    </footer>
  );
}
