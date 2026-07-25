"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type RoteiroResumo = { id: string; nome: string };

const campoClasse =
  "font-body text-terracota rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-verde-mata";
const labelClasse =
  "font-body text-terracota flex flex-col gap-1 text-sm font-medium";

export function NovoCupomForm() {
  const router = useRouter();
  const [roteiros, setRoteiros] = useState<RoteiroResumo[]>([]);
  const [codigo, setCodigo] = useState("");
  const [roteiroId, setRoteiroId] = useState("");
  const [percentual, setPercentual] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    fetch("/api/admin/roteiros").then(async (resposta) => {
      const corpo = await resposta.json().catch(() => null);
      if (cancelado || !resposta.ok || !corpo?.roteiros) return;
      setRoteiros(corpo.roteiros);
    });

    return () => {
      cancelado = true;
    };
  }, []);

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    const resposta = await fetch("/api/admin/cupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo,
        roteiro_id: roteiroId,
        percentual_desconto: Number(percentual),
      }),
    });

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      setErro(corpo?.erro ?? "Erro ao criar cupom.");
      setEnviando(false);
      return;
    }

    router.push("/admin/cupons");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-pedra-sabao flex flex-col gap-4 rounded-2xl p-6"
    >
      <label className={labelClasse}>
        Código (salvo em MAIÚSCULO automaticamente)
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
          required
          value={roteiroId}
          onChange={(evento) => setRoteiroId(evento.target.value)}
          className={campoClasse}
        >
          <option value="" disabled>
            Selecione um roteiro
          </option>
          {roteiros.map((roteiro) => (
            <option key={roteiro.id} value={roteiro.id}>
              {roteiro.nome}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClasse}>
        Percentual de desconto
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

      {erro && <p className="font-body text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="font-body bg-verde-mata text-pedra-sabao self-start rounded-2xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {enviando ? "Criando..." : "Criar cupom"}
      </button>
    </form>
  );
}
