"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LINKS } from "@/lib/nav-links";

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
          : "border-pedra-sabao bg-ocre/95 relative z-30 border-b backdrop-blur"
      }
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-8 py-5">
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
                : "border-pedra-sabao rounded-full border"
            }
          />
          <span
            className={
              transparente
                ? "leading-none text-pedra-sabao"
                : "text-verde-mata leading-none"
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
            // Página atual: pílula de fundo (rounded-xl) em vez de
            // sublinhado - bg-verde-mata/10 na variante solida,
            // bg-pedra-sabao/15 na transparente (mais visível sobre o
            // fundo escuro do hero). px-3 py-2 sempre presente (fundo
            // transparente quando inativo) pra não empurrar o layout
            // quando o link fica ativo.
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={ativo ? "page" : undefined}
                className={
                  transparente
                    ? `font-body hover:text-ocre rounded-xl px-3 py-2 text-sm text-pedra-sabao transition-colors ${ativo ? "bg-pedra-sabao/15 font-bold" : "font-medium"}`
                    : `font-body hover:text-terracota text-verde-mata rounded-xl px-3 py-2 text-sm transition-colors ${ativo ? "bg-verde-mata/10 font-bold" : "font-medium"}`
                }
              >
                {link.label}
              </Link>
            );
          })}
          {/* CTA junto dos links - só aparece com eles (hidden md:flex
              já cobre os dois), mesmo padrão visual do botão primário
              do hero (bg-terracota, rounded-2xl). No mobile fica de
              fora, coberto pelo mesmo link "Roteiros" dentro do menu
              hambúrguer - não duplica CTA num espaço já apertado. */}
          <Link
            href="/roteiros"
            className="font-display bg-terracota hover:bg-terracota/90 text-pedra-sabao ml-2 shrink-0 rounded-2xl px-5 py-2.5 text-sm font-semibold tracking-wide uppercase transition-colors"
          >
            Ver próximos roteiros
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setAberto((atual) => !atual)}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          className={
            transparente
              ? "border-pedra-sabao/50 text-pedra-sabao flex h-10 w-10 items-center justify-center rounded-2xl border md:hidden"
              : "text-verde-mata border-pedra-sabao flex h-10 w-10 items-center justify-center rounded-2xl border md:hidden"
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
              : "border-pedra-sabao bg-ocre/95 border-t backdrop-blur md:hidden"
          }
        >
          <div className="mx-auto flex w-full max-w-5xl flex-col px-8 py-2">
            {LINKS.map((link) => {
              const ativo = linkEstaAtivo(pathname, link.href);
              // Item ativo vira pílula (rounded-xl + fundo), sem o
              // divisor fino que os itens inativos têm entre si -
              // last:border-b-0 continua só nos inativos, já que o
              // ativo nunca mostra esse divisor de qualquer forma.
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setAberto(false)}
                  aria-current={ativo ? "page" : undefined}
                  className={
                    transparente
                      ? `font-body rounded-xl px-3 py-3 text-sm text-pedra-sabao ${
                          ativo
                            ? "bg-pedra-sabao/15 font-bold"
                            : "border-pedra-sabao/20 border-b font-medium last:border-b-0"
                        }`
                      : `font-body text-verde-mata rounded-xl px-3 py-3 text-sm ${
                          ativo
                            ? "bg-verde-mata/10 font-bold"
                            : "border-pedra-sabao/60 border-b font-medium last:border-b-0"
                        }`
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
