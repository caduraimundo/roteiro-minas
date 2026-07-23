"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TexturaTopografica } from "@/components/TexturaTopografica";

// Sem foto real ainda (nenhum campo de imagem existe em roteiros/vagas,
// nenhum asset de foto no projeto) - decisão registrada com o Cadu:
// blocos de cor sólidos da paleta como "slides" do carrossel, trocados
// por fotos de verdade quando existirem.
const SLIDES = ["bg-verde-mata", "bg-terracota", "bg-ocre", "bg-pedra-sabao"];
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
      {SLIDES.map((cor, indice) => (
        <div
          key={cor}
          aria-hidden={indice !== indiceAtivo}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${cor} ${
            indice === indiceAtivo ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Escurece por cima de qualquer slide (inclusive o claro,
          pedra-sabão) pra garantir contraste do texto claro fixo abaixo. */}
      <div className="absolute inset-0 bg-verde-mata/45" />

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
          Ver próximos roteiros →
        </Link>
      </div>
    </div>
  );
}
