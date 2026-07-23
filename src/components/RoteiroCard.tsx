import Link from "next/link";
import { FotoPlaceholder } from "@/components/FotoPlaceholder";
import { formatarData, formatarPreco } from "@/lib/format";
import { proximaVagaDisponivel, type RoteiroComVagas } from "@/data/roteiros";

// Mesmo número usado no WhatsAppFloatButton - roteiro receptivo não tem
// checkout online (preço/data combinados direto com a gente), então o
// CTA do card leva pra conversa em vez de pra uma vaga.
const NUMERO_WHATSAPP = "553184743523";

function textoDisponibilidade(quantidade: number) {
  return quantidade > 5
    ? `${quantidade} vagas disponíveis`
    : `Últimas ${quantidade} vagas`;
}

// Imagem grande em cima, informação secundária discreta, preço em
// destaque embaixo - card mais próximo do Airbnb Experiences, sem caixa/
// borda em volta do conteúdo inteiro (só a imagem é "boxed").
const imagemClasse =
  "aspect-[16/10] w-full rounded-2xl sm:aspect-[4/3]";

export function RoteiroCard({ roteiro }: { roteiro: RoteiroComVagas }) {
  if (roteiro.tipo === "receptivo") {
    return <RoteiroCardReceptivo roteiro={roteiro} />;
  }

  const vaga = proximaVagaDisponivel(roteiro.vagas);
  const esgotado = vaga === null;

  const conteudo = (
    <>
      <FotoPlaceholder className={imagemClasse} />
      <div className="flex flex-col gap-1 pt-3">
        <h2 className="font-display text-lg font-semibold uppercase sm:text-base">
          {roteiro.nome}
        </h2>
        {!esgotado && (
          <div className="font-body flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="bg-terracota h-1.5 w-1.5 shrink-0 rounded-full" />
            {formatarData(vaga.data)}
          </div>
        )}
        <div className="mt-1 flex items-center justify-between gap-2">
          {esgotado ? (
            <span className="font-body text-sm text-red-600 dark:text-red-400">
              Esgotado
            </span>
          ) : (
            <>
              <span className="font-body text-sm font-semibold">
                A partir de {formatarPreco(vaga.preco)}
              </span>
              <span className="font-body text-terracota shrink-0 text-xs font-medium">
                {textoDisponibilidade(vaga.vagas_disponiveis)}
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );

  // Esgotado: card visualmente desabilitado, sem link pra clicar.
  if (esgotado) {
    return (
      <div
        aria-disabled="true"
        className="flex cursor-not-allowed flex-col opacity-60 grayscale"
      >
        {conteudo}
      </div>
    );
  }

  return (
    <Link
      href={`/roteiros/${roteiro.slug}`}
      className="group flex flex-col transition-opacity hover:opacity-90"
    >
      {conteudo}
    </Link>
  );
}

function RoteiroCardReceptivo({ roteiro }: { roteiro: RoteiroComVagas }) {
  const mensagem = encodeURIComponent(
    `Olá! Quero saber mais sobre o roteiro ${roteiro.nome}.`,
  );

  return (
    <div className="flex flex-col">
      <FotoPlaceholder className={imagemClasse} />
      <div className="flex flex-col gap-1 pt-3">
        <h2 className="font-display text-lg font-semibold uppercase sm:text-base">
          {roteiro.nome}
        </h2>
        <span className="font-body text-sm text-zinc-600 dark:text-zinc-400">
          Data e grupo combinados direto com a gente
        </span>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-body text-sm font-semibold">
            {roteiro.preco_receptivo != null
              ? `A partir de ${formatarPreco(roteiro.preco_receptivo)}`
              : "Consulte o valor"}
          </span>
          <a
            href={`https://wa.me/${NUMERO_WHATSAPP}?text=${mensagem}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display shrink-0 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-transform hover:scale-105"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
