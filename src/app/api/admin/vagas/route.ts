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
  const { data, error } = await supabaseAdmin
    .from("vagas")
    .select("*")
    .eq("roteiro_id", roteiroId)
    .order("data");

  if (error) {
    console.error("Erro ao listar vagas (admin):", error.message);
    return NextResponse.json(
      { erro: "Erro ao buscar vagas." },
      { status: 500 },
    );
  }

  return NextResponse.json({ vagas: data });
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

  const preco = body?.preco;
  if (typeof preco !== "number" || !Number.isFinite(preco) || preco <= 0) {
    return NextResponse.json(
      { erro: "preco é obrigatório e deve ser um número positivo." },
      { status: 400 },
    );
  }

  const vagasTotais = body?.vagas_totais;
  if (
    typeof vagasTotais !== "number" ||
    !Number.isInteger(vagasTotais) ||
    vagasTotais <= 0
  ) {
    return NextResponse.json(
      {
        erro: "vagas_totais é obrigatório e deve ser um inteiro positivo.",
      },
      { status: 400 },
    );
  }

  const supabaseAdmin = createAdminClient();

  const { data: roteiro, error: erroRoteiro } = await supabaseAdmin
    .from("roteiros")
    .select("id")
    .eq("id", roteiroId)
    .maybeSingle();

  if (erroRoteiro) {
    console.error(
      "Erro ao validar roteiro para criação de vaga (admin):",
      erroRoteiro.message,
    );
    return NextResponse.json(
      { erro: "Erro ao criar vaga." },
      { status: 500 },
    );
  }

  if (!roteiro) {
    return NextResponse.json(
      { erro: "Roteiro não encontrado." },
      { status: 400 },
    );
  }

  const { data: vaga, error } = await supabaseAdmin
    .from("vagas")
    .insert({
      roteiro_id: roteiroId,
      data,
      preco,
      vagas_totais: vagasTotais,
      vagas_disponiveis: vagasTotais,
      status: "aberta",
    })
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao criar vaga (admin):", error.message);
    return NextResponse.json(
      { erro: "Erro ao criar vaga." },
      { status: 500 },
    );
  }

  return NextResponse.json({ vaga }, { status: 201 });
}
