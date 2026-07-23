import Link from "next/link";
import { notFound } from "next/navigation";
import { GaleriaPlaceholder } from "@/components/GaleriaPlaceholder";
import { getConfiguracoesSite } from "@/data/configuracoes";
import { getRoteiroPorSlug, proximaVagaDisponivel } from "@/data/roteiros";
import { formatarData, formatarPreco } from "@/lib/format";

export default async function RoteiroDetalhe({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [roteiro, configuracoes] = await Promise.all([
    getRoteiroPorSlug(slug),
    getConfiguracoesSite(),
  ]);

  if (!roteiro) {
    notFound();
  }

  const vagasOrdenadas = [...roteiro.vagas].sort((a, b) =>
    a.data.localeCompare(b.data),
  );
  const vagasDisponiveis = vagasOrdenadas.filter(
    (vaga) => vaga.status === "aberta" && vaga.vagas_disponiveis > 0,
  );
  const vagaMaisBarata = proximaVagaDisponivel(roteiro.vagas);

  // Destino do botão de reserva (usado tanto na barra fixa do mobile
  // quanto no card lateral do desktop - mesma decisão, só muda onde
  // aparece). Na referência (Claude Design / Airbnb Experiences) cada
  // roteiro tem uma única data, então o botão sempre leva pro mesmo
  // lugar - aqui um roteiro pode ter várias vagas (datas) com preços
  // diferentes, então: se só existe uma data disponível, o botão já
  // leva direto pro checkout dela (sem ambiguidade); se existem várias,
  // ele rola até a lista de datas pra a pessoa escolher, em vez de eu
  // decidir qual comprar.
  const cta =
    vagasDisponiveis.length === 1
      ? {
          href: `/roteiros/${roteiro.slug}/checkout?vaga=${vagasDisponiveis[0].id}`,
          label: "Reservar vaga",
        }
      : { href: "#datas", label: "Ver datas disponíveis" };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-8 pb-32 md:pb-8">
      <Link href="/" className="text-sm text-zinc-600 dark:text-zinc-400">
        ← Voltar
      </Link>

      {/* Duas colunas a partir do md, inspirado na estrutura do Airbnb
          Experiences (conteúdo + card de reserva sticky ao lado) -
          mantendo nossa paleta/tipografia, não o visual deles. */}
      <div className="md:grid md:grid-cols-[1fr_320px] md:items-start md:gap-10">
        <div className="flex flex-col gap-6">
          <GaleriaPlaceholder />

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">{roteiro.nome}</h1>

            {/* Nota/contagem de avaliação ainda placeholder - igual aos
                depoimentos da Home, não existe campo de nota por roteiro
                no banco. */}
            <div className="font-body flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <span className="text-ocre text-base leading-none">★</span>
              4,9
              <span className="font-normal text-zinc-500 dark:text-zinc-500">
                (128 avaliações)
              </span>
            </div>

            {roteiro.descricao && (
              <p className="text-zinc-600 dark:text-zinc-400">
                {roteiro.descricao}
              </p>
            )}
          </div>

          {roteiro.pdf_url ? (
            <a
              href={roteiro.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium underline"
            >
              Ver roteiro em PDF
            </a>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Roteiro em PDF em breve.
            </p>
          )}

          <div className="border-verde-mata/20 bg-verde-mata/5 flex items-start gap-3 rounded-lg border p-4">
            <span className="text-verde-mata dark:text-pedra-sabao mt-0.5 text-lg leading-none">
              ✓
            </span>
            <div>
              <div className="font-display text-verde-mata dark:text-pedra-sabao text-sm font-semibold uppercase tracking-wide">
                Cancelamento flexível
              </div>
              <p className="font-body mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                {configuracoes?.cancelamento_texto ??
                  "Consulte nossa política de cancelamento."}
              </p>
            </div>
          </div>

          <div id="datas" className="flex scroll-mt-8 flex-col gap-3">
            <h2 className="font-semibold">Datas disponíveis</h2>

            {vagasOrdenadas.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">
                Nenhuma data cadastrada no momento.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {vagasOrdenadas.map((vaga) => {
                  const esgotada =
                    vaga.status !== "aberta" || vaga.vagas_disponiveis <= 0;

                  return (
                    <li
                      key={vaga.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatarData(vaga.data)}
                        </span>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {formatarPreco(vaga.preco)}
                          {!esgotada &&
                            ` · ${vaga.vagas_disponiveis} vaga(s) disponível(is)`}
                        </span>
                      </div>

                      {esgotada ? (
                        <button
                          type="button"
                          disabled
                          className="rounded-full px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
                        >
                          Esgotado
                        </button>
                      ) : (
                        <Link
                          href={`/roteiros/${roteiro.slug}/checkout?vaga=${vaga.id}`}
                          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
                        >
                          Comprar
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Card lateral sticky - só no desktop. Mesmo preço/CTA da barra
            fixa do mobile abaixo, sem recalcular nada. */}
        <aside className="hidden md:sticky md:top-8 md:block">
          <div className="border-verde-mata/15 bg-pedra-sabao flex flex-col gap-4 rounded-2xl border p-6 shadow-[0_10px_26px_rgba(116,124,109,0.1)] dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <div className="font-body text-[11px] tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                A partir de
              </div>
              <div className="font-display text-verde-mata dark:text-pedra-sabao text-2xl font-semibold">
                {vagaMaisBarata ? formatarPreco(vagaMaisBarata.preco) : "—"}
              </div>
            </div>

            {!vagaMaisBarata ? (
              <div className="font-display w-full cursor-not-allowed rounded-xl bg-zinc-200 py-4 text-center text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:bg-zinc-800 dark:text-zinc-500">
                Esgotado
              </div>
            ) : (
              <Link
                href={cta.href}
                className="font-display bg-terracota hover:bg-terracota/90 text-pedra-sabao w-full rounded-xl py-4 text-center text-sm font-semibold tracking-wide uppercase transition-colors"
              >
                {cta.label}
              </Link>
            )}
          </div>
        </aside>
      </div>

      {/* Barra fixa - só no mobile, o card lateral acima cobre o desktop. */}
      <div className="border-zinc-200 bg-pedra-sabao fixed inset-x-0 bottom-0 z-20 flex items-center gap-4 border-t px-6 py-4 shadow-[0_-8px_22px_rgba(0,0,0,0.08)] md:hidden dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex-none">
          <div className="font-body text-[11px] tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            A partir de
          </div>
          <div className="font-display text-verde-mata dark:text-pedra-sabao text-xl font-semibold">
            {vagaMaisBarata ? formatarPreco(vagaMaisBarata.preco) : "—"}
          </div>
        </div>

        {!vagaMaisBarata ? (
          <div className="font-display flex-1 cursor-not-allowed rounded-xl bg-zinc-200 py-4 text-center text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:bg-zinc-800 dark:text-zinc-500">
            Esgotado
          </div>
        ) : (
          <Link
            href={cta.href}
            className="font-display bg-terracota hover:bg-terracota/90 text-pedra-sabao flex-1 rounded-xl py-4 text-center text-sm font-semibold tracking-wide uppercase transition-colors"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </div>
  );
}
