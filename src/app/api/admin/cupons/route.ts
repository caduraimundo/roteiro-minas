import { NextResponse } from "next/server";
import {
  requireAdminSession,
  AdminSessionError,
} from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

function percentualValido(valor: unknown): valor is number {
  return (
    typeof valor === "number" &&
    Number.isFinite(valor) &&
    valor > 0 &&
    valor <= 100
  );
}

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
  const { data, error } = await supabaseAdmin
    .from("cupons")
    .select("*")
    .order("codigo");

  if (error) {
    console.error("Erro ao listar cupons (admin):", error.message);
    return NextResponse.json(
      { erro: "Erro ao buscar cupons." },
      { status: 500 },
    );
  }

  return NextResponse.json({ cupons: data });
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

  const codigo =
    typeof body?.codigo === "string" ? body.codigo.trim().toUpperCase() : "";
  if (!codigo) {
    return NextResponse.json(
      { erro: "codigo é obrigatório." },
      { status: 400 },
    );
  }

  const roteiroId =
    typeof body?.roteiro_id === "string" ? body.roteiro_id : "";
  if (!roteiroId) {
    return NextResponse.json(
      { erro: "roteiro_id é obrigatório." },
      { status: 400 },
    );
  }

  if (!percentualValido(body?.percentual_desconto)) {
    return NextResponse.json(
      {
        erro:
          "percentual_desconto é obrigatório e deve ser maior que 0 e menor ou igual a 100.",
      },
      { status: 400 },
    );
  }
  const percentualDesconto = body.percentual_desconto;

  const supabaseAdmin = createAdminClient();

  const { data: roteiro, error: erroRoteiro } = await supabaseAdmin
    .from("roteiros")
    .select("id")
    .eq("id", roteiroId)
    .maybeSingle();

  if (erroRoteiro) {
    console.error(
      "Erro ao validar roteiro para criação de cupom (admin):",
      erroRoteiro.message,
    );
    return NextResponse.json(
      { erro: "Erro ao criar cupom." },
      { status: 500 },
    );
  }

  if (!roteiro) {
    return NextResponse.json(
      { erro: "Roteiro não encontrado." },
      { status: 400 },
    );
  }

  const { data: cupom, error } = await supabaseAdmin
    .from("cupons")
    .insert({
      codigo,
      roteiro_id: roteiroId,
      percentual_desconto: percentualDesconto,
      ativo: true,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { erro: "Já existe um cupom com esse código." },
        { status: 409 },
      );
    }

    console.error("Erro ao criar cupom (admin):", error.message);
    return NextResponse.json(
      { erro: "Erro ao criar cupom." },
      { status: 500 },
    );
  }

  return NextResponse.json({ cupom }, { status: 201 });
}
