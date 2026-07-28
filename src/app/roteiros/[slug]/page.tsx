import Link from "next/link";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/BackButton";
import { GaleriaPlaceholder } from "@/components/GaleriaPlaceholder";
import { GlobalNav } from "@/components/GlobalNav";
import { getConfiguracoesSite } from "@/data/configuracoes";
import { getRoteiroPorSlug, proximaVagaDisponivel } from "@/data/roteiros";
import { formatarData, formatarPreco } from "@/lib/format";

// Ícones inline (stroke, sem lib externa) - mesmo padrão usado em
// GlobalNav.tsx e na Home (page.tsx).
function IconeSetaDireita({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function IconeCalendario() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function IconeDownload() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />
    </svg>
  );
}

function IconeChama() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M12 22c4-1 6-4 6-8 0-2-1-4-2-5 0 2-1 3-2 3 .5-3-1-6-4-8 0 3-1 5-3 7-1.5 1.5-2 3-2 5 0 3.5 2.5 6 5 6" />
    </svg>
  );
}

// Mesmo conteúdo (Transporte/Guia credenciado/Seguro de aventura) e
// ícones já usados em "O que está incluso" na Home (src/app/page.tsx) -
// repetido aqui em vez de extraído pra um componente compartilhado, já
// que a Home está fora do escopo desta etapa (só o markup se repete, o
// conteúdo é idêntico).
const ITENS_INCLUSOS = [
  {
    titulo: "Transporte",
    texto:
      "Ida e volta inclusas no valor do roteiro, saindo do ponto de encontro combinado.",
    Icone: function IconeBus() {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="12" rx="2" />
          <path d="M3 13h18" />
          <circle cx="7.5" cy="19" r="1.5" />
          <circle cx="16.5" cy="19" r="1.5" />
        </svg>
      );
    },
  },
  {
    titulo: "Guia credenciado",
    texto:
      "Guia credenciado acompanha o grupo do início ao fim, garantindo segurança e boas indicações no caminho.",
    Icone: function IconeCompass() {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M14.5 9.5l-2 5-5 2 2-5z" />
        </svg>
      );
    },
  },
  {
    titulo: "Seguro de aventura",
    texto:
      "Cobertura de seguro de aventura para todos os participantes durante o roteiro.",
    Icone: function IconeShieldCheck() {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    },
  },
] as const;

// Mesma linguagem de RoteiroCard.tsx (textoDisponibilidade), duplicada
// localmente já que a função de lá não é exportada.
function textoVagasRestantes(quantidade: number) {
  return quantidade > 5
    ? `${quantidade} vagas disponíveis`
    : `Só restam ${quantidade} vagas`;
}

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

  // Receptivo não usa o sistema de vagas (roteiro.vagas vem sempre
  // vazio pra esse tipo) - preço é o fixo cadastrado e o CTA leva pro
  // WhatsApp em vez de reservar uma vaga específica.
  const isReceptivo = roteiro.tipo === "receptivo";

  const precoExibido = isReceptivo
    ? roteiro.preco_receptivo
    : (vagaMaisBarata?.preco ?? null);

  const mensagemWhatsapp = encodeURIComponent(
    `Olá! Quero saber mais sobre o roteiro ${roteiro.nome}.`,
  );
  const whatsappHref = `https://wa.me/553184743523?text=${mensagemWhatsapp}`;

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

  // Conteúdo do card de reserva (preço, data, CTA, PDF, vagas) -
  // compartilhado entre o aside sticky do desktop e a barra fixa do
  // mobile (essa última fica só com preço+CTA, ver JSX abaixo).
  const mostrarLinhaData = !isReceptivo && vagaMaisBarata !== null;

  return (
    <>
      <GlobalNav />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-8 pb-32 md:pb-8">
        <BackButton href="/roteiros" />

        {/* Duas colunas a partir do md, inspirado na estrutura do Airbnb
            Experiences (conteúdo + card de reserva sticky ao lado) -
            mantendo nossa paleta/tipografia, não o visual deles. */}
        <div className="md:grid md:grid-cols-[1fr_320px] md:items-start md:gap-10">
          <div className="flex flex-col gap-6">
            <GaleriaPlaceholder />

            <div className="flex flex-col gap-2">
              <h1 className="font-display text-verde-mata text-2xl font-extrabold tracking-tight sm:text-3xl">
                {roteiro.nome}
              </h1>

              {roteiro.descricao && (
                <p className="font-body text-verde-mata/70">
                  {roteiro.descricao}
                </p>
              )}
            </div>

            <div className="border-verde-mata/20 bg-verde-mata/5 flex items-start gap-3 rounded-2xl border p-4">
              <span className="text-verde-mata mt-0.5 text-lg leading-none">
                ✓
              </span>
              <div>
                <div className="font-display text-verde-mata text-sm font-semibold uppercase tracking-wide">
                  Cancelamento flexível
                </div>
                <p className="font-body text-verde-mata/70 mt-0.5 text-sm">
                  {configuracoes?.cancelamento_texto ??
                    "Consulte nossa política de cancelamento."}
                </p>
              </div>
            </div>

            {isReceptivo ? (
              <div className="flex flex-col gap-3">
                <h2 className="font-display text-verde-mata text-xl font-extrabold tracking-tight">
                  Data e grupo sob consulta
                </h2>
                <p className="font-body text-verde-mata/70">
                  Esse roteiro não tem vagas ou datas fixas - fale com a gente
                  pelo WhatsApp pra combinar data, tamanho do grupo e valor.
                </p>
              </div>
            ) : (
              <div id="datas" className="flex scroll-mt-8 flex-col gap-3">
                <h2 className="font-display text-verde-mata text-xl font-extrabold tracking-tight">
                  Datas disponíveis
                </h2>

                {vagasOrdenadas.length === 0 ? (
                  <p className="font-body text-verde-mata/70">
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
                          className="border-pedra-sabao flex items-center justify-between gap-3 rounded-2xl border p-4"
                        >
                          <div className="font-body flex flex-col">
                            <span className="font-semibold">
                              {formatarData(vaga.data)}
                            </span>
                            <span className="text-verde-mata/70 text-sm">
                              {formatarPreco(vaga.preco)}
                              {!esgotada &&
                                ` · ${vaga.vagas_disponiveis} vaga(s) disponível(is)`}
                            </span>
                          </div>

                          {esgotada ? (
                            <button
                              type="button"
                              disabled
                              className="font-display bg-pedra-sabao text-verde-mata/50 shrink-0 cursor-not-allowed rounded-2xl px-4 py-2 text-xs font-semibold tracking-wide uppercase"
                            >
                              Esgotado
                            </button>
                          ) : (
                            <Link
                              href={`/roteiros/${roteiro.slug}/checkout?vaga=${vaga.id}`}
                              className="font-display bg-terracota hover:bg-terracota/90 text-pedra-sabao shrink-0 rounded-2xl px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-colors"
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
            )}

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-verde-mata text-xl font-extrabold tracking-tight">
                O que está incluso
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {ITENS_INCLUSOS.map(({ titulo, texto, Icone }) => (
                  <div key={titulo} className="flex items-center gap-3">
                    <div className="bg-pedra-sabao text-verde-mata flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
                      <Icone />
                    </div>
                    <div>
                      <div className="font-body text-sm font-bold">
                        {titulo}
                      </div>
                      <div className="font-body text-verde-mata/60 text-xs">
                        {texto}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card lateral sticky - só no desktop. Preço, divisor, linha
              de Data (quando existe uma vaga futura pra mostrar), CTA
              primário, botão secundário de PDF (escondido se pdf_url
              for null) e indicador de vagas restantes. */}
          <aside className="hidden md:sticky md:top-8 md:block">
            <div className="border-pedra-sabao bg-ocre flex flex-col rounded-2xl border p-6 shadow-[0_10px_26px_rgba(94,110,79,0.1)]">
              <span className="font-body text-verde-mata/60 text-xs font-semibold tracking-wide uppercase">
                A partir de
              </span>
              <div className="font-display text-verde-mata text-3xl font-extrabold">
                {precoExibido != null ? formatarPreco(precoExibido) : "—"}
              </div>
              <span className="font-body text-verde-mata/60 text-xs font-semibold">
                por pessoa
              </span>

              {mostrarLinhaData && vagaMaisBarata && (
                <div className="border-pedra-sabao my-4 flex items-center gap-3 border-y py-4">
                  <IconeCalendario />
                  <div>
                    <div className="font-body text-verde-mata/60 text-xs font-semibold">
                      Data
                    </div>
                    <div className="font-body text-sm font-bold">
                      {formatarData(vagaMaisBarata.data)}
                    </div>
                  </div>
                </div>
              )}

              <div className={mostrarLinhaData ? "" : "mt-4"}>
                {isReceptivo ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display bg-terracota hover:bg-terracota/90 text-pedra-sabao flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-center text-sm font-semibold tracking-wide uppercase transition-colors"
                  >
                    Falar no WhatsApp
                  </a>
                ) : !vagaMaisBarata ? (
                  <div className="font-display bg-pedra-sabao text-verde-mata/50 w-full cursor-not-allowed rounded-2xl py-4 text-center text-sm font-semibold tracking-wide uppercase">
                    Esgotado
                  </div>
                ) : (
                  <Link
                    href={cta.href}
                    className="font-display bg-terracota hover:bg-terracota/90 text-pedra-sabao flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-center text-sm font-semibold tracking-wide uppercase transition-colors"
                  >
                    {cta.label} <IconeSetaDireita className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {roteiro.pdf_url && (
                <a
                  href={roteiro.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display border-pedra-sabao text-verde-mata hover:bg-pedra-sabao/30 mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-center text-sm font-semibold transition-colors"
                >
                  <IconeDownload /> Baixar roteiro em PDF
                </a>
              )}

              {!isReceptivo && vagaMaisBarata && (
                <div className="text-terracota mt-4 flex items-center justify-center gap-2 text-xs font-semibold">
                  <IconeChama />
                  {textoVagasRestantes(vagaMaisBarata.vagas_disponiveis)}
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Barra fixa - só no mobile, o card lateral acima cobre o
            desktop. Fica minimal (preço + CTA), sem os itens extras do
            card completo (data/PDF/vagas), pra não virar uma barra alta
            sobrepondo boa parte da tela num espaço pensado pra ser
            compacto. */}
        <div className="border-pedra-sabao bg-ocre fixed inset-x-0 bottom-0 z-20 flex items-center gap-4 border-t px-6 py-4 shadow-[0_-8px_22px_rgba(0,0,0,0.08)] md:hidden">
          <div className="flex-none">
            <div className="font-body text-verde-mata/60 text-[11px] font-semibold tracking-wide uppercase">
              A partir de
            </div>
            <div className="font-display text-verde-mata text-xl font-semibold">
              {precoExibido != null ? formatarPreco(precoExibido) : "—"}
            </div>
          </div>

          {isReceptivo ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display bg-terracota hover:bg-terracota/90 text-pedra-sabao flex-1 rounded-2xl py-4 text-center text-sm font-semibold tracking-wide uppercase transition-colors"
            >
              Falar no WhatsApp
            </a>
          ) : !vagaMaisBarata ? (
            <div className="font-display bg-pedra-sabao text-verde-mata/50 flex-1 cursor-not-allowed rounded-2xl py-4 text-center text-sm font-semibold tracking-wide uppercase">
              Esgotado
            </div>
          ) : (
            <Link
              href={cta.href}
              className="font-display bg-terracota hover:bg-terracota/90 text-pedra-sabao flex-1 rounded-2xl py-4 text-center text-sm font-semibold tracking-wide uppercase transition-colors"
            >
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
