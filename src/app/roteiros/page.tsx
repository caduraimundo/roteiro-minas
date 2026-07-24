import { RoteiroCard } from "@/components/RoteiroCard";
import { GlobalNav } from "@/components/GlobalNav";
import { TexturaTopografica } from "@/components/TexturaTopografica";
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

      {/* Sem título próprio nessa página - "Roteiros disponíveis" foi
          removido (redundante com o h2 "Roteiros emissíveis" logo
          abaixo, mesma revisão em produção que apontou o vão duplo).
          mt-6 no wrapper do divisor (não padding - TexturaTopografica é
          absolute inset-0, ignora padding do pai) dá uma respiração
          pequena entre o GlobalNav e o divisor, sem colar nem abrir um
          vão grande de novo. */}
      <div className="relative mt-6 h-12 w-full">
        <TexturaTopografica variant="divisor" />
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-14 p-8">
        <section className="flex flex-col gap-5">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            Roteiros emissíveis
          </h2>

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
