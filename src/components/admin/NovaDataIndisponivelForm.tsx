"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const campoClasse =
  "rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700";

export function NovaDataIndisponivelForm({
  roteiroId,
}: {
  roteiroId: string;
}) {
  const router = useRouter();
  const [data, setData] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    const resposta = await fetch("/api/admin/roteiro-datas-indisponiveis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roteiro_id: roteiroId,
        data,
      }),
    });

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      setErro(corpo?.erro ?? "Erro ao bloquear data.");
      setEnviando(false);
      return;
    }

    setData("");
    setEnviando(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="font-semibold">Bloquear data</h2>

      <label className="flex flex-col gap-1 text-sm">
        Data
        <input
          type="date"
          required
          value={data}
          onChange={(evento) => setData(evento.target.value)}
          className={campoClasse}
        />
      </label>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {enviando ? "Bloqueando..." : "Bloquear data"}
      </button>
    </form>
  );
}
