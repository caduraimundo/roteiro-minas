"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatarPreco } from "@/lib/format";

const campoClasse =
  "rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700";

type Resultado = {
  vendaId: string;
  taxaDevida: number | null;
  ticketEnviado: boolean;
};

export function VendaManualForm({
  vagaId,
  vagasDisponiveis,
}: {
  vagaId: string;
  vagasDisponiveis: number;
}) {
  const router = useRouter();
  const [compradorNome, setCompradorNome] = useState("");
  const [compradorCpf, setCompradorCpf] = useState("");
  const [compradorEmail, setCompradorEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const esgotada = vagasDisponiveis === 0;

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setResultado(null);
    setEnviando(true);

    const resposta = await fetch("/api/admin/vendas/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vaga_id: vagaId,
        comprador_nome: compradorNome,
        comprador_cpf: compradorCpf,
        comprador_email: compradorEmail,
      }),
    });

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      setErro(corpo?.erro ?? "Erro ao registrar venda manual.");
      setEnviando(false);
      return;
    }

    setResultado({
      vendaId: corpo.venda_id,
      taxaDevida: corpo.taxa_devida,
      ticketEnviado: corpo.ticket_enviado,
    });
    setCompradorNome("");
    setCompradorCpf("");
    setCompradorEmail("");
    setEnviando(false);
    router.refresh();
  }

  if (esgotada) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold">Venda manual</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Vaga esgotada.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="font-semibold">Venda manual</h2>

      <label className="flex flex-col gap-1 text-sm">
        Nome do comprador
        <input
          type="text"
          required
          value={compradorNome}
          onChange={(evento) => setCompradorNome(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        CPF do comprador
        <input
          type="text"
          required
          value={compradorCpf}
          onChange={(evento) => setCompradorCpf(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        E-mail do comprador
        <input
          type="text"
          required
          value={compradorEmail}
          onChange={(evento) => setCompradorEmail(evento.target.value)}
          className={campoClasse}
        />
      </label>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      {resultado && (
        <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
          <p>Venda registrada (id: {resultado.vendaId}).</p>
          {resultado.taxaDevida !== null && (
            <p className="text-zinc-600 dark:text-zinc-400">
              Taxa devida: {formatarPreco(resultado.taxaDevida)}
            </p>
          )}
          {resultado.ticketEnviado ? (
            <p className="text-zinc-600 dark:text-zinc-400">
              Ticket enviado por e-mail.
            </p>
          ) : (
            <p className="text-zinc-600 dark:text-zinc-400">
              Ticket não pôde ser enviado por e-mail automaticamente -
              reenvie manualmente depois.
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {enviando ? "Registrando..." : "Registrar venda"}
      </button>
    </form>
  );
}
