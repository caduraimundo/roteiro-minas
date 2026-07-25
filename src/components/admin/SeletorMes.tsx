"use client";

export function SeletorMes({
  mes,
  onChange,
}: {
  mes: string;
  onChange: (evento: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type="month"
      aria-label="Mês"
      value={mes}
      onChange={onChange}
      className="font-body text-terracota bg-pedra-sabao w-fit rounded-2xl px-4 py-2.5 text-sm outline-none"
    />
  );
}
