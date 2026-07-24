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

      {/* Título não é mais sticky (só o GlobalNav é) - mesma faixa
          (classes idênticas) usada nas outras 4 páginas de header
          padrão. FiltroCategoriaChips removido (nunca foi filtro
          funcional - não existe campo de categoria no banco - e o
          volume de roteiros, ~12 no total, no máximo 2 passeios/mês,
          não justifica simular um). */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-8 py-4">
        <h1 className="font-display text-verde-mata dark:text-pedra-sabao text-2xl font-extrabold tracking-tight">
          Roteiros disponíveis
        </h1>
      </div>

      {/* Divisor como irmão solto entre o título e o conteúdo, mesma
          posição usada nas outras 4 páginas - antes ficava dentro do
          container gap-14, empilhando o próprio gap-14 por cima da
          altura do divisor e do p-8 do container, e o respiro entre o
          título e "Roteiros emissíveis" ficava exagerado (~152px:
          py-4 + p-8 + h-12 + gap-14). Nessa posição o total cai pra
          96px (py-4 + h-12 + p-8), igual ao que as outras 4 páginas já
          usam entre título e primeiro conteúdo - gap-14 abaixo
          continua só entre as seções (emissíveis/receptivos), mesmo
          ritmo da Home. */}
      <div className="relative h-12 w-full">
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
