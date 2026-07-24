"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

// Roteiros mora em /admin (não existe /admin/roteiros index, só
// /admin/roteiros/[id] e /admin/roteiros/novo) - por isso o match dele é
// especial (raiz exata OU prefixo /admin/roteiros), diferente dos demais
// que só checam prefixo do próprio segmento. Sem essa distinção, um
// match de prefixo ingênuo em "/admin" acenderia todos os links ao mesmo
// tempo, já que todas as rotas do painel começam com "/admin".
const LINKS = [
  {
    href: "/admin",
    label: "Roteiros",
    match: (pathname: string) =>
      pathname === "/admin" || pathname.startsWith("/admin/roteiros"),
  },
  {
    href: "/admin/vendas",
    label: "Vendas",
    match: (pathname: string) => pathname.startsWith("/admin/vendas"),
  },
  {
    href: "/admin/cupons",
    label: "Cupons",
    match: (pathname: string) => pathname.startsWith("/admin/cupons"),
  },
  {
    href: "/admin/relatorio",
    label: "Relatório",
    match: (pathname: string) => pathname.startsWith("/admin/relatorio"),
  },
  {
    href: "/admin/custos",
    label: "Custos",
    match: (pathname: string) => pathname.startsWith("/admin/custos"),
  },
  {
    href: "/admin/configuracoes",
    label: "Configurações",
    match: (pathname: string) => pathname.startsWith("/admin/configuracoes"),
  },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((link) => {
        const ativo = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={ativo ? "page" : undefined}
            className={`font-body rounded-xl px-4 py-2.5 text-sm transition-colors ${
              ativo
                ? "bg-pedra-sabao/15 text-pedra-sabao font-bold"
                : "text-pedra-sabao/80 hover:bg-pedra-sabao/10 font-medium"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Wordmark() {
  return (
    <Link href="/admin" className="flex items-center gap-3">
      <Image
        src="/logo.webp"
        alt="Roteiro Minas"
        width={36}
        height={36}
        className="border-pedra-sabao/40 rounded-full border"
      />
      <span className="text-pedra-sabao leading-none">
        <span className="font-wordmark block text-sm uppercase tracking-wide">
          Roteiro
        </span>
        <span className="font-wordmark block text-[10px] uppercase tracking-[0.25em] opacity-80">
          Minas
        </span>
      </span>
    </Link>
  );
}

// Mesma caixa quadrada de esquinas arredondadas (h-10 w-10 rounded-xl
// border) usada no botão de hambúrguer do GlobalNav e no BackButton do
// site público - mantém o hambúrguer do admin consistente com o resto
// da plataforma em vez de inventar um ícone novo.
function HamburgerButton({
  aberto,
  onClick,
}: {
  aberto: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aberto ? "Fechar menu" : "Abrir menu"}
      aria-expanded={aberto}
      className="text-verde-mata flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-300 lg:hidden"
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
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="bg-ocre flex min-h-dvh w-full">
      {/* Sidebar desktop - fixa à esquerda, sempre visível a partir de lg. */}
      <aside className="bg-terracota hidden w-64 shrink-0 flex-col gap-8 p-6 lg:flex">
        <Wordmark />
        <NavLinks />
      </aside>

      {/* Sidebar mobile - mesmo conteúdo, como painel deslizante sobre um
          overlay escuro, só existe no DOM enquanto aberta. */}
      {menuAberto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuAberto(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="bg-terracota relative flex h-full w-64 flex-col gap-8 p-6">
            <Wordmark />
            <NavLinks onNavigate={() => setMenuAberto(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 p-6">
          <HamburgerButton
            aberto={menuAberto}
            onClick={() => setMenuAberto((atual) => !atual)}
          />
          <div className="ml-auto">
            <LogoutButton />
          </div>
        </header>

        <main className="flex flex-1 flex-col px-6 pb-6">
          <div className="min-h-full flex-1 rounded-2xl bg-white">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
