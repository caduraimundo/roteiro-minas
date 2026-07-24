"use client";

import { useState } from "react";
import Link from "next/link";

// Home/Roteiros/Sobre Nós/Contato - as 4 páginas que a navegação global
// cobre nesta rodada (Parte 1). Detalhe/Checkout ficam pra depois.
const LINKS = [
  { href: "/", label: "Home" },
  { href: "/roteiros", label: "Roteiros" },
  { href: "/sobre", label: "Sobre Nós" },
  { href: "/contato", label: "Contato" },
] as const;

type GlobalNavProps = {
  // "solido" (padrão): header opaco/sticky usado nas páginas de conteúdo
  // (Parte 1). "transparente": overlay absoluto sobre o hero da Home -
  // mesmo visual que Header.tsx tinha (gradiente, logo+wordmark de duas
  // linhas, texto claro), sem virar sticky durante o scroll (some junto
  // com o hero, igual já era antes).
  variant?: "solido" | "transparente";
};

// Breakpoint md (mesmo usado em md:grid-cols-3 no resto do site) pro
// corte desktop/mobile aqui - sm fica apertado pra 4 links + wordmark.
export function GlobalNav({ variant = "solido" }: GlobalNavProps) {
  const [aberto, setAberto] = useState(false);
  const transparente = variant === "transparente";

  return (
    <header
      className={
        transparente
          ? "absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-verde-mata to-verde-mata/0"
          : "sticky top-0 z-30 border-b border-zinc-200 bg-pedra-sabao/95 backdrop-blur dark:border-zinc-800 dark:bg-verde-mata/95"
      }
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-8 py-4">
        {/* Mesmo wordmark de uma linha só nas duas variantes - a
            transparente usava logo+duas linhas de texto (mais alto,
            por causa da imagem 36x36), o que deixava o header da Home
            visualmente mais alto que o das outras páginas. Só a cor
            muda (clara aqui, pro fundo escuro do hero). */}
        <Link
          href="/"
          className={
            transparente
              ? "font-wordmark text-sm uppercase tracking-wide text-pedra-sabao"
              : "font-wordmark text-sm uppercase tracking-wide text-verde-mata dark:text-pedra-sabao"
          }
        >
          Roteiro Minas
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                transparente
                  ? "font-body hover:text-ocre text-sm font-medium text-pedra-sabao transition-colors"
                  : "font-body hover:text-terracota text-sm font-medium text-verde-mata transition-colors dark:text-pedra-sabao"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setAberto((atual) => !atual)}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          className={
            transparente
              ? "border-pedra-sabao/50 text-pedra-sabao flex h-10 w-10 items-center justify-center rounded-xl border md:hidden"
              : "text-verde-mata flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 md:hidden dark:border-zinc-700 dark:text-pedra-sabao"
          }
        >
          {aberto ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {aberto && (
        <nav
          className={
            transparente
              ? "bg-verde-mata/95 backdrop-blur md:hidden"
              : "border-t border-zinc-200 bg-pedra-sabao/95 backdrop-blur md:hidden dark:border-zinc-800 dark:bg-verde-mata/95"
          }
        >
          <div className="mx-auto flex w-full max-w-5xl flex-col px-8 py-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setAberto(false)}
                className={
                  transparente
                    ? "font-body border-pedra-sabao/20 text-pedra-sabao border-b py-3 text-sm font-medium last:border-b-0"
                    : "font-body text-verde-mata border-zinc-200/60 border-b py-3 text-sm font-medium last:border-b-0 dark:text-pedra-sabao dark:border-zinc-800/60"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
