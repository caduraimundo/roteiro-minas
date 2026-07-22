import Link from "next/link";

// Sobreposto ao hero (fundo degradê, sem cor sólida) - não existe asset de
// logo real ainda, então o ícone é um mark em SVG com os tokens da marca
// em vez de <img>, mesmo padrão já adotado pro carrossel de cor da Home.
export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-verde-mata to-verde-mata/0">
      <div className="mx-auto flex w-full max-w-5xl items-center px-8 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-pedra-sabao/50 bg-verde-mata">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 18l6-9 4 5 3-4 5 8H3z" fill="#c25a2c" />
              <circle cx="8" cy="7" r="2" fill="#ede8dd" />
            </svg>
          </span>
          <span className="font-display leading-none text-pedra-sabao">
            <span className="block text-sm font-semibold uppercase tracking-wide">
              Roteiro
            </span>
            <span className="block text-[10px] font-normal uppercase tracking-[0.25em] opacity-80">
              Minas
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}
