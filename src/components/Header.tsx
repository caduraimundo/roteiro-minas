import Image from "next/image";
import Link from "next/link";

// Sobreposto ao hero (fundo degradê, sem cor sólida).
export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-verde-mata to-verde-mata/0">
      <div className="mx-auto flex w-full max-w-5xl items-center px-8 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.webp"
            alt="Roteiro Minas"
            width={36}
            height={36}
            className="rounded-full border border-pedra-sabao/50"
          />
          <span className="leading-none text-pedra-sabao">
            <span className="font-wordmark block text-sm uppercase tracking-wide">
              Roteiro
            </span>
            <span className="font-wordmark block text-[10px] uppercase tracking-[0.25em] opacity-80">
              Minas
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}
