"use client";

import { useState } from "react";

// Categorias do wireframe (Trilha, Cachoeira, Travessia) - só visual por
// enquanto: não existe campo de categoria em roteiros hoje (schema real
// confirmado antes de codar: id, nome, descricao, tipo [fixo|
// personalizado], pdf_url, ativo, created_at, slug, custo_fixo_execucao,
// custo_variavel_pessoa - nenhum deles é categoria de atividade). Decisão
// registrada com o Cadu: construir os chips já com os tokens certos,
// sem ligar filtro nenhum na lista até esse campo existir no banco.
const CATEGORIAS = ["Trilha", "Cachoeira", "Travessia"] as const;

export function FiltroCategoriaChips() {
  const [ativa, setAtiva] = useState<string | null>(null);

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filtrar por categoria (ainda sem efeito na lista)"
    >
      {CATEGORIAS.map((categoria) => {
        const selecionada = ativa === categoria;

        return (
          <button
            key={categoria}
            type="button"
            onClick={() => setAtiva(selecionada ? null : categoria)}
            className={`font-body rounded-full border px-4 py-1.5 text-sm transition-colors ${
              // O reset do Preflight do Tailwind pra <button> (background-
              // color: transparent, camada base) está vencendo as
              // utilities bg-terracota/border-terracota nesse elemento
              // (confirmado com next build && next start, não é só dev
              // server) - "!" força o important e resolve. Não acontece
              // em elementos que não são <button>/<input>/<select>.
              selecionada
                ? "border-terracota! bg-terracota! text-pedra-sabao!"
                : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            {categoria}
          </button>
        );
      })}
    </div>
  );
}
