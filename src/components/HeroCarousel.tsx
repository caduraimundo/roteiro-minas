"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TexturaTopografica } from "@/components/TexturaTopografica";

// Fotos reais de passeios (trilha/mirante e cachoeiras) - substituem os
// blocos de cor sólida usados como placeholder até aqui.
const SLIDES = ["/hero/hero-1.jpg", "/hero/hero-2.jpg", "/hero/hero-3.jpg"];
const INTERVALO_MS = 5500;

export function HeroCarousel() {
  const [indiceAtivo, setIndiceAtivo] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndiceAtivo((atual) => (atual + 1) % SLIDES.length);
    }, INTERVALO_MS);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex h-[60vh] min-h-[360px] w-full items-center justify-center overflow-hidden">
      {SLIDES.map((src, indice) => (
        <div
          key={src}
          aria-hidden={indice !== indiceAtivo}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            indice === indiceAtivo ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={indice === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      {/* Escurece por cima de qualquer slide - opacidade subiu de 45%
          pra 60% ao trocar cor sólida por foto real: fotos têm bem mais
          ruído visual (céu claro, água, luz) que os blocos de cor lisa
          de antes, e o texto claro (pedra-sabao) fixo por cima precisa
          de mais contraste garantido pra continuar legível. */}
      <div className="absolute inset-0 bg-verde-mata/60" />

      <TexturaTopografica variant="fundo" className="opacity-60" />

      {/* Texto fixo - não muda com o slide, só o fundo troca. */}
      <div className="relative z-10 flex flex-col items-center gap-3 px-8 text-center text-pedra-sabao">
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
          className="font-display bg-terracota hover:bg-terracota/90 mt-2 rounded-lg px-6 py-3 text-sm font-semibold tracking-wide uppercase text-pedra-sabao transition-colors"
        >
          Ver próximos roteiros
        </Link>
      </div>
    </div>
  );
}
