import Image from "next/image";
import Link from "next/link";

// Cabeçalho "sem distração" do checkout: só logo + selo de confiança,
// sem os links de navegação global (Home/Roteiros/Sobre/Contato) do
// GlobalNav - padrão comum em fluxos de pagamento, pra não desviar a
// atenção da pessoa no meio da compra. Sem estado (não precisa de
// "use client").
export function CheckoutHeader() {
  return (
    <header className="border-pedra-sabao bg-ocre/95 relative z-30 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-8 py-5">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.webp"
            alt="Roteiro Minas"
            width={36}
            height={36}
            className="border-pedra-sabao rounded-full border"
          />
          <span className="font-wordmark text-verde-mata text-sm uppercase tracking-wide">
            Roteiro Minas
          </span>
        </Link>

        <span className="font-body text-verde-mata/60 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Ambiente seguro
        </span>
      </div>
    </header>
  );
}
