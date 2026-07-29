import { notFound } from "next/navigation";
import { BackButton } from "@/components/BackButton";
import { CheckoutForm } from "@/components/CheckoutForm";
import { CheckoutHeader } from "@/components/CheckoutHeader";
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
        <CheckoutHeader />

        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-8">
          <BackButton href={`/roteiros/${roteiro.slug}`} />
          <p className="font-body text-verde-mata/70">
            Essa data não está mais disponível. Volte ao roteiro e escolha
            outra data.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <CheckoutHeader />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-8">
        <BackButton href={`/roteiros/${roteiro.slug}`} />

        <div className="flex flex-col gap-1">
          <h1 className="font-display text-verde-mata text-2xl font-semibold uppercase">
            {roteiro.nome}
          </h1>
          <p className="font-body text-verde-mata/70 text-sm">
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
