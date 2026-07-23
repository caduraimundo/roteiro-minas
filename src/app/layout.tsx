import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Oswald, Mulish } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fontes da marca (Claude Design) - disponíveis via font-display/font-body,
// ainda não aplicadas em nenhuma tela (próximos cards).
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Fonte só do wordmark "Roteiro Minas" (não usar em headings/corpo -
// aqueles continuam Oswald/Mulish via font-display/font-body).
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
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} ${mulish.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
