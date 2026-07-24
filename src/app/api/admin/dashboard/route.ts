import { NextResponse } from "next/server";
import {
  requireAdminSession,
  AdminSessionError,
} from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  mesAtualSaoPaulo,
  intervaloMesSaoPaulo,
  hojeSaoPaulo,
  arredondar,
} from "@/lib/mes-sao-paulo";

// Vaga "esgotando" - limiar arbitrário (não vem de nenhuma regra de
// negócio documentada), só um corte razoável pra chamar atenção do
// admin antes de esgotar de vez. Ajustar aqui se o critério mudar.
const LIMITE_VAGAS_ESGOTANDO = 3;
const MAX_VAGAS_ESGOTANDO = 5;

type VendaMes = {
  valor_total: number;
};

type VendaTaxaPendente = {
  taxa_devida_valor: number | null;
};

type VagaEsgotando = {
  id: string;
  roteiro_id: string;
  data: string;
  vagas_disponiveis: number;
};

export async function GET() {
  try {
    await requireAdminSession();
  } catch (erro) {
    if (erro instanceof AdminSessionError) {
      return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
    }
    throw erro;
  }

  const supabaseAdmin = createAdminClient();

  const mes = mesAtualSaoPaulo();
  const { inicio, fim } = intervaloMesSaoPaulo(mes);

  const { data: vendasMes, error: erroVendasMes } = await supabaseAdmin
    .from("vendas")
    .select("valor_total")
    .neq("status", "reembolsada")
    .gte("created_at", inicio.toISOString())
    .lt("created_at", fim.toISOString());

  if (erroVendasMes) {
    console.error(
      "Erro ao buscar vendas do mês (admin/dashboard):",
      erroVendasMes.message,
    );
    return NextResponse.json(
      { erro: "Erro ao gerar dashboard." },
      { status: 500 },
    );
  }

  const valorTotalMes = (vendasMes as VendaMes[]).reduce(
    (total, venda) => total + Number(venda.valor_total),
    0,
  );

  // Saldo acumulado em aberto, sem filtro de mês - diferente do
  // taxa_manual_pendente de relatorio.ts, que só olha o mês corrente e
  // não considera taxa_devida_acertada_em.
  const { data: vendasTaxaPendente, error: erroTaxaPendente } =
    await supabaseAdmin
      .from("vendas")
      .select("taxa_devida_valor")
      .is("taxa_devida_acertada_em", null);

  if (erroTaxaPendente) {
    console.error(
      "Erro ao buscar taxa devida pendente (admin/dashboard):",
      erroTaxaPendente.message,
    );
    return NextResponse.json(
      { erro: "Erro ao gerar dashboard." },
      { status: 500 },
    );
  }

  const taxaDevidaPendente = (vendasTaxaPendente as VendaTaxaPendente[]).reduce(
    (total, venda) => total + Number(venda.taxa_devida_valor ?? 0),
    0,
  );

  const { count: roteirosAtivos, error: erroRoteirosAtivos } =
    await supabaseAdmin
      .from("roteiros")
      .select("id", { count: "exact", head: true })
      .eq("ativo", true);

  if (erroRoteirosAtivos) {
    console.error(
      "Erro ao contar roteiros ativos (admin/dashboard):",
      erroRoteirosAtivos.message,
    );
    return NextResponse.json(
      { erro: "Erro ao gerar dashboard." },
      { status: 500 },
    );
  }

  const hoje = hojeSaoPaulo();

  const { data: vagasEsgotando, error: erroVagasEsgotando } =
    await supabaseAdmin
      .from("vagas")
      .select("id, roteiro_id, data, vagas_disponiveis")
      .eq("status", "aberta")
      .gte("data", hoje)
      .lte("vagas_disponiveis", LIMITE_VAGAS_ESGOTANDO)
      .order("vagas_disponiveis", { ascending: true })
      .order("data", { ascending: true })
      .limit(MAX_VAGAS_ESGOTANDO);

  if (erroVagasEsgotando) {
    console.error(
      "Erro ao buscar vagas esgotando (admin/dashboard):",
      erroVagasEsgotando.message,
    );
    return NextResponse.json(
      { erro: "Erro ao gerar dashboard." },
      { status: 500 },
    );
  }

  // Mesmo padrão de mapa manual usado em relatorio.ts - busca todos os
  // roteiros e resolve o nome na hora de montar a resposta, em vez de
  // um join automático do PostgREST.
  const { data: roteiros, error: erroRoteiros } = await supabaseAdmin
    .from("roteiros")
    .select("id, nome");

  if (erroRoteiros) {
    console.error(
      "Erro ao buscar roteiros (admin/dashboard):",
      erroRoteiros.message,
    );
    return NextResponse.json(
      { erro: "Erro ao gerar dashboard." },
      { status: 500 },
    );
  }

  const nomePorRoteiroId = new Map(
    (roteiros ?? []).map((roteiro) => [roteiro.id, roteiro.nome as string]),
  );

  return NextResponse.json({
    vendas_mes: {
      mes,
      total_vendas: vendasMes?.length ?? 0,
      valor_total: arredondar(valorTotalMes),
    },
    taxa_devida_pendente: arredondar(taxaDevidaPendente),
    roteiros_ativos: roteirosAtivos ?? 0,
    vagas_esgotando: (vagasEsgotando as VagaEsgotando[]).map((vaga) => ({
      vaga_id: vaga.id,
      roteiro_nome: nomePorRoteiroId.get(vaga.roteiro_id) ?? "Roteiro desconhecido",
      data: vaga.data,
      vagas_disponiveis: vaga.vagas_disponiveis,
    })),
  });
}
