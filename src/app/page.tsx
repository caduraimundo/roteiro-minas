import { RoteiroCard } from "@/components/RoteiroCard";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Depoimentos } from "@/components/Depoimentos";
import { TexturaTopografica } from "@/components/TexturaTopografica";
import { getRoteirosAtivos } from "@/data/roteiros";
import { getConfiguracoesSite } from "@/data/configuracoes";

export default async function Home() {
  const [roteiros, configuracoes] = await Promise.all([
    getRoteirosAtivos(),
    getConfiguracoesSite(),
  ]);

  return (
    <>
      <HeroCarousel />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 p-8">
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-2xl font-semibold">
            Próximos roteiros
          </h2>

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
        </section>

        <div className="relative h-16 w-full">
          <TexturaTopografica variant="divisor" />
        </div>

        <Depoimentos />
      </div>

      <footer className="border-t border-zinc-200 py-6 text-center dark:border-zinc-800">
        <p className="font-body text-xs text-zinc-500 dark:text-zinc-500">
          Cadastur {configuracoes?.cadastur_numero ?? "—"}
        </p>
        <p className="font-body text-xs text-zinc-500 dark:text-zinc-500">
          {configuracoes?.stats_seguidores_instagram ?? "—"} seguidores no
          Instagram · {configuracoes?.stats_roteiros_realizados ?? "—"}{" "}
          roteiros realizados · avaliação média{" "}
          {configuracoes?.stats_avaliacao_media ?? "—"}
        </p>
      </footer>
    </>
  );
}
