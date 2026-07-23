import Link from "next/link";
import { RoteiroCard } from "@/components/RoteiroCard";
import { FiltroCategoriaChips } from "@/components/FiltroCategoriaChips";
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
      {/* Título e chips ficam dentro do header sticky (junto, como na
          referência) - só o header continua claro: os chips já
          confirmados em produção usam contraste pensado pra fundo
          claro (borda/texto escuros no estado inativo), então não dá
          pra escurecer o header sem mexer na cor deles. */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-pedra-sabao/95 backdrop-blur dark:border-zinc-800 dark:bg-verde-mata/95">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-8 py-4">
          <Link
            href="/"
            aria-label="Voltar para o início"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-300 text-lg text-verde-mata dark:border-zinc-700 dark:text-pedra-sabao"
          >
            ←
          </Link>
          <div className="flex flex-col">
            <span className="font-wordmark text-[10px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
              Roteiro Minas
            </span>
            {/* font-extrabold + case natural (sem uppercase) - mesmo
                tratamento de heading já aplicado no h1 do Detalhe e nos
                h2 de seção da Home, no lugar do font-semibold uppercase
                antigo que sobrava daqui. */}
            <h1 className="font-display text-verde-mata dark:text-pedra-sabao text-2xl font-extrabold tracking-tight">
              Roteiros disponíveis
            </h1>
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl px-8 pb-4">
          <FiltroCategoriaChips />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-14 p-8">
        <div className="relative h-12 w-full">
          <TexturaTopografica variant="divisor" />
        </div>

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
