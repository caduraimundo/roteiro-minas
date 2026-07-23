import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Mulish } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fonte única pra heading e corpo (Oswald removido - decisão de reduzir
// a plataforma pra 2 fontes). 800 incluído à parte pros headings
// (font-display), que agora dependem só de peso/tamanho pra manter
// contraste com o corpo (font-body), já que são a mesma família.
const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Fonte só do wordmark "Roteiro Minas" (não usar em headings/corpo -
// aqueles continuam Mulish via font-display/font-body).
// `weight: "variable"` é obrigatório pro next/font aceitar `axes`
// (erro de build confirmado ao tentar fixar weight: "700" junto com
// axes) - os valores de SOFT/WONK/opsz/wght ficam todos por conta da
// classe .font-wordmark em globals.css via font-variation-settings.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "Roteiro Minas",
  description:
    "Venda de ingressos para passeios de ecoturismo em Ouro Preto/Mariana, MG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${mulish.variable} ${fraunces.variable} antialiased`}
    >
      {/* min-h-dvh (não min-h-full) - no mobile, a barra de endereço
          aparente/some durante o scroll, e min-h-full baseado em % herda
          a "large viewport" (barra recolhida), maior que o que está
          visível no carregamento inicial. Isso deixava o rodapé sobrando
          espaço abaixo do fold real no mobile (só lá, o desktop não tem
          barra dinâmica). dvh acompanha o viewport visível de verdade. */}
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
