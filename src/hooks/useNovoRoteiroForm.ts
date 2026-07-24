"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Roteiro } from "@/data/roteiros";

/**
 * Estado + validação + submit da criação de roteiro, compartilhado entre
 * o formulário de página cheia (NovoRoteiroForm) e o painel lateral da
 * Dashboard (NovoRoteiroPanel) - mesma regra de negócio nos dois lugares
 * (preco_receptivo obrigatório só quando tipo = 'receptivo', POST em
 * /api/admin/roteiros seguido de PATCH de custo se preenchido), extraída
 * aqui em vez de duplicada.
 */
export function useNovoRoteiroForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<Roteiro["tipo"]>("emissivel");
  const [precoReceptivo, setPrecoReceptivo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [custoFixoExecucao, setCustoFixoExecucao] = useState("");
  const [custoVariavelPessoa, setCustoVariavelPessoa] = useState("");
  const [categoria, setCategoria] = useState("");
  const [nivelDificuldade, setNivelDificuldade] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  /**
   * Retorna o id do roteiro criado em caso de sucesso (pra quem chamou
   * decidir o que fazer, ex: fechar um painel), ou `null` se a validação
   * ou o POST falharam - `erro` já fica setado nesse caso, sem precisar
   * o chamador tratar isso de novo.
   */
  async function criarRoteiro(): Promise<string | null> {
    setErro(null);

    // Mesma regra da API (POST /api/admin/roteiros): preco_receptivo é
    // obrigatório quando tipo = 'receptivo' - valida aqui antes pra não
    // depender só do erro 400 da API.
    if (tipo === "receptivo" && !precoReceptivo.trim()) {
      setErro("Preço é obrigatório para roteiro receptivo.");
      return null;
    }

    setEnviando(true);

    const resposta = await fetch("/api/admin/roteiros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        tipo,
        preco_receptivo:
          tipo === "receptivo" ? Number(precoReceptivo) : undefined,
        descricao: descricao || undefined,
        pdf_url: pdfUrl || undefined,
        categoria: categoria || undefined,
        nivel_dificuldade: nivelDificuldade || undefined,
      }),
    });

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      setErro(corpo?.erro ?? "Erro ao criar roteiro.");
      setEnviando(false);
      return null;
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

    return roteiroId;
  }

  return {
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
  };
}
