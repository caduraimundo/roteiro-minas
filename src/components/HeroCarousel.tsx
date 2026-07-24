import Image from "next/image";
import Link from "next/link";
import { TexturaTopografica } from "@/components/TexturaTopografica";

// Só uma foto agora (hero-1.jpg, escolhida como a melhor das três) - sem
// carrossel, sem estado/interval, Server Component puro. hero-2/hero-3
// saíram de public/hero (não usados em lugar nenhum).
export function HeroCarousel() {
  return (
    <div className="relative flex h-[52vh] min-h-[380px] w-full items-center justify-center overflow-hidden">
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

      {/* Texto fixo - gap um pouco maior (4 em vez de 3) e mais respiro
          antes do CTA (mt-3 em vez de mt-2): a altura do hero caiu de
          60vh pra 52vh (menos vão vazio sobrando abaixo do botão), e a
          pilha central ganha uma respiração um pouco mais generosa pra
          preencher melhor o espaço, sem exagerar. */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-8 text-center text-pedra-sabao">
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
