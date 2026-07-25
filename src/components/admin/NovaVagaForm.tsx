"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const campoClasse =
  "font-body text-terracota rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-verde-mata";
const labelClasse =
  "font-body text-terracota flex flex-col gap-1 text-sm font-medium";

export function NovaVagaForm({ roteiroId }: { roteiroId: string }) {
  const router = useRouter();
  const [data, setData] = useState("");
  const [preco, setPreco] = useState("");
  const [vagasTotais, setVagasTotais] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    const resposta = await fetch("/api/admin/vagas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roteiro_id: roteiroId,
        data,
        preco: Number(preco),
        vagas_totais: Number(vagasTotais),
      }),
    });

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      setErro(corpo?.erro ?? "Erro ao criar vaga.");
      setEnviando(false);
      return;
    }

    setData("");
    setPreco("");
    setVagasTotais("");
    setEnviando(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-pedra-sabao flex flex-col gap-4 rounded-2xl p-6"
    >
      <h2 className="font-display text-terracota text-lg font-bold">
        Nova vaga
      </h2>

      <label className={labelClasse}>
        Data
        <input
          type="date"
          required
          value={data}
          onChange={(evento) => setData(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <label className={labelClasse}>
        Preço
        <input
          type="number"
          required
          min="0.01"
          step="0.01"
          value={preco}
          onChange={(evento) => setPreco(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <label className={labelClasse}>
        Vagas totais
        <input
          type="number"
          required
          min="1"
          step="1"
          value={vagasTotais}
          onChange={(evento) => setVagasTotais(evento.target.value)}
          className={campoClasse}
        />
      </label>

      {erro && <p className="font-body text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="font-body bg-verde-mata text-pedra-sabao self-start rounded-2xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {enviando ? "Criando..." : "Criar vaga"}
      </button>
    </form>
  );
}
