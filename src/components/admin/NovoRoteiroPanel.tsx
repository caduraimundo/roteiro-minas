"use client";

import { useNovoRoteiroForm } from "@/hooks/useNovoRoteiroForm";
import type { Roteiro } from "@/data/roteiros";

const CATEGORIAS = [
  { value: "trilha", label: "Trilha" },
  { value: "cachoeira", label: "Cachoeira" },
  { value: "travessia", label: "Travessia" },
  { value: "cultural", label: "Cultural" },
];

const NIVEIS_DIFICULDADE = [
  { value: "leve", label: "Leve" },
  { value: "moderado", label: "Moderado" },
  { value: "dificil", label: "Difícil" },
  { value: "extremo", label: "Extremo" },
];

const ID_FORM = "form-novo-roteiro-painel";

const campoClasse =
  "font-body text-terracota rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-verde-mata";

const labelClasse = "font-body text-terracota flex flex-col gap-1 text-sm font-medium";

function FecharIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function NovoRoteiroPanel({
  aberto,
  onClose,
}: {
  aberto: boolean;
  onClose: () => void;
}) {
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
    categoria,
    setCategoria,
    nivelDificuldade,
    setNivelDificuldade,
    enviando,
    erro,
    criarRoteiro,
  } = useNovoRoteiroForm();

  if (!aberto) return null;

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    const roteiroId = await criarRoteiro();
    if (roteiroId) onClose();
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div className="bg-ocre absolute top-0 right-0 flex h-full w-full max-w-[520px] flex-col">
        <div className="flex items-start justify-between gap-4 p-6">
          <div>
            <h2 className="font-display text-terracota text-xl font-extrabold tracking-tight">
              Novo Roteiro
            </h2>
            <p className="font-body text-terracota/60 mt-1 text-sm">
              Preencha as informações do passeio.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-terracota flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-300"
          >
            <FecharIcon />
          </button>
        </div>

        <form
          id={ID_FORM}
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6"
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
            Categoria (opcional)
            <select
              value={categoria}
              onChange={(evento) => setCategoria(evento.target.value)}
              className={campoClasse}
            >
              <option value="">Selecione</option>
              {CATEGORIAS.map((opcao) => (
                <option key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClasse}>
            Nível de dificuldade (opcional)
            <select
              value={nivelDificuldade}
              onChange={(evento) => setNivelDificuldade(evento.target.value)}
              className={campoClasse}
            >
              <option value="">Selecione</option>
              {NIVEIS_DIFICULDADE.map((opcao) => (
                <option key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </label>

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
              onChange={(evento) =>
                setCustoVariavelPessoa(evento.target.value)
              }
              className={campoClasse}
            />
          </label>

          {erro && <p className="font-body text-sm text-red-600">{erro}</p>}
        </form>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 p-6">
          <button
            type="button"
            onClick={onClose}
            className="font-body text-terracota rounded-2xl border border-zinc-300 px-5 py-2 text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form={ID_FORM}
            disabled={enviando}
            className="font-body bg-verde-mata text-pedra-sabao rounded-2xl px-5 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {enviando ? "Criando..." : "Criar roteiro"}
          </button>
        </div>
      </div>
    </div>
  );
}
