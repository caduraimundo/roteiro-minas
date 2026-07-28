import Image from "next/image";
import Link from "next/link";
import { TexturaTopografica } from "@/components/TexturaTopografica";

// Só uma foto (hero-1.jpg) - sem carrossel, sem estado/interval, Server
// Component puro. Layout "texto à esquerda, foto visível à direita":
// como só temos uma foto de fundo (cobrindo o hero inteiro, sem recorte
// em coluna separada), o efeito é reproduzido com um gradiente escuro
// da esquerda (garante contraste pro texto) pra direita (foto visível
// sem véu).
export function HeroCarousel() {
  return (
    <div className="bg-verde-mata relative flex min-h-[560px] w-full flex-col overflow-hidden">
      <Image
        src="/hero/hero-1.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />

      <TexturaTopografica variant="fundo" className="opacity-40" />

      {/* Espaçador reservando a altura do GlobalNav (variante
          "transparente", overlay absoluto - não empurra conteúdo por
          conta própria). Mesma lógica/altura já validada em produção na
          Etapa 1: h-24 cobre o header (py-4 + botão de hambúrguer h-10)
          com folga de segurança. */}
      <div aria-hidden="true" className="h-24 shrink-0" />

      <div className="relative z-10 flex flex-1 items-center">
        <div className="text-pedra-sabao mx-auto flex w-full max-w-5xl flex-col items-start gap-5 px-8 pb-16">
          <span className="font-body border-pedra-sabao/30 bg-pedra-sabao/10 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.15em] uppercase">
            <span
              className="bg-ocre h-1.5 w-1.5 rounded-full"
              aria-hidden="true"
            />
            Ecoturismo em Minas Gerais
          </span>

          <h1 className="font-display max-w-xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Trilhas e cachoeiras de Minas Gerais
          </h1>

          <p className="font-body max-w-md text-base sm:text-lg">
            Passeios guiados de ecoturismo em Ouro Preto e Mariana, com
            reserva online e ingresso na hora.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/roteiros"
              className="font-display bg-terracota hover:bg-terracota/90 text-pedra-sabao rounded-2xl px-6 py-3 text-sm font-semibold tracking-wide uppercase transition-colors"
            >
              Ver próximos roteiros
            </Link>
            <a
              href="#incluso"
              className="font-display border-pedra-sabao/40 bg-pedra-sabao/10 hover:bg-pedra-sabao/20 text-pedra-sabao rounded-2xl border px-6 py-3 text-sm font-semibold tracking-wide uppercase transition-colors"
            >
              Como funciona
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
