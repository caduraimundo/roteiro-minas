import { NextResponse } from "next/server";
import {
  requireAdminSession,
  AdminSessionError,
} from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  mesAtualSaoPaulo,
  intervaloMesSaoPaulo,
  intervaloSemanaSaoPaulo,
  hojeSaoPaulo,
  arredondar,
} from "@/lib/mes-sao-paulo";

// Vaga "esgotando" - limiar arbitrário (não vem de nenhuma regra de
// negócio documentada), só um corte razoável pra chamar atenção do
// admin antes de esgotar de vez. Ajustar aqui se o critério mudar.
const LIMITE_VAGAS_ESGOTANDO = 3;
const MAX_VAGAS_ESGOTANDO = 5;
const MAX_PROXIMAS_VAGAS = 5;

// Segunda a domingo, igual ao protótipo (inicial em português, não
// label completo).
const LETRAS_DIA_SEMANA = ["S", "T", "Q", "Q", "S", "S", "D"] as const;
const DIA_MS = 24 * 60 * 60 * 1000;

type VendaMes = {
  valor_total: number;
};

type VendaTaxaPendente = {
  taxa_devida_valor: number | null;
};

type VendaSemana = {
  created_at: string;
};

type VagaEsgotando = {
  id: string;
  roteiro_id: string;
  data: string;
  vagas_disponiveis: number;
};

type VagaProxima = {
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

  // Sem filtro de vagas_disponiveis (diferente de vagas_esgotando) -
  // só as próximas vagas em aberto na ordem em que acontecem.
  const { data: proximasVagas, error: erroProximasVagas } =
    await supabaseAdmin
      .from("vagas")
      .select("id, roteiro_id, data, vagas_disponiveis")
      .eq("status", "aberta")
      .gte("data", hoje)
      .order("data", { ascending: true })
      .limit(MAX_PROXIMAS_VAGAS);

  if (erroProximasVagas) {
    console.error(
      "Erro ao buscar próximas vagas (admin/dashboard):",
      erroProximasVagas.message,
    );
    return NextResponse.json(
      { erro: "Erro ao gerar dashboard." },
      { status: 500 },
    );
  }

  const { inicio: inicioSemana, fim: fimSemana } = intervaloSemanaSaoPaulo();

  const { data: vendasSemana, error: erroVendasSemana } = await supabaseAdmin
    .from("vendas")
    .select("created_at")
    .neq("status", "reembolsada")
    .gte("created_at", inicioSemana.toISOString())
    .lt("created_at", fimSemana.toISOString());

  if (erroVendasSemana) {
    console.error(
      "Erro ao buscar vendas da semana (admin/dashboard):",
      erroVendasSemana.message,
    );
    return NextResponse.json(
      { erro: "Erro ao gerar dashboard." },
      { status: 500 },
    );
  }

  // Cada venda cai no dia (0=segunda..6=domingo) que contém seu
  // created_at, calculado por distância em relação ao início da semana
  // (já ancorado à meia-noite de São Paulo) - evita duplicar a lógica
  // de conversão de timestamp pra data local que hojeSaoPaulo() já tem.
  const contagemPorDia = new Array(7).fill(0) as number[];
  for (const venda of (vendasSemana ?? []) as VendaSemana[]) {
    const indiceDia = Math.floor(
      (new Date(venda.created_at).getTime() - inicioSemana.getTime()) /
        DIA_MS,
    );
    if (indiceDia >= 0 && indiceDia < 7) {
      contagemPorDia[indiceDia] += 1;
    }
  }

  const vendasSemanaResposta = Array.from({ length: 7 }, (_, indice) => {
    const dataDia = new Date(inicioSemana.getTime() + indice * DIA_MS);
    const ano = dataDia.getUTCFullYear();
    const mesDoDia = String(dataDia.getUTCMonth() + 1).padStart(2, "0");
    const diaDoMes = String(dataDia.getUTCDate()).padStart(2, "0");

    return {
      dia: LETRAS_DIA_SEMANA[indice],
      data: `${ano}-${mesDoDia}-${diaDoMes}`,
      total_vendas: contagemPorDia[indice],
    };
  });

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
    vendas_semana: vendasSemanaResposta,
    proximas_vagas: (proximasVagas as VagaProxima[]).map((vaga) => ({
      vaga_id: vaga.id,
      roteiro_nome: nomePorRoteiroId.get(vaga.roteiro_id) ?? "Roteiro desconhecido",
      data: vaga.data,
      vagas_disponiveis: vaga.vagas_disponiveis,
    })),
  });
}
