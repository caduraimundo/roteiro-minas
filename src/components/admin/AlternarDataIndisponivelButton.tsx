"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AlternarDataIndisponivelButton({
  id,
  ativo,
}: {
  id: string;
  ativo: boolean;
}) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleClick() {
    setErro(null);
    setEnviando(true);

    const resposta = await fetch(
      `/api/admin/roteiro-datas-indisponiveis/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !ativo }),
      },
    );

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      setErro(corpo?.erro ?? "Erro ao atualizar data indisponível.");
      setEnviando(false);
      return;
    }

    setEnviando(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={enviando}
        className="font-body text-terracota self-start rounded-2xl border border-zinc-300 px-3 py-1 text-xs font-medium disabled:opacity-50"
      >
        {enviando ? "Salvando..." : ativo ? "Desbloquear" : "Bloquear"}
      </button>
      {erro && <p className="font-body text-xs text-red-600">{erro}</p>}
    </div>
  );
}
