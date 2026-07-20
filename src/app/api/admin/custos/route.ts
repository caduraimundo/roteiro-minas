import { NextResponse } from "next/server";
import {
  requireAdminSession,
  AdminSessionError,
} from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  mesAtualSaoPaulo,
  intervaloMesSaoPaulo,
  mesValido,
  arredondar,
} from "@/lib/mes-sao-paulo";

type Venda = {
  id: string;
  vaga_id: string;
  valor_total: number;
  venda_manual: boolean;
  taxa_valor: number | null;
  taxa_devida_valor: number | null;
};

type Roteiro = {
  id: string;
  nome: string;
  custo_fixo_execucao: number | null;
  custo_variavel_pessoa: number | null;
};

export async function GET(request: Request) {
  try {
    await requireAdminSession();
  } catch (erro) {
    if (erro instanceof AdminSessionError) {
      return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
    }
    throw erro;
  }

  const { searchParams } = new URL(request.url);
  const mes = searchParams.get("mes") ?? mesAtualSaoPaulo();

  if (!mesValido(mes)) {
    return NextResponse.json(
      { erro: "mes deve estar no formato AAAA-MM." },
      { status: 400 },
    );
  }

  const { inicio, fim } = intervaloMesSaoPaulo(mes);

  const supabaseAdmin = createAdminClient();

  const { data: vendas, error: erroVendas } = await supabaseAdmin
    .from("vendas")
    .select("id, vaga_id, valor_total, venda_manual, taxa_valor, taxa_devida_valor")
    .neq("status", "reembolsada")
    .gte("created_at", inicio.toISOString())
    .lt("created_at", fim.toISOString());

  if (erroVendas) {
    console.error("Erro ao buscar vendas (admin/custos):", erroVendas.message);
    return NextResponse.json(
      { erro: "Erro ao gerar painel de custos." },
      { status: 500 },
    );
  }

  const { data: vagas, error: erroVagas } = await supabaseAdmin
    .from("vagas")
    .select("id, roteiro_id");

  if (erroVagas) {
    console.error("Erro ao buscar vagas (admin/custos):", erroVagas.message);
    return NextResponse.json(
      { erro: "Erro ao gerar painel de custos." },
      { status: 500 },
    );
  }

  const { data: roteiros, error: erroRoteiros } = await supabaseAdmin
    .from("roteiros")
    .select("id, nome, custo_fixo_execucao, custo_variavel_pessoa");

  if (erroRoteiros) {
    console.error(
      "Erro ao buscar roteiros (admin/custos):",
      erroRoteiros.message,
    );
    return NextResponse.json(
      { erro: "Erro ao gerar painel de custos." },
      { status: 500 },
    );
  }

  const roteiroIdPorVagaId = new Map(
    (vagas ?? []).map((vaga) => [vaga.id, vaga.roteiro_id as string]),
  );
  const roteiroPorId = new Map(
    (roteiros ?? []).map((roteiro) => [roteiro.id, roteiro as Roteiro]),
  );

  const agregadoPorRoteiro = new Map<
    string,
    { quantidade_vendas: number; vagasDistintas: Set<string>; receita_liquida: number }
  >();

  for (const venda of (vendas ?? []) as Venda[]) {
    const valorTotal = Number(venda.valor_total);
    const taxa = venda.venda_manual
      ? Number(venda.taxa_devida_valor ?? 0)
      : Number(venda.taxa_valor ?? 0);
    const valorRoteiro = venda.venda_manual ? valorTotal : valorTotal - taxa;

    const roteiroId = roteiroIdPorVagaId.get(venda.vaga_id);
    if (!roteiroId) continue;

    const entrada = agregadoPorRoteiro.get(roteiroId) ?? {
      quantidade_vendas: 0,
      vagasDistintas: new Set<string>(),
      receita_liquida: 0,
    };
    entrada.quantidade_vendas += 1;
    entrada.vagasDistintas.add(venda.vaga_id);
    entrada.receita_liquida += valorRoteiro;
    agregadoPorRoteiro.set(roteiroId, entrada);
  }

  let margemTotal = 0;
  let roteirosComCustoIncompleto = 0;

  const porRoteiro = Array.from(agregadoPorRoteiro.entries()).map(
    ([roteiroId, agregado]) => {
      const roteiro = roteiroPorId.get(roteiroId);
      const nome = roteiro?.nome ?? "Roteiro desconhecido";
      const receitaLiquida = arredondar(agregado.receita_liquida);
      const quantidadeExecucoes = agregado.vagasDistintas.size;
      const quantidadeVendas = agregado.quantidade_vendas;

      const custoFixo = roteiro?.custo_fixo_execucao;
      const custoVariavel = roteiro?.custo_variavel_pessoa;

      if (custoFixo == null || custoVariavel == null) {
        roteirosComCustoIncompleto += 1;
        return {
          roteiro_id: roteiroId,
          nome,
          quantidade_execucoes: quantidadeExecucoes,
          quantidade_vendas: quantidadeVendas,
          receita_liquida: receitaLiquida,
          custo_total: null,
          margem: null,
          custo_incompleto: true,
        };
      }

      const custoTotal = arredondar(
        Number(custoFixo) * quantidadeExecucoes +
          Number(custoVariavel) * quantidadeVendas,
      );
      const margem = arredondar(receitaLiquida - custoTotal);
      margemTotal += margem;

      return {
        roteiro_id: roteiroId,
        nome,
        quantidade_execucoes: quantidadeExecucoes,
        quantidade_vendas: quantidadeVendas,
        receita_liquida: receitaLiquida,
        custo_total: custoTotal,
        margem,
        custo_incompleto: false,
      };
    },
  );

  return NextResponse.json({
    mes,
    resumo: {
      margem_total: arredondar(margemTotal),
      roteiros_com_custo_incompleto: roteirosComCustoIncompleto,
    },
    por_roteiro: porRoteiro,
  });
}
