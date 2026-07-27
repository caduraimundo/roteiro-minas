import Link from "next/link";
import { HeroCarousel } from "@/components/HeroCarousel";
import { GlobalNav } from "@/components/GlobalNav";
import { WhatsAppFloatButton } from "@/components/WhatsAppFloatButton";
import { FotoPlaceholder } from "@/components/FotoPlaceholder";
import { TexturaTopografica } from "@/components/TexturaTopografica";
import { Footer } from "@/components/Footer";
import { getRoteirosAtivos, proximaVagaDisponivel } from "@/data/roteiros";
import { formatarData, formatarPreco } from "@/lib/format";

// Mesmo número usado em WhatsAppFloatButton.tsx e RoteiroCard.tsx -
// roteiro receptivo não tem checkout online (preço/data combinados
// direto com a gente), então o CTA leva pra conversa em vez de vaga.
const NUMERO_WHATSAPP = "553184743523";

// Ícones inline (stroke, sem lib externa - mesmo padrão do hambúrguer em
// GlobalNav.tsx) pros 3 itens de "O que está incluso". Só o que tem
// lastro confirmado: transporte, guia credenciado e seguro de aventura.
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
          className="h-6 w-6"
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
          className="h-6 w-6"
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
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    },
  },
] as const;

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

export default async function Home() {
  const roteiros = await getRoteirosAtivos();

  // "Próximo roteiro" e contagem de vaga não fazem sentido pro tipo
  // receptivo (preço fixo, sem vagas) - por isso ele nunca entra no
  // destaque, tem seção própria ("Sob encomenda") logo abaixo. Destaque
  // mostra só os 3 primeiros (mesma ordem por nome de getRoteirosAtivos),
  // não a lista inteira - a agenda completa fica em /roteiros.
  const emissiveis = roteiros.filter((roteiro) => roteiro.tipo !== "receptivo");
  const receptivos = roteiros.filter((roteiro) => roteiro.tipo === "receptivo");
  const emDestaque = emissiveis.slice(0, 3);

  return (
    <>
      <div className="relative">
        <GlobalNav variant="transparente" />
        <HeroCarousel />
      </div>
      <WhatsAppFloatButton />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-14 p-8">
        <section className="flex flex-col gap-5">
          <div className="flex items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="font-body text-verde-mata/60 text-xs font-bold tracking-[0.14em] uppercase">
                Agenda aberta
              </span>
              <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Próximos roteiros em destaque
              </h2>
            </div>
            <Link
              href="/roteiros"
              className="font-body hover:text-terracota text-verde-mata flex shrink-0 items-center gap-1.5 pb-1 text-sm font-bold"
            >
              Ver todos <IconeSetaDireita />
            </Link>
          </div>

          {emDestaque.length === 0 ? (
            <p className="font-body text-verde-mata/70">
              Nenhum roteiro disponível no momento.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {emDestaque.map((roteiro) => {
                const vaga = proximaVagaDisponivel(roteiro.vagas);
                const esgotado = vaga === null;

                const conteudo = (
                  <>
                    <FotoPlaceholder className="aspect-[16/10] w-full rounded-2xl sm:aspect-auto sm:w-[300px] sm:rounded-2xl" />
                    <div className="flex flex-1 flex-col justify-center gap-2 p-6 sm:p-8">
                      {!esgotado && (
                        <span className="font-body text-verde-mata/60 flex items-center gap-1.5 text-sm font-semibold">
                          {formatarData(vaga.data)}
                        </span>
                      )}
                      <h3 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
                        {roteiro.nome}
                      </h3>
                      {roteiro.descricao && (
                        <p className="font-body text-verde-mata/70 line-clamp-2 max-w-lg text-sm sm:text-base">
                          {roteiro.descricao}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between gap-4">
                        {esgotado ? (
                          <span className="font-body text-sm font-semibold text-red-600">
                            Esgotado
                          </span>
                        ) : (
                          <>
                            <div>
                              <div className="font-display text-lg font-extrabold sm:text-xl">
                                {formatarPreco(vaga.preco)}
                              </div>
                              <div className="font-body text-verde-mata/60 text-xs font-semibold">
                                por pessoa
                              </div>
                            </div>
                            <span className="font-display bg-pedra-sabao text-verde-mata inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold tracking-wide uppercase">
                              Ver detalhes <IconeSetaDireita className="h-3.5 w-3.5" />
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                );

                if (esgotado) {
                  return (
                    <div
                      key={roteiro.id}
                      aria-disabled="true"
                      className="border-pedra-sabao bg-ocre flex cursor-not-allowed flex-col overflow-hidden rounded-2xl border opacity-60 grayscale sm:flex-row"
                    >
                      {conteudo}
                    </div>
                  );
                }

                return (
                  <Link
                    key={roteiro.id}
                    href={`/roteiros/${roteiro.slug}`}
                    className="border-pedra-sabao bg-ocre flex flex-col overflow-hidden rounded-2xl border transition-opacity hover:opacity-90 sm:flex-row"
                  >
                    {conteudo}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {receptivos.length > 0 && (
          <section className="bg-ocre/70 flex flex-col gap-5 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col gap-1">
              <span className="font-body text-terracota text-xs font-semibold tracking-[0.2em] uppercase">
                Sob encomenda
              </span>
              <h2 className="font-display text-2xl font-extrabold tracking-tight">
                Roteiros receptivos
              </h2>
              <p className="font-body text-verde-mata/70 max-w-2xl text-sm">
                Passeios personalizados pra grupos e agências, com data e
                valor combinados diretamente com a gente pelo WhatsApp.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {receptivos.map((roteiro) => {
                const mensagem = encodeURIComponent(
                  `Olá! Quero saber mais sobre o roteiro ${roteiro.nome}.`,
                );

                return (
                  // Link de "Ver detalhes" cobre o card inteiro (irmão
                  // do conteúdo, não ancestral) - o botão do WhatsApp
                  // fica por cima dele com pointer-events reativado,
                  // então clicar nele nunca aciona a navegação do Link.
                  // Evita <a> aninhado, que seria HTML inválido. Mesma
                  // técnica de RoteiroCard.tsx, adaptada pro card
                  // horizontal (imagem à esquerda, texto+CTA à direita).
                  <div
                    key={roteiro.id}
                    className="border-pedra-sabao bg-ocre relative flex flex-col overflow-hidden rounded-2xl border sm:flex-row"
                  >
                    <Link
                      href={`/roteiros/${roteiro.slug}`}
                      aria-label={`Ver detalhes de ${roteiro.nome}`}
                      className="absolute inset-0 z-0"
                    />
                    <div className="pointer-events-none flex flex-1 flex-col sm:flex-row">
                      <FotoPlaceholder className="aspect-[16/10] w-full rounded-2xl sm:aspect-auto sm:w-[300px] sm:rounded-2xl" />
                      <div className="flex flex-1 flex-col justify-center gap-2 p-6 sm:p-8">
                        <h3 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
                          {roteiro.nome}
                        </h3>
                        <span className="font-body text-verde-mata/70 text-sm">
                          Data e grupo combinados direto com a gente
                        </span>
                        <div className="mt-3 flex items-center justify-between gap-4">
                          <span className="font-display text-lg font-extrabold sm:text-xl">
                            {roteiro.preco_receptivo != null
                              ? `A partir de ${formatarPreco(roteiro.preco_receptivo)}`
                              : "Consulte o valor"}
                          </span>
                          <a
                            href={`https://wa.me/${NUMERO_WHATSAPP}?text=${mensagem}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-display pointer-events-auto relative z-10 shrink-0 rounded-2xl bg-[#25D366] px-4 py-2.5 text-xs font-bold tracking-wide uppercase text-white transition-transform hover:scale-105"
                          >
                            Falar no WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Divisor decorativo entre a agenda/sob-encomenda e "o que está
          incluso" - mesmo padrão h-12 usado nas outras páginas. */}
      <div className="relative h-12 w-full">
        <TexturaTopografica variant="divisor" />
      </div>

      <section
        id="incluso"
        className="bg-pedra-sabao/40 scroll-mt-24 border-y border-pedra-sabao"
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 p-8 py-16">
          <div className="mx-auto flex max-w-xl flex-col gap-2 text-center">
            <span className="font-body text-verde-mata/60 text-xs font-bold tracking-[0.14em] uppercase">
              Tudo resolvido
            </span>
            <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              O que está incluso
            </h2>
            <p className="font-body text-verde-mata/70 mt-1 text-sm sm:text-base">
              Você chega, embarca e aproveita. Cada roteiro já vem com o
              essencial para uma experiência segura e tranquila.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {ITENS_INCLUSOS.map(({ titulo, texto, Icone }) => (
              <div
                key={titulo}
                className="bg-ocre border-pedra-sabao flex flex-col gap-3 rounded-2xl border p-6"
              >
                <div className="bg-pedra-sabao text-verde-mata flex h-12 w-12 items-center justify-center rounded-2xl">
                  <Icone />
                </div>
                <h3 className="font-display text-lg font-bold">{titulo}</h3>
                <p className="font-body text-verde-mata/70 text-sm">
                  {texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
