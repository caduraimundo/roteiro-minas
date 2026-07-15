import Link from "next/link";
import { notFound } from "next/navigation";
import { FotoPlaceholder } from "@/components/FotoPlaceholder";
import { getRoteiroPorSlug } from "@/data/roteiros";
import { formatarData, formatarPreco } from "@/lib/format";

export default async function RoteiroDetalhe({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roteiro = await getRoteiroPorSlug(slug);

  if (!roteiro) {
    notFound();
  }

  const vagasOrdenadas = [...roteiro.vagas].sort((a, b) =>
    a.data.localeCompare(b.data),
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-8">
      <Link href="/" className="text-sm text-zinc-600 dark:text-zinc-400">
        ← Voltar
      </Link>

      <FotoPlaceholder className="h-56 w-full rounded-lg" />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{roteiro.nome}</h1>
        {roteiro.descricao && (
          <p className="text-zinc-600 dark:text-zinc-400">
            {roteiro.descricao}
          </p>
        )}
      </div>

      {roteiro.pdf_url ? (
        <a
          href={roteiro.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium underline"
        >
          Ver roteiro em PDF
        </a>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Roteiro em PDF em breve.
        </p>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">Datas disponíveis</h2>

        {vagasOrdenadas.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            Nenhuma data cadastrada no momento.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {vagasOrdenadas.map((vaga) => {
              const esgotada =
                vaga.status !== "aberta" || vaga.vagas_disponiveis <= 0;

              return (
                <li
                  key={vaga.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {formatarData(vaga.data)}
                    </span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {formatarPreco(vaga.preco)}
                      {!esgotada &&
                        ` · ${vaga.vagas_disponiveis} vaga(s) disponível(is)`}
                    </span>
                  </div>

                  {esgotada ? (
                    <button
                      type="button"
                      disabled
                      className="rounded-full px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
                    >
                      Esgotado
                    </button>
                  ) : (
                    <Link
                      href={`/roteiros/${roteiro.slug}/checkout?vaga=${vaga.id}`}
                      className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
                    >
                      Comprar
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
