import { getConfiguracoesSite } from "@/data/configuracoes";

// Usado na Home, Termos e Política de reembolso - só a Home tem o
// WhatsAppFloatButton (fixed bottom-right, h-14 = 56px + bottom-6 =
// 24px de offset do fundo, então ocupa a faixa de 24px a 80px a partir
// do fim da tela). pb-20 (80px) no mobile é exatamente essa faixa - dá
// pra última linha nunca ficar atrás do botão, sem sobrar um bloco de
// espaço em branco maior que o necessário. Nas outras duas páginas esse
// espaço a mais é só uma folga inofensiva.
export async function Footer() {
  const configuracoes = await getConfiguracoesSite();

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-8 pt-8 pb-20 text-center sm:pb-10">
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
