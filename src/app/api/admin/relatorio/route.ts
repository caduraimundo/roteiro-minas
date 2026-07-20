import { NextResponse } from "next/server";
import {
  requireAdminSession,
  AdminSessionError,
} from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

// Brasil não observa horário de verão desde 2019 - offset fixo de -03:00
// em todo o território, o que torna seguro calcular os limites do mês em
// America/Sao_Paulo sem biblioteca de timezone.
const OFFSET_SAO_PAULO_MS = 3 * 60 * 60 * 1000;

function mesAtualSaoPaulo(): string {
  const agoraSp = new Date(Date.now() - OFFSET_SAO_PAULO_MS);
  const ano = agoraSp.getUTCFullYear();
  const mes = String(agoraSp.getUTCMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

function intervaloMesSaoPaulo(mes: string) {
  const [anoStr, mesStr] = mes.split("-");
  const ano = Number(anoStr);
  const mesNum = Number(mesStr);

  const inicio = new Date(Date.UTC(ano, mesNum - 1, 1, 3, 0, 0));
  const fim = new Date(Date.UTC(ano, mesNum, 1, 3, 0, 0));

  return { inicio, fim };
}

function arredondar(valor: number) {
  return Math.round(valor * 100) / 100;
}

type Venda = {
  id: string;
  vaga_id: string;
  valor_total: number;
  venda_manual: boolean;
  forma_pagamento: string;
  taxa_valor: number | null;
  taxa_devida_valor: number | null;
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

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) {
    return NextResponse.json(
      { erro: "mes deve estar no formato AAAA-MM." },
      { status: 400 },
    );
  }

  const { inicio, fim } = intervaloMesSaoPaulo(mes);

  const supabaseAdmin = createAdminClient();

  const { data: vendas, error: erroVendas } = await supabaseAdmin
    .from("vendas")
    .select(
      "id, vaga_id, valor_total, venda_manual, forma_pagamento, taxa_valor, taxa_devida_valor",
    )
    .neq("status", "reembolsada")
    .gte("created_at", inicio.toISOString())
    .lt("created_at", fim.toISOString());

  if (erroVendas) {
    console.error("Erro ao buscar vendas (admin/relatorio):", erroVendas.message);
    return NextResponse.json(
      { erro: "Erro ao gerar relatório." },
      { status: 500 },
    );
  }

  const { data: vagas, error: erroVagas } = await supabaseAdmin
    .from("vagas")
    .select("id, roteiro_id");

  if (erroVagas) {
    console.error("Erro ao buscar vagas (admin/relatorio):", erroVagas.message);
    return NextResponse.json(
      { erro: "Erro ao gerar relatório." },
      { status: 500 },
    );
  }

  const { data: roteiros, error: erroRoteiros } = await supabaseAdmin
    .from("roteiros")
    .select("id, nome");

  if (erroRoteiros) {
    console.error(
      "Erro ao buscar roteiros (admin/relatorio):",
      erroRoteiros.message,
    );
    return NextResponse.json(
      { erro: "Erro ao gerar relatório." },
      { status: 500 },
    );
  }

  const roteiroIdPorVagaId = new Map(
    (vagas ?? []).map((vaga) => [vaga.id, vaga.roteiro_id as string]),
  );
  const nomePorRoteiroId = new Map(
    (roteiros ?? []).map((roteiro) => [roteiro.id, roteiro.nome as string]),
  );

  let receitaBruta = 0;
  let valorRoteirosTotal = 0;
  let taxaTotal = 0;

  const porRoteiro = new Map<
    string,
    { roteiro_id: string; nome: string; total_vendas: number; valor_roteiros: number }
  >();
  const porFormaPagamento = new Map<
    string,
    { forma_pagamento: string; total_vendas: number; valor_roteiros: number }
  >();

  for (const venda of (vendas ?? []) as Venda[]) {
    const valorTotal = Number(venda.valor_total);

    const taxa = venda.venda_manual
      ? Number(venda.taxa_devida_valor ?? 0)
      : Number(venda.taxa_valor ?? 0);
    const valorRoteiro = venda.venda_manual ? valorTotal : valorTotal - taxa;

    receitaBruta += valorTotal;
    valorRoteirosTotal += valorRoteiro;
    taxaTotal += taxa;

    const roteiroId = roteiroIdPorVagaId.get(venda.vaga_id) ?? "desconhecido";
    const nomeRoteiro =
      roteiroId !== "desconhecido"
        ? nomePorRoteiroId.get(roteiroId) ?? "Roteiro desconhecido"
        : "Roteiro desconhecido";

    const entradaRoteiro = porRoteiro.get(roteiroId) ?? {
      roteiro_id: roteiroId,
      nome: nomeRoteiro,
      total_vendas: 0,
      valor_roteiros: 0,
    };
    entradaRoteiro.total_vendas += 1;
    entradaRoteiro.valor_roteiros += valorRoteiro;
    porRoteiro.set(roteiroId, entradaRoteiro);

    const entradaForma = porFormaPagamento.get(venda.forma_pagamento) ?? {
      forma_pagamento: venda.forma_pagamento,
      total_vendas: 0,
      valor_roteiros: 0,
    };
    entradaForma.total_vendas += 1;
    entradaForma.valor_roteiros += valorRoteiro;
    porFormaPagamento.set(venda.forma_pagamento, entradaForma);
  }

  return NextResponse.json({
    mes,
    resumo: {
      total_vendas: vendas?.length ?? 0,
      receita_bruta: arredondar(receitaBruta),
      valor_roteiros: arredondar(valorRoteirosTotal),
      taxa_total: arredondar(taxaTotal),
    },
    por_roteiro: Array.from(porRoteiro.values())
      .map((item) => ({ ...item, valor_roteiros: arredondar(item.valor_roteiros) }))
      .sort((a, b) => b.valor_roteiros - a.valor_roteiros),
    por_forma_pagamento: Array.from(porFormaPagamento.values()).map((item) => ({
      ...item,
      valor_roteiros: arredondar(item.valor_roteiros),
    })),
  });
}
