import { RoteiroCard } from "@/components/RoteiroCard";
import { getRoteirosAtivos } from "@/data/roteiros";

export default async function Home() {
  const roteiros = await getRoteirosAtivos();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Roteiro Minas</h1>

      {roteiros.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
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
  );
}
