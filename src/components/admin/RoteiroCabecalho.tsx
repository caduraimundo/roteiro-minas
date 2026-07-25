"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatarPreco } from "@/lib/format";
import type { Roteiro } from "@/data/roteiros";

const RUBRICAS_TIPO: Record<Roteiro["tipo"], string> = {
  emissivel: "Emissível",
  receptivo: "Receptivo",
};

const campoClasse =
  "font-body text-terracota rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-verde-mata";
const labelClasse =
  "font-body text-terracota flex flex-col gap-1 text-sm font-medium";

export function RoteiroCabecalho({ roteiro }: { roteiro: Roteiro }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const custoPendente = searchParams.get("custo_pendente") === "1";
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(roteiro.nome);
  const [descricao, setDescricao] = useState(roteiro.descricao ?? "");
  const [tipo, setTipo] = useState<Roteiro["tipo"]>(roteiro.tipo);
  const [precoReceptivo, setPrecoReceptivo] = useState(
    roteiro.preco_receptivo !== null ? String(roteiro.preco_receptivo) : "",
  );
  const [pdfUrl, setPdfUrl] = useState(roteiro.pdf_url ?? "");
  const [custoFixoExecucao, setCustoFixoExecucao] = useState(
    roteiro.custo_fixo_execucao !== null
      ? String(roteiro.custo_fixo_execucao)
      : "",
  );
  const [custoVariavelPessoa, setCustoVariavelPessoa] = useState(
    roteiro.custo_variavel_pessoa !== null
      ? String(roteiro.custo_variavel_pessoa)
      : "",
  );
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function cancelarEdicao() {
    setNome(roteiro.nome);
    setDescricao(roteiro.descricao ?? "");
    setTipo(roteiro.tipo);
    setPrecoReceptivo(
      roteiro.preco_receptivo !== null ? String(roteiro.preco_receptivo) : "",
    );
    setPdfUrl(roteiro.pdf_url ?? "");
    setCustoFixoExecucao(
      roteiro.custo_fixo_execucao !== null
        ? String(roteiro.custo_fixo_execucao)
        : "",
    );
    setCustoVariavelPessoa(
      roteiro.custo_variavel_pessoa !== null
        ? String(roteiro.custo_variavel_pessoa)
        : "",
    );
    setErro(null);
    setEditando(false);
  }

  async function salvarEdicao(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);

    // Mesma regra da API (PATCH /api/admin/roteiros/[id]): preco_receptivo
    // é obrigatório quando tipo = 'receptivo' - valida aqui antes pra não
    // depender só do erro 400 da API.
    if (tipo === "receptivo" && !precoReceptivo.trim()) {
      setErro("Preço é obrigatório para roteiro receptivo.");
      return;
    }

    setEnviando(true);

    const resposta = await fetch(`/api/admin/roteiros/${roteiro.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        descricao: descricao || null,
        tipo,
        preco_receptivo:
          tipo === "receptivo" ? Number(precoReceptivo) : null,
        pdf_url: pdfUrl || null,
        custo_fixo_execucao: custoFixoExecucao.trim()
          ? Number(custoFixoExecucao)
          : null,
        custo_variavel_pessoa: custoVariavelPessoa.trim()
          ? Number(custoVariavelPessoa)
          : null,
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
      <form
        onSubmit={salvarEdicao}
        className="bg-pedra-sabao flex flex-col gap-4 rounded-2xl p-6"
      >
        <label className={labelClasse}>
          Nome
          <input
            type="text"
            required
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            className={campoClasse}
          />
        </label>

        <label className={labelClasse}>
          Tipo
          <select
            value={tipo}
            onChange={(evento) =>
              setTipo(evento.target.value as Roteiro["tipo"])
            }
            className={campoClasse}
          >
            <option value="emissivel">Emissível</option>
            <option value="receptivo">Receptivo</option>
          </select>
        </label>

        {tipo === "receptivo" && (
          <label className={labelClasse}>
            Preço (roteiro receptivo - sem contagem de vaga)
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={precoReceptivo}
              onChange={(evento) => setPrecoReceptivo(evento.target.value)}
              className={campoClasse}
            />
          </label>
        )}

        <label className={labelClasse}>
          Descrição
          <textarea
            value={descricao}
            onChange={(evento) => setDescricao(evento.target.value)}
            rows={4}
            className={campoClasse}
          />
        </label>

        <label className={labelClasse}>
          URL do PDF
          <input
            type="text"
            value={pdfUrl}
            onChange={(evento) => setPdfUrl(evento.target.value)}
            className={campoClasse}
          />
        </label>

        <label className={labelClasse}>
          Custo fixo por execução (van, guia, hospedagem)
          <input
            type="number"
            step="0.01"
            value={custoFixoExecucao}
            onChange={(evento) => setCustoFixoExecucao(evento.target.value)}
            className={campoClasse}
          />
        </label>

        <label className={labelClasse}>
          Custo por pessoa (ingresso de atrativo)
          <input
            type="number"
            step="0.01"
            value={custoVariavelPessoa}
            onChange={(evento) => setCustoVariavelPessoa(evento.target.value)}
            className={campoClasse}
          />
        </label>

        {erro && <p className="font-body text-sm text-red-600">{erro}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={enviando}
            className="font-body bg-verde-mata text-pedra-sabao rounded-2xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {enviando ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={cancelarEdicao}
            disabled={enviando}
            className="font-body text-terracota rounded-2xl border border-zinc-300 px-5 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-pedra-sabao flex flex-col gap-4 rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="font-display text-terracota text-2xl font-extrabold tracking-tight">
            {roteiro.nome}
          </h1>
          <span className="font-body text-terracota/60 text-sm">
            {RUBRICAS_TIPO[roteiro.tipo] ?? roteiro.tipo}
          </span>
        </div>

        {!roteiro.ativo && (
          <span className="font-body bg-white text-terracota/60 rounded-full px-3 py-1 text-xs font-semibold">
            Pausado
          </span>
        )}
      </div>

      {custoPendente && (
        <p className="font-body rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-medium text-amber-800">
          O custo digitado na criação não foi salvo (falha ao gravar). O
          roteiro foi criado normalmente - clique em &quot;Editar&quot; abaixo
          e preencha o custo de novo.
        </p>
      )}

      {roteiro.descricao && (
        <p className="font-body text-terracota/70 text-sm">
          {roteiro.descricao}
        </p>
      )}

      {roteiro.tipo === "receptivo" && (
        <p className="font-body text-terracota text-sm font-semibold">
          Preço:{" "}
          {roteiro.preco_receptivo !== null
            ? formatarPreco(roteiro.preco_receptivo)
            : "não cadastrado"}
        </p>
      )}

      <p className="font-body text-terracota/70 text-sm">
        Custo fixo por execução:{" "}
        {roteiro.custo_fixo_execucao !== null
          ? formatarPreco(roteiro.custo_fixo_execucao)
          : "não cadastrado"}{" "}
        · Custo por pessoa:{" "}
        {roteiro.custo_variavel_pessoa !== null
          ? formatarPreco(roteiro.custo_variavel_pessoa)
          : "não cadastrado"}
      </p>

      {erro && <p className="font-body text-sm text-red-600">{erro}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="font-body text-terracota rounded-2xl border border-zinc-300 px-5 py-2.5 text-sm font-medium"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={alternarAtivo}
          disabled={enviando}
          className="font-body text-terracota rounded-2xl border border-zinc-300 px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {roteiro.ativo ? "Pausar" : "Despausar"}
        </button>
      </div>
    </div>
  );
}
