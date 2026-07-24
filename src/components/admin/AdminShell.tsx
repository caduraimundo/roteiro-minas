"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8Z" />
      <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

function LayoutGridIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}

function CalendarCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 12.5 12.5 20a2 2 0 0 1-2.83 0l-6.67-6.67a2 2 0 0 1 0-2.83L10.5 3H20v9.5Z" />
      <circle cx="15.5" cy="7.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 20V10M12 20V4M20 20v-7" />
      <path d="M2 20h20" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3" />
      <path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1h-5a2.5 2.5 0 0 1 0-5h5a1 1 0 0 0 1-1" />
      <circle cx="16.5" cy="14.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Roteiros mora em /admin (não existe /admin/roteiros index, só
// /admin/roteiros/[id] e /admin/roteiros/novo) - por isso o match dele é
// especial (raiz exata OU prefixo /admin/roteiros), diferente dos demais
// que só checam prefixo do próprio segmento. Sem essa distinção, um
// match de prefixo ingênuo em "/admin" acenderia todos os links ao mesmo
// tempo, já que todas as rotas do painel começam com "/admin".
//
// Um único array, na ordem visual completa (MENU + GERAL) - a divisão em
// seções na sidebar é só de apresentação (ver MENU_LINKS/GERAL_LINKS
// abaixo), não motivo pra duplicar a lógica de match().
const LINKS = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutGridIcon,
    match: (pathname: string) => pathname === "/admin/dashboard",
  },
  {
    href: "/admin",
    label: "Roteiros",
    icon: MapIcon,
    match: (pathname: string) =>
      pathname === "/admin" || pathname.startsWith("/admin/roteiros"),
  },
  {
    href: "/admin/vendas",
    label: "Vendas",
    icon: CalendarCheckIcon,
    match: (pathname: string) => pathname.startsWith("/admin/vendas"),
  },
  {
    href: "/admin/cupons",
    label: "Cupons",
    icon: TagIcon,
    match: (pathname: string) => pathname.startsWith("/admin/cupons"),
  },
  {
    href: "/admin/relatorio",
    label: "Relatório",
    icon: BarChartIcon,
    match: (pathname: string) => pathname.startsWith("/admin/relatorio"),
  },
  {
    href: "/admin/custos",
    label: "Custos",
    icon: WalletIcon,
    match: (pathname: string) => pathname.startsWith("/admin/custos"),
  },
  {
    href: "/admin/configuracoes",
    label: "Configurações",
    icon: SettingsIcon,
    match: (pathname: string) => pathname.startsWith("/admin/configuracoes"),
  },
] as const;

const MENU_LINKS = LINKS.slice(0, 6);
const GERAL_LINKS = LINKS.slice(6);

// Rótulo de seção (MENU/GERAL) - mesmo tratamento tipográfico do
// mockup (versalete pequeno, tracking largo, tom apagado), só na cor de
// marca em vez do cinza-esverdeado original.
function RotuloSecao({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-body text-terracota/50 px-3 pt-2 pb-1 text-[11px] font-semibold tracking-[0.12em] uppercase">
      {children}
    </div>
  );
}

function NavLinks({
  links,
  onNavigate,
}: {
  links: readonly (typeof LINKS)[number][];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const ativo = link.match(pathname);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={ativo ? "page" : undefined}
            className={`font-body flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors ${
              ativo
                ? "bg-verde-mata text-pedra-sabao font-semibold"
                : "text-terracota hover:bg-pedra-sabao/60 font-medium"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarConteudo({
  onNavigate,
  onLogout,
}: {
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <Link href="/admin" className="flex items-center gap-3 px-1 pb-2">
        <Image
          src="/logo.webp"
          alt="Roteiro Minas"
          width={36}
          height={36}
          className="border-terracota/15 rounded-full border"
        />
        <span className="text-terracota leading-none">
          <span className="font-wordmark block text-sm uppercase tracking-wide">
            Roteiro
          </span>
          <span className="font-wordmark block text-[10px] uppercase tracking-[0.25em] opacity-70">
            Minas
          </span>
        </span>
      </Link>

      <div className="flex flex-col">
        <RotuloSecao>Menu</RotuloSecao>
        <NavLinks links={MENU_LINKS} onNavigate={onNavigate} />
      </div>

      <div className="mt-auto flex flex-col">
        <RotuloSecao>Geral</RotuloSecao>
        <NavLinks links={GERAL_LINKS} onNavigate={onNavigate} />
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            onLogout();
          }}
          className="font-body text-terracota hover:bg-pedra-sabao/60 flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors"
        >
          <LogOutIcon className="h-4 w-4 shrink-0" />
          Sair
        </button>
      </div>
    </>
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
      className="text-terracota flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-300 lg:hidden"
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

function iniciaisDoEmail(email: string): string {
  if (!email) return "RM";
  return email.slice(0, 2).toUpperCase();
}

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);

  // "Sair" aparece em dois lugares com apresentação diferente (item de
  // menu na sidebar, item de dropdown no header) - nenhum é uma pílula
  // solta, por isso a lógica vive aqui em vez de num componente próprio.
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="bg-pedra-sabao flex min-h-dvh w-full gap-4 p-4">
      {/* Sidebar desktop - fixa à esquerda, sempre visível a partir de lg. */}
      <aside className="bg-ocre hidden w-64 shrink-0 flex-col gap-6 rounded-3xl p-5 lg:flex">
        <SidebarConteudo onLogout={handleLogout} />
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
          <aside className="bg-ocre relative flex h-full w-64 flex-col gap-6 p-5">
            <SidebarConteudo
              onNavigate={() => setMenuAberto(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <header className="bg-ocre flex items-center gap-3 rounded-3xl p-3">
          <HamburgerButton
            aberto={menuAberto}
            onClick={() => setMenuAberto((atual) => !atual)}
          />

          {/* Busca - só a UI por enquanto, sem filtro real ainda (entra
              junto com o redesign da tela de Roteiros). */}
          <div className="bg-pedra-sabao flex max-w-md flex-1 items-center gap-2.5 rounded-2xl px-4 py-2.5">
            <SearchIcon className="text-terracota/50 h-[19px] w-[19px] shrink-0" />
            <input
              type="search"
              placeholder="Buscar roteiro"
              className="font-body text-terracota placeholder:text-terracota/40 w-full min-w-0 bg-transparent text-sm outline-none"
            />
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            {/* Sino de notificação - decorativo por enquanto (ícone +
                indicador), sem dropdown com conteúdo real ainda. */}
            <button
              type="button"
              aria-label="Notificações"
              className="bg-pedra-sabao text-terracota relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            >
              <BellIcon className="h-5 w-5" />
              <span className="border-pedra-sabao bg-verde-mata absolute top-2.5 right-2.5 h-2 w-2 rounded-full border-2" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setPerfilAberto((atual) => !atual)}
                aria-expanded={perfilAberto}
                className="flex items-center gap-2.5 rounded-2xl py-1 pr-1 pl-1"
              >
                <span className="bg-verde-mata text-pedra-sabao flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                  {iniciaisDoEmail(email)}
                </span>
                <span className="font-body text-terracota hidden max-w-[14rem] truncate text-sm font-semibold sm:block">
                  {email}
                </span>
                <ChevronDownIcon className="text-terracota/50 hidden h-4 w-4 shrink-0 sm:block" />
              </button>

              {perfilAberto && (
                <>
                  <button
                    type="button"
                    aria-label="Fechar menu"
                    onClick={() => setPerfilAberto(false)}
                    className="fixed inset-0 z-40"
                  />
                  <div className="absolute top-14 right-0 z-50 w-56 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-lg">
                    <Link
                      href="/admin/configuracoes"
                      onClick={() => setPerfilAberto(false)}
                      className="font-body text-terracota hover:bg-ocre flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
                    >
                      <SettingsIcon className="h-4 w-4 shrink-0" />
                      Configurações
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setPerfilAberto(false);
                        handleLogout();
                      }}
                      className="font-body text-terracota hover:bg-ocre flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors"
                    >
                      <LogOutIcon className="h-4 w-4 shrink-0" />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          <div className="min-h-full flex-1 rounded-2xl bg-white">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
