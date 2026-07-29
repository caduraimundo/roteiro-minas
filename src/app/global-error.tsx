"use client";

import "./globals.css";

/**
 * Substitui o root layout inteiro quando um erro não tratado acontece em
 * runtime (ex: env var crítica ausente) - por isso precisa das próprias
 * tags <html>/<body>, não pode assumir que src/app/layout.tsx renderizou.
 * Sem "modo degradado": não promete funcionamento parcial do site.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-xl font-semibold">Algo deu errado</h1>
          <p className="text-verde-mata/70 text-sm">
            Não foi possível carregar o Roteiro Minas agora. Tente novamente
            em alguns instantes.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="font-display bg-terracota hover:bg-terracota/90 text-pedra-sabao rounded-2xl px-5 py-3 text-sm font-semibold tracking-wide uppercase transition-colors"
          >
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
