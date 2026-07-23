import { getConfiguracoesSite } from "@/data/configuracoes";

// Usado na Home, Termos e Política de reembolso. Só a Home tem o
// WhatsAppFloatButton, mas ele já se esconde sozinho quando o rodapé
// entra na tela (IntersectionObserver em WhatsAppFloatButton.tsx) - não
// depende mais de um padding-bottom extra aqui pra não sobrepor. Um
// padding de largura total calibrado pro botão (que só ocupa um
// cantinho de 56px na ponta direita) sempre deixava uma faixa de
// espaço em branco vazio do lado esquerdo - medido em produção: mesmo
// com a folga "certa" pro pior caso, o texto já encostava no botão com
// margem zero, e ainda sobrava espaço em branco visível ao lado.
export async function Footer() {
  const configuracoes = await getConfiguracoesSite();

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-8 py-8 text-center">
        <div className="font-body flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <span>
            {configuracoes?.stats_seguidores_instagram ?? "—"} seguidores no
            Instagram
          </span>
          <span
            aria-hidden="true"
            className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"
          />
          <span>
            {configuracoes?.stats_roteiros_realizados ?? "—"} roteiros
            realizados
          </span>
          <span
            aria-hidden="true"
            className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"
          />
          <span>
            avaliação média {configuracoes?.stats_avaliacao_media ?? "—"}
          </span>
        </div>
        <p className="font-body text-xs text-zinc-500 dark:text-zinc-500">
          Cadastur {configuracoes?.cadastur_numero ?? "—"}
        </p>
      </div>
    </footer>
  );
}
