"use client";

export function SeletorMes({
  mes,
  onChange,
}: {
  mes: string;
  onChange: (evento: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      Mês
      <input
        type="month"
        value={mes}
        onChange={onChange}
        className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
      />
    </label>
  );
}
