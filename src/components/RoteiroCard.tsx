import Link from "next/link";
import { FotoPlaceholder } from "@/components/FotoPlaceholder";
import { formatarData, formatarPreco } from "@/lib/format";
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
    "flex flex-col overflow-hidden rounded-[20px] border border-zinc-200 shadow-[0_10px_26px_rgba(46,58,34,0.1)] dark:border-zinc-800";

  const conteudo = (
    <>
      <FotoPlaceholder className="h-40 w-full" />
      <div className="flex flex-col gap-1 p-5">
        <h2 className="font-display text-xl font-semibold uppercase">
          {roteiro.nome}
        </h2>
        {!esgotado && (
          <div className="font-body flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <span className="bg-terracota h-1.5 w-1.5 shrink-0 rounded-full" />
            {formatarData(vaga.data)}
          </div>
        )}
        <div className="mt-2 flex items-end justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
          {esgotado ? (
            <span className="font-body text-sm text-red-600 dark:text-red-400">
              Esgotado
            </span>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="font-body text-sm text-zinc-600 dark:text-zinc-400">
                A partir de {formatarPreco(vaga.preco)}
              </span>
              <span className="font-body text-sm font-medium text-terracota">
                {textoDisponibilidade(vaga.vagas_disponiveis)}
              </span>
            </div>
          )}
          {!esgotado && (
            <span className="font-display bg-terracota text-pedra-sabao shrink-0 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide">
              Ver detalhes →
            </span>
          )}
        </div>
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
