import Image from "next/image";
import Link from "next/link";
import { TexturaTopografica } from "@/components/TexturaTopografica";

// Só uma foto agora (hero-1.jpg, escolhida como a melhor das três) - sem
// carrossel, sem estado/interval, Server Component puro. hero-2/hero-3
// saíram de public/hero (não usados em lugar nenhum).
export function HeroCarousel() {
  return (
    <div className="relative flex h-[52dvh] max-h-[540px] min-h-[420px] w-full flex-col overflow-hidden">
      <Image
        src="/hero/hero-1.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Overlay quase-preto (não mais verde-mata) - prioridade aqui é
          legibilidade máxima do texto claro por cima, não reforçar a
          cor de marca. Mesma opacidade (60%) já validada contra o
          ruído visual de foto real, só a cor mudou. */}
      <div className="absolute inset-0 bg-black/60" />

      <TexturaTopografica variant="fundo" className="opacity-60" />

      {/* Espaçador reservando a altura do GlobalNav (variante
          "transparente", overlay absoluto - não empurra conteúdo por
          conta própria). Altura real estimada no mobile: py-4 do header
          (32px) + o botão de hambúrguer h-10 (40px, mais alto que o
          logo de 36px) ≈ 72px. h-24 (96px) dá ~24px de folga de
          segurança, já que não dá pra validar visualmente aqui.
          Antes o texto era centralizado simetricamente no hero
          inteiro (items-center no container de fora) - com padding-top
          simples isso só desloca o conteúdo pela METADE do valor
          adicionado (a caixa centralizada fica mais alta, mas o centro
          dela se desloca só a metade), o que não garante nada contra
          um h1 de altura variável (3 linhas em telas estreitas como
          iPhone SE/13). Esse espaçador é um irmão físico ANTES do bloco
          de texto (flex-col) - o texto nunca pode desenhar acima dele,
          garantido estruturalmente, não por estimativa de
          centralização. */}
      <div aria-hidden="true" className="h-24 shrink-0" />

      {/* Texto centralizado dentro do espaço que sobra (depois do
          espaçador acima), não mais no hero inteiro - resolve a
          sobreposição sem deixar o texto colado no topo em telas
          altas. */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center text-pedra-sabao">
        <span className="font-wordmark text-sm uppercase tracking-[0.1em]">
          Roteiro Minas
        </span>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Trilhas e cachoeiras de Minas Gerais
        </h1>
        <p className="font-body max-w-md text-base sm:text-lg">
          Passeios guiados de ecoturismo em Ouro Preto e Mariana, com reserva
          online e ingresso na hora.
        </p>
        <Link
          href="/roteiros"
          className="font-display bg-terracota hover:bg-terracota/90 mt-3 rounded-lg px-6 py-3 text-sm font-semibold tracking-wide uppercase text-pedra-sabao transition-colors"
        >
          Ver próximos roteiros
        </Link>
      </div>
    </div>
  );
}
