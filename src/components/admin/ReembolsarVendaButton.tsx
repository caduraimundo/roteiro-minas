"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReembolsarVendaButton({ vendaId }: { vendaId: string }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleClick() {
    const confirmado = window.confirm(
      "Marcar essa venda como reembolsada? Isso libera a vaga de volta.",
    );
    if (!confirmado) return;

    setErro(null);
    setEnviando(true);

    const resposta = await fetch(`/api/admin/vendas/${vendaId}/reembolsar`, {
      method: "PATCH",
    });

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      setErro(corpo?.erro ?? "Erro ao reembolsar venda.");
      setEnviando(false);
      return;
    }

    setEnviando(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={enviando}
        className="font-body self-start rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 disabled:opacity-50"
      >
        {enviando ? "Reembolsando..." : "Reembolsar"}
      </button>
      {erro && <p className="font-body text-xs text-red-600">{erro}</p>}
    </div>
  );
}
