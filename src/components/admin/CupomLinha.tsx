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
  "rounded-lg border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700";

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
      <tr className="border-t border-zinc-200 dark:border-zinc-800">
        <td colSpan={4} className="py-2">
          <form onSubmit={salvarEdicao} className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1 text-xs">
                Código
                <input
                  type="text"
                  required
                  value={codigo}
                  onChange={(evento) => setCodigo(evento.target.value)}
                  className={campoClasse}
                />
              </label>

              <label className="flex flex-col gap-1 text-xs">
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

              <label className="flex flex-col gap-1 text-xs">
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

            {erro && <p className="text-sm text-red-600">{erro}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={enviando}
                className="rounded-full bg-foreground px-4 py-1 text-xs font-medium text-background disabled:opacity-50"
              >
                {enviando ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={cancelarEdicao}
                disabled={enviando}
                className="rounded-full border border-zinc-300 px-4 py-1 text-xs dark:border-zinc-700"
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
    <tr className="border-t border-zinc-200 dark:border-zinc-800">
      <td className="py-2">{cupom.codigo}</td>
      <td className="py-2">{roteiroNome}</td>
      <td className="py-2">{cupom.percentual_desconto}%</td>
      <td className="py-2">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {!cupom.ativo && (
            <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Pausado
            </span>
          )}
          {erro && <span className="text-xs text-red-600">{erro}</span>}
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-700"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={alternarAtivo}
            disabled={enviando}
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs disabled:opacity-50 dark:border-zinc-700"
          >
            {cupom.ativo ? "Pausar" : "Despausar"}
          </button>
        </div>
      </td>
    </tr>
  );
}
