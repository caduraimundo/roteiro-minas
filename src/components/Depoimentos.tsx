// Conteúdo placeholder de propósito - depoimentos reais ainda não
// existem, trocar quando existirem. Decisão explícita do Cadu
// (28/07/2026): recriar a seção com conteúdo fictício até o Markys
// fornecer depoimentos reais. Os nomes de roteiro citados aqui também
// são ilustrativos - não necessariamente batem com roteiros reais
// cadastrados no banco.
const DEPOIMENTOS_PLACEHOLDER = [
  {
    nome: "Marina Costa",
    roteiro: "Trilha da Serra do Cipó",
    iniciais: "MC",
    texto:
      "Passeio incrível, guia super atencioso e paisagem de tirar o fôlego.",
  },
  {
    nome: "Lucas Andrade",
    roteiro: "Cachoeira do Tabuleiro",
    iniciais: "LA",
    texto: "Organização impecável do início ao fim, recomendo muito!",
  },
  {
    nome: "Fernanda Dias",
    roteiro: "Travessia de Ibitipoca",
    iniciais: "FD",
    texto: "Melhor experiência de ecoturismo que já fiz em Minas.",
  },
] as const;

function Estrelas() {
  return (
    <div className="text-terracota text-sm tracking-wide" aria-hidden="true">
      ★★★★★
    </div>
  );
}

export function Depoimentos() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <span className="font-body text-verde-mata/60 text-xs font-bold tracking-[0.14em] uppercase">
          Quem já foi
        </span>
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          O que dizem sobre a gente
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {DEPOIMENTOS_PLACEHOLDER.map((depoimento) => (
          <div
            key={depoimento.nome}
            className="bg-ocre border-pedra-sabao flex flex-col gap-4 rounded-2xl border p-6"
          >
            <Estrelas />
            <p className="font-body text-verde-mata/80 flex-1 text-sm leading-relaxed">
              &ldquo;{depoimento.texto}&rdquo;
            </p>
            <div className="border-pedra-sabao flex items-center gap-3 border-t pt-4">
              <div className="bg-verde-mata text-pedra-sabao font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                {depoimento.iniciais}
              </div>
              <div>
                <div className="font-body text-sm font-bold">
                  {depoimento.nome}
                </div>
                <div className="font-body text-verde-mata/60 text-xs">
                  {depoimento.roteiro}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
