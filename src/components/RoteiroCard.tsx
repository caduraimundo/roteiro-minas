import Link from "next/link";
import { FotoPlaceholder } from "@/components/FotoPlaceholder";
import { formatarPreco } from "@/lib/format";
import { proximaVagaDisponivel, type RoteiroComVagas } from "@/data/roteiros";

export function RoteiroCard({ roteiro }: { roteiro: RoteiroComVagas }) {
  const vaga = proximaVagaDisponivel(roteiro.vagas);
  const esgotado = vaga === null;

  return (
    <Link
      href={`/roteiros/${roteiro.slug}`}
      className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
    >
      <FotoPlaceholder className="h-40 w-full" />
      <div className="flex flex-col gap-1 p-4">
        <h2 className="font-semibold">{roteiro.nome}</h2>
        {esgotado ? (
          <span className="text-sm text-red-600 dark:text-red-400">
            Vagas esgotadas
          </span>
        ) : (
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            A partir de {formatarPreco(vaga.preco)}
          </span>
        )}
      </div>
    </Link>
  );
}
