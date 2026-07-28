// Home/Roteiros/Sobre Nós/Contato - as 4 páginas que a navegação global
// cobre nesta rodada (Parte 1). Detalhe/Checkout ficam pra depois.
// Arquivo neutro (sem "use client") pra GlobalNav.tsx (Client Component)
// e Footer.tsx (Server Component) importarem sem um depender do outro -
// import cruzado client -> server passava no build/typecheck mas
// quebrava com 500 em runtime de produção.
export const LINKS = [
  { href: "/", label: "Home" },
  { href: "/roteiros", label: "Roteiros" },
  { href: "/sobre", label: "Sobre Nós" },
  { href: "/contato", label: "Contato" },
] as const;
