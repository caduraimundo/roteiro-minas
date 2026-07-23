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

function IconeInstagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

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
            <div className="flex items-center gap-2">
              <span className="font-body text-sm font-medium">
                {depoimento.nome}
              </span>
              {/* Só indicador visual - sem link/href, dado que os
                  depoimentos ainda são placeholder. */}
              <span className="font-body flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-500">
                <IconeInstagram className="h-3.5 w-3.5" />@{depoimento.usuario}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
