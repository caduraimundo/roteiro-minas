import Link from "next/link";

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

// Link de "voltar" pra navegação de drill-down (roteiro -> vaga,
// lista/novo -> pai) - server-safe, sem "use client". `className`
// permite acrescentar classes extras (ex: print:hidden em telas
// impressas) sem precisar de uma prop dedicada só pra isso.
export function VoltarLink({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`font-body text-terracota/60 hover:text-terracota flex w-fit items-center gap-1.5 text-sm font-medium transition-colors ${className}`}
    >
      <ChevronLeftIcon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}
