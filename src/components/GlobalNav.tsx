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

// Breakpoint md (mesmo usado em md:grid-cols-3 no resto do site) pro
// corte desktop/mobile aqui - sm fica apertado pra 4 links + wordmark.
export function GlobalNav() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-pedra-sabao/95 backdrop-blur dark:border-zinc-800 dark:bg-verde-mata/95">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-8 py-4">
        <Link
          href="/"
          className="font-wordmark text-sm uppercase tracking-wide text-verde-mata dark:text-pedra-sabao"
        >
          Roteiro Minas
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body hover:text-terracota text-sm font-medium text-verde-mata transition-colors dark:text-pedra-sabao"
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
          className="text-verde-mata flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 md:hidden dark:border-zinc-700 dark:text-pedra-sabao"
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
        <nav className="border-t border-zinc-200 bg-pedra-sabao/95 backdrop-blur md:hidden dark:border-zinc-800 dark:bg-verde-mata/95">
          <div className="mx-auto flex w-full max-w-5xl flex-col px-8 py-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setAberto(false)}
                className="font-body text-verde-mata border-zinc-200/60 border-b py-3 text-sm font-medium last:border-b-0 dark:text-pedra-sabao dark:border-zinc-800/60"
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
