// Conteúdo placeholder de propósito - depoimentos reais ainda não
// existem, trocar quando existirem.
const DEPOIMENTOS_PLACEHOLDER = [
  {
    nome: "Marina Costa",
    usuario: "marina.costa",
    texto:
      "Passeio incrível, guia super atencioso e paisagem de tirar o fôlego.",
  },
  {
    nome: "Lucas Andrade",
    usuario: "lucas.andrade",
    texto: "Organização impecável do início ao fim, recomendo muito!",
  },
  {
    nome: "Fernanda Dias",
    usuario: "fernanda.dias",
    texto: "Melhor experiência de ecoturismo que já fiz em Minas.",
  },
];

export function Depoimentos() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-2xl font-extrabold tracking-tight">
        O que dizem sobre a gente
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {DEPOIMENTOS_PLACEHOLDER.map((depoimento) => (
          <div
            key={depoimento.usuario}
            className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <p className="font-body text-sm text-zinc-700 dark:text-zinc-300">
              &ldquo;{depoimento.texto}&rdquo;
            </p>
            <span className="font-body text-sm font-medium">
              {depoimento.nome}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
