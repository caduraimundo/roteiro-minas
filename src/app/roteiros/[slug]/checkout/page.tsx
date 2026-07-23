import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/CheckoutForm";
import { GlobalNav } from "@/components/GlobalNav";
import { TexturaTopografica } from "@/components/TexturaTopografica";
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
      <>
        <GlobalNav />

        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-8">
          <Link
            href={`/roteiros/${roteiro.slug}`}
            className="font-body text-sm text-zinc-600 dark:text-zinc-400"
          >
            ← Voltar
          </Link>
          <p className="font-body text-zinc-600 dark:text-zinc-400">
            Essa data não está mais disponível. Volte ao roteiro e escolha
            outra data.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalNav />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-8">
        <Link
          href={`/roteiros/${roteiro.slug}`}
          className="font-body text-sm text-zinc-600 dark:text-zinc-400"
        >
          ← Voltar
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="font-display text-verde-mata dark:text-pedra-sabao text-2xl font-semibold uppercase">
            {roteiro.nome}
          </h1>
          <p className="font-body text-sm text-zinc-600 dark:text-zinc-400">
            {formatarData(vaga.data)} · {formatarPreco(vaga.preco)}
          </p>
        </div>

        <div className="relative h-12 w-full">
          <TexturaTopografica variant="divisor" />
        </div>

        <CheckoutForm
          roteiroId={roteiro.id}
          vagaId={vaga.id}
          preco={vaga.preco}
        />
      </div>
    </>
  );
}
