"use client";

import { useState } from "react";

type Cupom = {
  id: string;
  codigo: string;
  roteiro_id: string;
  percentual_desconto: number;
  ativo: boolean;
};

type RoteiroResumo = { id: string; nome: string };

const campoClasse =
  "font-body text-terracota rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-verde-mata";
const labelClasse =
  "font-body text-terracota flex flex-col gap-1 text-xs font-medium";

function PencilIcon({ className }: { className?: string }) {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function PowerIcon({ className }: { className?: string }) {
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
      <path d="M12 3v8" />
      <path d="M6.3 6.3a8 8 0 1 0 11.4 0" />
    </svg>
  );
}

export function CupomLinha({
  cupom,
  roteiros,
  onAtualizado,
}: {
  cupom: Cupom;
  roteiros: RoteiroResumo[];
  onAtualizado: (cupom: Cupom) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [codigo, setCodigo] = useState(cupom.codigo);
  const [roteiroId, setRoteiroId] = useState(cupom.roteiro_id);
  const [percentual, setPercentual] = useState(
    String(cupom.percentual_desconto),
  );
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const roteiroNome =
    roteiros.find((roteiro) => roteiro.id === cupom.roteiro_id)?.nome ??
    "Roteiro desconhecido";

  function cancelarEdicao() {
    setCodigo(cupom.codigo);
    setRoteiroId(cupom.roteiro_id);
    setPercentual(String(cupom.percentual_desconto));
    setErro(null);
    setEditando(false);
  }

  async function salvarEdicao(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    const resposta = await fetch(`/api/admin/cupons/${cupom.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo,
        roteiro_id: roteiroId,
        percentual_desconto: Number(percentual),
      }),
    });

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      setErro(corpo?.erro ?? "Erro ao editar cupom.");
      setEnviando(false);
      return;
    }

    setEnviando(false);
    setEditando(false);
    onAtualizado(corpo.cupom);
  }

  async function alternarAtivo() {
    setErro(null);
    setEnviando(true);

    const resposta = await fetch(`/api/admin/cupons/${cupom.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !cupom.ativo }),
    });

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      setErro(corpo?.erro ?? "Erro ao pausar/despausar cupom.");
      setEnviando(false);
      return;
    }

    setEnviando(false);
    onAtualizado(corpo.cupom);
  }

  if (editando) {
    return (
      <tr className="font-body border-t border-zinc-100 text-sm">
        <td colSpan={5} className="px-4 py-4">
          <form onSubmit={salvarEdicao} className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-3">
              <label className={labelClasse}>
                Código
                <input
                  type="text"
                  required
                  value={codigo}
                  onChange={(evento) => setCodigo(evento.target.value)}
                  className={campoClasse}
                />
              </label>

              <label className={labelClasse}>
                Roteiro
                <select
                  value={roteiroId}
                  onChange={(evento) => setRoteiroId(evento.target.value)}
                  className={campoClasse}
                >
                  {roteiros.map((roteiro) => (
                    <option key={roteiro.id} value={roteiro.id}>
                      {roteiro.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClasse}>
                Desconto (%)
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  step="1"
                  value={percentual}
                  onChange={(evento) => setPercentual(evento.target.value)}
                  className={campoClasse}
                />
              </label>
            </div>

            {erro && <p className="font-body text-sm text-red-600">{erro}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={enviando}
                className="font-body bg-verde-mata text-pedra-sabao rounded-2xl px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
              >
                {enviando ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={cancelarEdicao}
                disabled={enviando}
                className="font-body text-terracota rounded-2xl border border-zinc-300 px-4 py-1.5 text-xs font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="font-body border-t border-zinc-100 text-sm">
      <td className="px-4 py-4">
        <span className="text-terracota bg-pedra-sabao rounded-lg px-2.5 py-1 font-mono text-xs font-bold">
          {cupom.codigo}
        </span>
      </td>
      <td className="text-terracota/70 px-4 py-4 font-medium">
        {roteiroNome}
      </td>
      <td className="text-terracota px-4 py-4 font-semibold">
        {cupom.percentual_desconto}%
      </td>
      <td className="px-4 py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            cupom.ativo
              ? "bg-verde-mata/10 text-verde-mata"
              : "bg-pedra-sabao text-terracota/60"
          }`}
        >
          {cupom.ativo ? "Ativo" : "Pausado"}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          {erro && (
            <span className="font-body text-xs text-red-600">{erro}</span>
          )}
          <button
            type="button"
            onClick={() => setEditando(true)}
            aria-label={`Editar cupom ${cupom.codigo}`}
            className="text-terracota flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={alternarAtivo}
            disabled={enviando}
            aria-label={
              cupom.ativo
                ? `Pausar cupom ${cupom.codigo}`
                : `Despausar cupom ${cupom.codigo}`
            }
            className="text-terracota flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white disabled:opacity-50"
          >
            <PowerIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
