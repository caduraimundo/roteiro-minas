import Link from "next/link";

// Mesma caixa do botão de hambúrguer do GlobalNav (h-10 w-10 rounded-xl
// border) - ícone de seta SVG (traço fino, currentColor), no lugar do
// caractere "←" de texto solto. Inspirado no ícone de voltar do Airbnb,
// mas na caixa quadrada em vez de círculo.
export function BackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Voltar"
      className="text-verde-mata flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 dark:text-pedra-sabao"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M19 12H5M11 18l-6-6 6-6" />
      </svg>
    </Link>
  );
}
