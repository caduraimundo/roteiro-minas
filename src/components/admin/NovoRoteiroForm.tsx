"use client";

import { useNovoRoteiroForm } from "@/hooks/useNovoRoteiroForm";
import type { Roteiro } from "@/data/roteiros";

const campoClasse =
  "font-body text-terracota rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-verde-mata";
const labelClasse =
  "font-body text-terracota flex flex-col gap-1 text-sm font-medium";

export function NovoRoteiroForm() {
  const {
    nome,
    setNome,
    tipo,
    setTipo,
    precoReceptivo,
    setPrecoReceptivo,
    descricao,
    setDescricao,
    pdfUrl,
    setPdfUrl,
    custoFixoExecucao,
    setCustoFixoExecucao,
    custoVariavelPessoa,
    setCustoVariavelPessoa,
    enviando,
    erro,
    criarRoteiro,
  } = useNovoRoteiroForm();

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    await criarRoteiro();
  }

  return (
    <form
      onSubmit={handleSubmit}
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
        Descrição (opcional)
        <textarea
          value={descricao}
          onChange={(evento) => setDescricao(evento.target.value)}
          rows={4}
          className={campoClasse}
        />
      </label>

      <label className={labelClasse}>
        URL do PDF (opcional)
        <input
          type="text"
          value={pdfUrl}
          onChange={(evento) => setPdfUrl(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <label className={labelClasse}>
        Custo fixo por execução (van, guia, hospedagem) - opcional
        <input
          type="number"
          step="0.01"
          value={custoFixoExecucao}
          onChange={(evento) => setCustoFixoExecucao(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <label className={labelClasse}>
        Custo por pessoa (ingresso de atrativo) - opcional
        <input
          type="number"
          step="0.01"
          value={custoVariavelPessoa}
          onChange={(evento) => setCustoVariavelPessoa(evento.target.value)}
          className={campoClasse}
        />
      </label>

      {erro && <p className="font-body text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="font-body bg-verde-mata text-pedra-sabao self-start rounded-2xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {enviando ? "Criando..." : "Criar roteiro"}
      </button>
    </form>
  );
}
