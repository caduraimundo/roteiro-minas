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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
  } catch (erro) {
    if (erro instanceof AdminSessionError) {
      return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
    }
    throw erro;
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const atualizacoes: Record<string, unknown> = {};

  if (body?.codigo !== undefined) {
    const codigo =
      typeof body.codigo === "string" ? body.codigo.trim().toUpperCase() : "";
    if (!codigo) {
      return NextResponse.json(
        { erro: "codigo inválido." },
        { status: 400 },
      );
    }
    atualizacoes.codigo = codigo;
  }

  const supabaseAdmin = createAdminClient();

  if (body?.roteiro_id !== undefined) {
    if (typeof body.roteiro_id !== "string" || !body.roteiro_id) {
      return NextResponse.json(
        { erro: "roteiro_id inválido." },
        { status: 400 },
      );
    }

    const { data: roteiro, error: erroRoteiro } = await supabaseAdmin
      .from("roteiros")
      .select("id")
      .eq("id", body.roteiro_id)
      .maybeSingle();

    if (erroRoteiro) {
      console.error(
        "Erro ao validar roteiro para editar cupom (admin):",
        erroRoteiro.message,
      );
      return NextResponse.json(
        { erro: "Erro ao editar cupom." },
        { status: 500 },
      );
    }

    if (!roteiro) {
      return NextResponse.json(
        { erro: "Roteiro não encontrado." },
        { status: 400 },
      );
    }

    atualizacoes.roteiro_id = body.roteiro_id;
  }

  if (body?.percentual_desconto !== undefined) {
    if (!percentualValido(body.percentual_desconto)) {
      return NextResponse.json(
        {
          erro:
            "percentual_desconto deve ser maior que 0 e menor ou igual a 100.",
        },
        { status: 400 },
      );
    }
    atualizacoes.percentual_desconto = body.percentual_desconto;
  }

  if (body?.ativo !== undefined) {
    if (typeof body.ativo !== "boolean") {
      return NextResponse.json(
        { erro: "ativo deve ser um booleano." },
        { status: 400 },
      );
    }
    atualizacoes.ativo = body.ativo;
  }

  if (Object.keys(atualizacoes).length === 0) {
    return NextResponse.json(
      { erro: "Nenhum campo para atualizar." },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("cupons")
    .update(atualizacoes)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { erro: "Já existe um cupom com esse código." },
        { status: 409 },
      );
    }

    console.error("Erro ao editar cupom (admin):", error.message);
    return NextResponse.json(
      { erro: "Erro ao editar cupom." },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { erro: "Cupom não encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json({ cupom: data });
}
