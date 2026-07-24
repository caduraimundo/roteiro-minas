import { BackButton } from "@/components/BackButton";
import { RoteiroCard } from "@/components/RoteiroCard";
import { GlobalNav } from "@/components/GlobalNav";
import { getRoteirosAtivos } from "@/data/roteiros";

export default async function AgendaRoteiros() {
  const roteiros = await getRoteirosAtivos();

  // Mesma separação já resolvida na Home - "próximo"/vaga não se aplica
  // a receptivo (preço fixo, sem vagas), então cada tipo tem sua própria
  // seção em vez de dividir um grid único.
  const emissiveis = roteiros.filter((roteiro) => roteiro.tipo !== "receptivo");
  const receptivos = roteiros.filter((roteiro) => roteiro.tipo === "receptivo");

  return (
    <div className="flex flex-1 flex-col">
      <GlobalNav />

      {/* Faixa "seta + título" idêntica em estrutura à de sobre/contato
          (mesmo container mx-auto max-w-5xl gap-3 px-8 py-4, mesma cor
          text-verde-mata dark:text-pedra-sabao no heading) - antes o
          BackButton+h2 ficavam dentro do container de conteúdo, sem
          faixa própria e sem cor no h2 (herdava preto padrão). */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-8 py-4">
        <div className="flex items-center gap-3">
          <BackButton href="/" />
          <h2 className="font-display text-verde-mata dark:text-pedra-sabao text-2xl font-extrabold tracking-tight">
            Roteiros emissíveis
          </h2>
        </div>
      </div>

      {/* Sem divisor decorativo nessa página - o TexturaTopografica não
          é mais desejado aqui. Conteúdo vem direto depois da faixa do
          título, mesmo p-8 do container já dá o respiro. */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-14 p-8">
        <section className="flex flex-col gap-5">
          {emissiveis.length === 0 ? (
            <p className="font-body text-zinc-600 dark:text-zinc-400">
              Nenhum roteiro disponível no momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 md:grid-cols-3">
              {emissiveis.map((roteiro) => (
                <RoteiroCard key={roteiro.id} roteiro={roteiro} />
              ))}
            </div>
          )}
        </section>

        {receptivos.length > 0 && (
          <section className="bg-ocre/70 flex flex-col gap-5 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col gap-1">
              <span className="font-body text-terracota text-xs font-semibold tracking-[0.2em] uppercase">
                Sob encomenda
              </span>
              <h2 className="font-display text-2xl font-extrabold tracking-tight">
                Roteiros receptivos
              </h2>
              <p className="font-body max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
                Passeios personalizados pra grupos e agências, com data e
                valor combinados diretamente com a gente pelo WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 md:grid-cols-3">
              {receptivos.map((roteiro) => (
                <RoteiroCard key={roteiro.id} roteiro={roteiro} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
