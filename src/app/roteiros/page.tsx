import Link from "next/link";
import { RoteiroCard } from "@/components/RoteiroCard";
import { FiltroCategoriaChips } from "@/components/FiltroCategoriaChips";
import { TexturaTopografica } from "@/components/TexturaTopografica";
import { getRoteirosAtivos } from "@/data/roteiros";

export default async function AgendaRoteiros() {
  const roteiros = await getRoteirosAtivos();

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
            <span className="font-display text-[10px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
              Roteiro Minas
            </span>
            <h1 className="font-display text-2xl font-semibold uppercase text-verde-mata dark:text-pedra-sabao">
              Roteiros disponíveis
            </h1>
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl px-8 pb-4">
          <FiltroCategoriaChips />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-8">
        <div className="relative h-12 w-full">
          <TexturaTopografica variant="divisor" />
        </div>

        {roteiros.length === 0 ? (
          <p className="font-body text-zinc-600 dark:text-zinc-400">
            Nenhum roteiro disponível no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {roteiros.map((roteiro) => (
              <RoteiroCard key={roteiro.id} roteiro={roteiro} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
