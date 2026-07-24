"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Home/Roteiros/Sobre Nós/Contato - as 4 páginas que a navegação global
// cobre nesta rodada (Parte 1). Detalhe/Checkout ficam pra depois.
const LINKS = [
  { href: "/", label: "Home" },
  { href: "/roteiros", label: "Roteiros" },
  { href: "/sobre", label: "Sobre Nós" },
  { href: "/contato", label: "Contato" },
] as const;

// Home compara path exato - senão qualquer rota bateria como prefixo de
// "/" e ficaria marcada como ativa junto. Os demais usam prefixo
// (pathname === href ou começa com href + "/") pra cobrir sub-rotas que
// também usam o GlobalNav, como /roteiros/[slug] e
// /roteiros/[slug]/checkout - continuam marcando "Roteiros" como ativo.
function linkEstaAtivo(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type GlobalNavProps = {
  // "solido" (padrão): header opaco usado nas páginas de conteúdo
  // (roteiros, sobre, contato, termos, politica-de-reembolso) - bloco
  // normal no fluxo do documento (relative, não sticky), some ao rolar
  // como qualquer conteúdo acima da dobra. "transparente": overlay
  // absoluto sobre o hero da Home - mesmo visual que Header.tsx tinha
  // (gradiente, logo+wordmark de duas linhas, texto claro), também some
  // ao rolar (absolute, não sticky) - as duas variantes têm o mesmo
  // comportamento de scroll agora, só o visual muda.
  variant?: "solido" | "transparente";
};

// Breakpoint md (mesmo usado em md:grid-cols-3 no resto do site) pro
// corte desktop/mobile aqui - sm fica apertado pra 4 links + wordmark.
export function GlobalNav({ variant = "solido" }: GlobalNavProps) {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();
  const transparente = variant === "transparente";

  return (
    <header
      className={
        transparente
          ? "absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-black to-black/0"
          : "relative z-30 border-b border-zinc-200 bg-pedra-sabao/95 backdrop-blur dark:border-zinc-800 dark:bg-verde-mata/95"
      }
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-8 py-4">
        {/* Wordmark de logo + duas linhas nas duas variantes (volta a
            decisão anterior, que unificou tudo pro texto de uma linha
            só) - como as duas usam a mesma marcação agora, a altura do
            header fica consistente entre elas de novo, só que no
            formato "alto" em vez do "baixo". Só a cor muda: pedra-sabao
            na transparente (fundo escuro do hero, como sempre foi),
            verde-mata/pedra-sabao (claro/dark) na solido, mesma paleta
            que ela já usa pros links e pro botão de hambúrguer. */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.webp"
            alt="Roteiro Minas"
            width={36}
            height={36}
            className={
              transparente
                ? "rounded-full border border-pedra-sabao/50"
                : "rounded-full border border-zinc-300 dark:border-zinc-700"
            }
          />
          <span
            className={
              transparente
                ? "leading-none text-pedra-sabao"
                : "leading-none text-verde-mata dark:text-pedra-sabao"
            }
          >
            <span className="font-wordmark block text-sm uppercase tracking-wide">
              Roteiro
            </span>
            <span className="font-wordmark block text-[10px] uppercase tracking-[0.25em] opacity-80">
              Minas
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => {
            const ativo = linkEstaAtivo(pathname, link.href);
            // Página atual: font-semibold em vez de font-medium - só o
            // peso muda, sem trocar de cor, pra comunicar "aqui" sem
            // gritar.
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={ativo ? "page" : undefined}
                className={
                  transparente
                    ? `font-body hover:text-ocre text-sm text-pedra-sabao transition-colors ${ativo ? "font-semibold" : "font-medium"}`
                    : `font-body hover:text-terracota text-sm text-verde-mata transition-colors dark:text-pedra-sabao ${ativo ? "font-semibold" : "font-medium"}`
                }
              >
                {link.label}
              </Link>
            );
          })}
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
            {LINKS.map((link) => {
              const ativo = linkEstaAtivo(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setAberto(false)}
                  aria-current={ativo ? "page" : undefined}
                  className={
                    transparente
                      ? `font-body border-pedra-sabao/20 text-pedra-sabao border-b py-3 text-sm last:border-b-0 ${ativo ? "font-semibold" : "font-medium"}`
                      : `font-body text-verde-mata border-zinc-200/60 border-b py-3 text-sm last:border-b-0 dark:text-pedra-sabao dark:border-zinc-800/60 ${ativo ? "font-semibold" : "font-medium"}`
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
