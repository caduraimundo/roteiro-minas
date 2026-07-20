"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Roteiro } from "@/data/roteiros";

const campoClasse =
  "rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700";

export function NovoRoteiroForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<Roteiro["tipo"]>("fixo");
  const [descricao, setDescricao] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [custoFixoExecucao, setCustoFixoExecucao] = useState("");
  const [custoVariavelPessoa, setCustoVariavelPessoa] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    const resposta = await fetch("/api/admin/roteiros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        tipo,
        descricao: descricao || undefined,
        pdf_url: pdfUrl || undefined,
      }),
    });

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      setErro(corpo?.erro ?? "Erro ao criar roteiro.");
      setEnviando(false);
      return;
    }

    const roteiroId = corpo.roteiro.id;

    // Custo não é aceito na criação (rota de POST não tem esses campos) -
    // faz um PATCH logo em seguida quando o Markys já preenche o custo na
    // hora de criar o roteiro. Falha aqui não impede a navegação: o
    // roteiro já foi criado, dá pra completar o custo depois na edição -
    // mas não silencia, sinaliza via query param pra página de detalhe
    // avisar que o custo não foi salvo.
    let custoPendente = false;

    if (custoFixoExecucao.trim() || custoVariavelPessoa.trim()) {
      const respostaCusto = await fetch(`/api/admin/roteiros/${roteiroId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custo_fixo_execucao: custoFixoExecucao.trim()
            ? Number(custoFixoExecucao)
            : null,
          custo_variavel_pessoa: custoVariavelPessoa.trim()
            ? Number(custoVariavelPessoa)
            : null,
        }),
      }).catch(() => null);

      custoPendente = !respostaCusto || !respostaCusto.ok;
    }

    router.push(
      `/admin/roteiros/${roteiroId}${custoPendente ? "?custo_pendente=1" : ""}`,
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        Descrição (opcional)
        <textarea
          value={descricao}
          onChange={(evento) => setDescricao(evento.target.value)}
          rows={4}
          className={campoClasse}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        URL do PDF (opcional)
        <input
          type="text"
          value={pdfUrl}
          onChange={(evento) => setPdfUrl(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Custo fixo por execução (van, guia, hospedagem) - opcional
        <input
          type="number"
          step="0.01"
          value={custoFixoExecucao}
          onChange={(evento) => setCustoFixoExecucao(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Custo por pessoa (ingresso de atrativo) - opcional
        <input
          type="number"
          step="0.01"
          value={custoVariavelPessoa}
          onChange={(evento) => setCustoVariavelPessoa(evento.target.value)}
          className={campoClasse}
        />
      </label>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {enviando ? "Criando..." : "Criar roteiro"}
      </button>
    </form>
  );
}
