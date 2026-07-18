"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Roteiro } from "@/data/roteiros";

const RUBRICAS_TIPO: Record<Roteiro["tipo"], string> = {
  fixo: "Fixo",
  personalizado: "Personalizado",
};

const campoClasse =
  "rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700";

export function RoteiroCabecalho({ roteiro }: { roteiro: Roteiro }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(roteiro.nome);
  const [descricao, setDescricao] = useState(roteiro.descricao ?? "");
  const [tipo, setTipo] = useState<Roteiro["tipo"]>(roteiro.tipo);
  const [pdfUrl, setPdfUrl] = useState(roteiro.pdf_url ?? "");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function cancelarEdicao() {
    setNome(roteiro.nome);
    setDescricao(roteiro.descricao ?? "");
    setTipo(roteiro.tipo);
    setPdfUrl(roteiro.pdf_url ?? "");
    setErro(null);
    setEditando(false);
  }

  async function salvarEdicao(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    const resposta = await fetch(`/api/admin/roteiros/${roteiro.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        descricao: descricao || null,
        tipo,
        pdf_url: pdfUrl || null,
      }),
    });

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      setErro(corpo?.erro ?? "Erro ao editar roteiro.");
      setEnviando(false);
      return;
    }

    setEnviando(false);
    setEditando(false);
    router.refresh();
  }

  async function alternarAtivo() {
    setErro(null);
    setEnviando(true);

    const resposta = await fetch(`/api/admin/roteiros/${roteiro.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !roteiro.ativo }),
    });

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      setErro(corpo?.erro ?? "Erro ao pausar/despausar roteiro.");
      setEnviando(false);
      return;
    }

    setEnviando(false);
    router.refresh();
  }

  if (editando) {
    return (
      <form onSubmit={salvarEdicao} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Nome
          <input
            type="text"
            required
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            className={campoClasse}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Tipo
          <select
            value={tipo}
            onChange={(evento) =>
              setTipo(evento.target.value as Roteiro["tipo"])
            }
            className={campoClasse}
          >
            <option value="fixo">Fixo</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Descrição
          <textarea
            value={descricao}
            onChange={(evento) => setDescricao(evento.target.value)}
            rows={4}
            className={campoClasse}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          URL do PDF
          <input
            type="text"
            value={pdfUrl}
            onChange={(evento) => setPdfUrl(evento.target.value)}
            className={campoClasse}
          />
        </label>

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={enviando}
            className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            {enviando ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={cancelarEdicao}
            disabled={enviando}
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm dark:border-zinc-700"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">{roteiro.nome}</h1>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {RUBRICAS_TIPO[roteiro.tipo]}
          </span>
        </div>

        {!roteiro.ativo && (
          <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Pausado
          </span>
        )}
      </div>

      {roteiro.descricao && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {roteiro.descricao}
        </p>
      )}

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="rounded-full border border-zinc-300 px-5 py-2 text-sm dark:border-zinc-700"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={alternarAtivo}
          disabled={enviando}
          className="rounded-full border border-zinc-300 px-5 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
        >
          {roteiro.ativo ? "Pausar" : "Despausar"}
        </button>
      </div>
    </div>
  );
}
