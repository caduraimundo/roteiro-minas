import Link from "next/link";
import { FotoPlaceholder } from "@/components/FotoPlaceholder";
import { formatarPreco } from "@/lib/format";
import type { RoteiroComVagas } from "@/data/roteiros";

// Mesmo número usado em WhatsAppFloatButton.tsx, RoteiroCard.tsx e
// Footer.tsx - se mudar, atualizar nos 4 lugares.
const NUMERO_WHATSAPP = "553184743523";

// Card horizontal (imagem à esquerda, texto+CTA WhatsApp à direita) pro
// tipo receptivo - extraído da Home (page.tsx) pra ser reaproveitado
// também na listagem de roteiros (/roteiros), em vez de duplicar o JSX
// pela segunda vez.
export function RoteiroReceptivoCard({
  roteiro,
}: {
  roteiro: RoteiroComVagas;
}) {
  const mensagem = encodeURIComponent(
    `Olá! Quero saber mais sobre o roteiro ${roteiro.nome}.`,
  );

  return (
    // Link de "Ver detalhes" cobre o card inteiro (irmão do conteúdo,
    // não ancestral) - o botão do WhatsApp fica por cima dele com
    // pointer-events reativado, então clicar nele nunca aciona a
    // navegação do Link. Evita <a> aninhado, que seria HTML inválido.
    <div className="border-pedra-sabao bg-ocre relative flex flex-col overflow-hidden rounded-2xl border sm:flex-row">
      <Link
        href={`/roteiros/${roteiro.slug}`}
        aria-label={`Ver detalhes de ${roteiro.nome}`}
        className="absolute inset-0 z-0"
      />
      <div className="pointer-events-none flex flex-1 flex-col sm:flex-row">
        <FotoPlaceholder className="aspect-[16/10] w-full rounded-2xl sm:aspect-auto sm:w-[300px] sm:rounded-2xl" />
        <div className="flex flex-1 flex-col justify-center gap-2 p-6 sm:p-8">
          <h3 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
            {roteiro.nome}
          </h3>
          <span className="font-body text-verde-mata/70 text-sm">
            Data e grupo combinados direto com a gente
          </span>
          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="font-display text-lg font-extrabold sm:text-xl">
              {roteiro.preco_receptivo != null
                ? `A partir de ${formatarPreco(roteiro.preco_receptivo)}`
                : "Consulte o valor"}
            </span>
            <a
              href={`https://wa.me/${NUMERO_WHATSAPP}?text=${mensagem}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display pointer-events-auto relative z-10 shrink-0 rounded-2xl bg-[#25D366] px-4 py-2.5 text-xs font-bold tracking-wide uppercase text-white transition-transform hover:scale-105"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
