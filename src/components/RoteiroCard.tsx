import Link from "next/link";
import { FotoPlaceholder } from "@/components/FotoPlaceholder";
import { formatarPreco } from "@/lib/format";
import { proximaVagaDisponivel, type RoteiroComVagas } from "@/data/roteiros";

function textoDisponibilidade(quantidade: number) {
  return quantidade > 5
    ? `${quantidade} vagas disponíveis`
    : `Últimas ${quantidade} vagas`;
}

export function RoteiroCard({ roteiro }: { roteiro: RoteiroComVagas }) {
  const vaga = proximaVagaDisponivel(roteiro.vagas);
  const esgotado = vaga === null;

  const classeBase =
    "flex flex-col overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800";

  const conteudo = (
    <>
      <FotoPlaceholder className="h-40 w-full" />
      <div className="flex flex-col gap-1 p-4">
        <h2 className="font-display font-semibold">{roteiro.nome}</h2>
        {esgotado ? (
          <span className="font-body text-sm text-red-600 dark:text-red-400">
            Esgotado
          </span>
        ) : (
          <>
            <span className="font-body text-sm text-zinc-600 dark:text-zinc-400">
              A partir de {formatarPreco(vaga.preco)}
            </span>
            <span className="font-body text-sm font-medium text-terracota">
              {textoDisponibilidade(vaga.vagas_disponiveis)}
            </span>
          </>
        )}
      </div>
    </>
  );

  // Esgotado: card visualmente desabilitado, sem botão de reservar
  // clicável - renderiza como div, não Link, nenhum href pra clicar.
  if (esgotado) {
    return (
      <div
        aria-disabled="true"
        className={`${classeBase} cursor-not-allowed opacity-60 grayscale`}
      >
        {conteudo}
      </div>
    );
  }

  return (
    <Link href={`/roteiros/${roteiro.slug}`} className={classeBase}>
      {conteudo}
    </Link>
  );
}
