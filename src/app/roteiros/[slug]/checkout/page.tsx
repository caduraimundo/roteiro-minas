import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getRoteiroPorSlug } from "@/data/roteiros";
import { formatarData, formatarPreco } from "@/lib/format";

export default async function Checkout({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ vaga?: string }>;
}) {
  const { slug } = await params;
  const { vaga: vagaId } = await searchParams;

  const roteiro = await getRoteiroPorSlug(slug);
  if (!roteiro) {
    notFound();
  }

  const vaga = roteiro.vagas.find((v) => v.id === vagaId);
  const vagaDisponivel =
    vaga && vaga.status === "aberta" && vaga.vagas_disponiveis > 0;

  if (!vagaDisponivel) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-8">
        <Link
          href={`/roteiros/${roteiro.slug}`}
          className="text-sm text-zinc-600 dark:text-zinc-400"
        >
          ← Voltar
        </Link>
        <p className="text-zinc-600 dark:text-zinc-400">
          Essa data não está mais disponível. Volte ao roteiro e escolha
          outra data.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 p-8">
      <Link
        href={`/roteiros/${roteiro.slug}`}
        className="text-sm text-zinc-600 dark:text-zinc-400"
      >
        ← Voltar
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">{roteiro.nome}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {formatarData(vaga.data)} · {formatarPreco(vaga.preco)}
        </p>
      </div>

      <CheckoutForm roteiroId={roteiro.id} preco={vaga.preco} />
    </div>
  );
}
