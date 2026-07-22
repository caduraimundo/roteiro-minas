import Link from "next/link";
import { RoteiroCard } from "@/components/RoteiroCard";
import { FiltroCategoriaChips } from "@/components/FiltroCategoriaChips";
import { TexturaTopografica } from "@/components/TexturaTopografica";
import { getRoteirosAtivos } from "@/data/roteiros";

export default async function AgendaRoteiros() {
  const roteiros = await getRoteirosAtivos();

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-pedra-sabao/95 backdrop-blur dark:border-zinc-800 dark:bg-verde-mata/95">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-8 py-4">
          <Link
            href="/"
            className="font-display text-lg font-semibold text-verde-mata dark:text-pedra-sabao"
          >
            Roteiro Minas
          </Link>
          <Link
            href="/"
            className="font-body text-sm text-zinc-600 dark:text-zinc-400"
          >
            ← Início
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold">
            Roteiros disponíveis
          </h1>
          <p className="font-body text-sm text-zinc-600 dark:text-zinc-400">
            Escolha uma trilha, cachoeira ou travessia e reserve sua vaga.
          </p>
        </div>

        <FiltroCategoriaChips />

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
