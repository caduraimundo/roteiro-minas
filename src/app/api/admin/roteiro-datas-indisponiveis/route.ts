import { NextResponse } from "next/server";
import {
  requireAdminSession,
  AdminSessionError,
} from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

function dataValida(valor: unknown): valor is string {
  return typeof valor === "string" && !Number.isNaN(Date.parse(valor));
}

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
  const roteiroId = searchParams.get("roteiro_id");

  if (!roteiroId) {
    return NextResponse.json(
      { erro: "roteiro_id é obrigatório." },
      { status: 400 },
    );
  }

  const supabaseAdmin = createAdminClient();

  // Todas as linhas, incluindo ativo = false - visão de histórico do
  // admin (o público só vê ativo = true, via RLS).
  const { data, error } = await supabaseAdmin
    .from("roteiro_datas_indisponiveis")
    .select("*")
    .eq("roteiro_id", roteiroId)
    .order("data");

  if (error) {
    console.error(
      "Erro ao listar datas indisponíveis (admin):",
      error.message,
    );
    return NextResponse.json(
      { erro: "Erro ao buscar datas indisponíveis." },
      { status: 500 },
    );
  }

  return NextResponse.json({ datas_indisponiveis: data });
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
  } catch (erro) {
    if (erro instanceof AdminSessionError) {
      return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
    }
    throw erro;
  }

  const body = await request.json().catch(() => null);

  const roteiroId =
    typeof body?.roteiro_id === "string" ? body.roteiro_id : "";
  if (!roteiroId) {
    return NextResponse.json(
      { erro: "roteiro_id é obrigatório." },
      { status: 400 },
    );
  }

  if (!dataValida(body?.data)) {
    return NextResponse.json(
      { erro: "data é obrigatória e deve ser uma data válida." },
      { status: 400 },
    );
  }
  const data = body.data;

  const supabaseAdmin = createAdminClient();

  const { data: roteiro, error: erroRoteiro } = await supabaseAdmin
    .from("roteiros")
    .select("id")
    .eq("id", roteiroId)
    .maybeSingle();

  if (erroRoteiro) {
    console.error(
      "Erro ao validar roteiro para bloquear data (admin):",
      erroRoteiro.message,
    );
    return NextResponse.json(
      { erro: "Erro ao bloquear data." },
      { status: 500 },
    );
  }

  if (!roteiro) {
    return NextResponse.json(
      { erro: "Roteiro não encontrado." },
      { status: 400 },
    );
  }

  // (roteiro_id, data) é UNIQUE - se já existe uma linha pra essa data
  // (de um bloqueio anterior desativado), reativa em vez de tentar um
  // INSERT que colidiria com o constraint.
  const { data: existente, error: erroExistente } = await supabaseAdmin
    .from("roteiro_datas_indisponiveis")
    .select("*")
    .eq("roteiro_id", roteiroId)
    .eq("data", data)
    .maybeSingle();

  if (erroExistente) {
    console.error(
      "Erro ao verificar bloqueio existente (admin):",
      erroExistente.message,
    );
    return NextResponse.json(
      { erro: "Erro ao bloquear data." },
      { status: 500 },
    );
  }

  if (existente) {
    if (existente.ativo) {
      // Já bloqueada - idempotente, devolve a linha como está.
      return NextResponse.json({ data_indisponivel: existente });
    }

    const { data: reativada, error: erroReativar } = await supabaseAdmin
      .from("roteiro_datas_indisponiveis")
      .update({ ativo: true })
      .eq("id", existente.id)
      .select("*")
      .single();

    if (erroReativar) {
      console.error(
        "Erro ao reativar bloqueio de data (admin):",
        erroReativar.message,
      );
      return NextResponse.json(
        { erro: "Erro ao bloquear data." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data_indisponivel: reativada });
  }

  const { data: novo, error } = await supabaseAdmin
    .from("roteiro_datas_indisponiveis")
    .insert({ roteiro_id: roteiroId, data, ativo: true })
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao bloquear data (admin):", error.message);
    return NextResponse.json(
      { erro: "Erro ao bloquear data." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data_indisponivel: novo }, { status: 201 });
}
