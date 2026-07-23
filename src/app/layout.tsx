import type { Metadata } from "next";
import { Geist, Geist_Mono, Mulish } from "next/font/google";
import localFont from "next/font/local";
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
// aqueles continuam Mulish via font-display/font-body). Substitui a
// Fraunces (Google Fonts) - TAN Headline é uma fonte licenciada, arquivo
// local em src/fonts, sem variantes de peso/eixo (só o Regular).
const tanHeadline = localFont({
  src: "../fonts/TANHEADLINE-Regular.otf",
  variable: "--font-tan-headline",
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
      className={`${geistSans.variable} ${geistMono.variable} ${mulish.variable} ${tanHeadline.variable} antialiased`}
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
