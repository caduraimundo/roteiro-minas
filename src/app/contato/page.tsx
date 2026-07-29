import { GlobalNav } from "@/components/GlobalNav";
import { Footer } from "@/components/Footer";
import { FaqAcordeao, type FaqItem } from "@/components/FaqAcordeao";

// Mesmo número usado em RoteiroCard/WhatsAppFloatButton/roteiro
// detalhe/Footer.tsx - se mudar, atualizar em todos.
const NUMERO_WHATSAPP = "553184743523";
// Mesmo e-mail já usado em Footer.tsx - duplicado aqui seguindo o
// mesmo padrão do NUMERO_WHATSAPP acima (não dá pra importar de
// Footer.tsx sem exportar de lá, e essa página está fora do escopo
// autorizado a mexer em outros arquivos).
const EMAIL_CONTATO = "roteirominasgerais@gmail.com";

// Só perguntas com resposta já confirmada em outro lugar do site -
// sem horário de atendimento, embarque em BH, Instagram ou endereço
// físico (nenhum confirmado). O cancelamento resume a política REAL
// publicada em /politica-de-reembolso, sem a faixa intermediária de
// remarcação que o wireframe inventa.
const FAQS: readonly FaqItem[] = [
  {
    pergunta: "O que está incluso no roteiro?",
    resposta:
      "Transporte (ida e volta, saindo do ponto de encontro combinado), guia credenciado acompanhando o grupo do início ao fim e seguro de aventura pra todos os participantes.",
  },
  {
    pergunta: "Como funciona o cancelamento?",
    resposta:
      "Cancelamentos com 7 dias ou mais de antecedência têm reembolso integral do valor do roteiro. Com menos de 7 dias, não há reembolso. Em qualquer caso, a taxa de serviço não é devolvida. Veja a política de reembolso completa.",
    link: { href: "/politica-de-reembolso", label: "Política de reembolso" },
  },
  {
    pergunta: "Quais as formas de pagamento aceitas?",
    resposta:
      "Pix, cartão de crédito à vista ou parcelado, direto no checkout do site.",
  },
  {
    pergunta: "Como faço pra reservar uma vaga?",
    resposta:
      "Escolha o roteiro, escolha a data disponível e complete o checkout - a reserva é confirmada na hora.",
  },
];

export default function Contato() {
  const mensagem = encodeURIComponent(
    "Olá! Gostaria de saber mais sobre os passeios da Roteiro Minas.",
  );

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero de página - mesmo padrão do Sobre Nós (fundo verde-mata
          sólido, badge, título, GlobalNav transparente por cima). */}
      <div className="relative">
        <GlobalNav variant="transparente" />

        <section className="bg-verde-mata relative overflow-hidden">
          <div aria-hidden="true" className="h-24" />

          <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-8 pt-4 pb-16 sm:pb-20">
            <span className="font-body border-pedra-sabao/30 bg-pedra-sabao/10 text-pedra-sabao inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.15em] uppercase">
              <span className="bg-ocre h-1.5 w-1.5 rounded-full" aria-hidden="true" />
              Contato
            </span>

            <h1 className="font-display text-pedra-sabao max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              Bora conversar?
            </h1>

            <p className="font-body text-pedra-sabao/90 max-w-2xl text-base sm:text-lg">
              Dúvidas sobre um roteiro, passeio personalizado pro seu grupo
              ou já reservou e precisa de ajuda? Fala com a gente pelo
              WhatsApp - a gente responde rapidinho.
            </p>
          </div>
        </section>
      </div>

      {/* Cartão de contato - WhatsApp e e-mail reais já usados em
          outros pontos do site. */}
      <section className="mx-auto w-full max-w-5xl px-8 py-16">
        <div className="border-pedra-sabao bg-ocre flex flex-col items-start gap-6 rounded-2xl border p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-body text-verde-mata/60 text-xs font-bold tracking-[0.14em] uppercase">
              Fale com a gente
            </span>
            <a
              href={`mailto:${EMAIL_CONTATO}`}
              className="font-body text-verde-mata hover:text-terracota text-sm font-semibold transition-colors"
            >
              {EMAIL_CONTATO}
            </a>
          </div>

          <a
            href={`https://wa.me/${NUMERO_WHATSAPP}?text=${mensagem}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display bg-terracota hover:bg-terracota/90 text-pedra-sabao inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-semibold tracking-wide uppercase transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Falar no WhatsApp
          </a>
        </div>
      </section>

      {/* FAQ com acordeão - só perguntas confirmadas (ver comentário
          em FAQS acima). */}
      <section className="border-pedra-sabao bg-pedra-sabao/40 border-y">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-8 py-16">
          <div className="flex flex-col gap-2 text-center">
            <span className="font-body text-verde-mata/60 text-xs font-bold tracking-[0.14em] uppercase">
              Dúvidas
            </span>
            <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Perguntas frequentes
            </h2>
          </div>

          <FaqAcordeao faqs={FAQS} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
