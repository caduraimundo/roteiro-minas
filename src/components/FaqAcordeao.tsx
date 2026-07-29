"use client";

import { useState } from "react";

function IconeMenos() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function IconeMais() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export type FaqItem = {
  pergunta: string;
  resposta: string;
  link?: { href: string; label: string };
};

// Acordeão simples (um item aberto por vez) - client component isolado
// pra não obrigar a página inteira (Server Component, importa Footer)
// a virar client component só por causa desse pedaço interativo.
export function FaqAcordeao({ faqs }: { faqs: readonly FaqItem[] }) {
  const [abertoIndex, setAbertoIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq, indice) => {
        const aberto = abertoIndex === indice;

        return (
          <div
            key={faq.pergunta}
            className="border-pedra-sabao bg-ocre overflow-hidden rounded-2xl border"
          >
            <button
              type="button"
              onClick={() => setAbertoIndex(aberto ? null : indice)}
              aria-expanded={aberto}
              className="font-display flex w-full items-center justify-between gap-4 p-5 text-left text-base font-semibold"
            >
              {faq.pergunta}
              {aberto ? (
                <IconeMenos />
              ) : (
                <span className="text-verde-mata">
                  <IconeMais />
                </span>
              )}
            </button>
            {aberto && (
              <div className="font-body text-verde-mata/70 px-5 pb-5 text-sm leading-relaxed">
                {faq.resposta}
                {faq.link && (
                  <>
                    {" "}
                    <a
                      href={faq.link.href}
                      className="text-terracota font-semibold underline underline-offset-2"
                    >
                      {faq.link.label}
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
