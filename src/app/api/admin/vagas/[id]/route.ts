import { NextResponse } from "next/server";
import {
  requireAdminSession,
  AdminSessionError,
} from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const STATUS_VALIDOS = ["aberta", "lotada", "cancelada"];

function dataValida(valor: unknown): valor is string {
  return typeof valor === "string" && !Number.isNaN(Date.parse(valor));
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

  if (body?.vagas_disponiveis !== undefined) {
    return NextResponse.json(
      {
        erro:
          "vagas_disponiveis não é editável diretamente - é derivado de vagas_totais.",
      },
      { status: 400 },
    );
  }

  const atualizacoes: Record<string, unknown> = {};

  if (body?.data !== undefined) {
    if (!dataValida(body.data)) {
      return NextResponse.json(
        { erro: "data inválida." },
        { status: 400 },
      );
    }
    atualizacoes.data = body.data;
  }

  if (body?.preco !== undefined) {
    if (
      typeof body.preco !== "number" ||
      !Number.isFinite(body.preco) ||
      body.preco <= 0
    ) {
      return NextResponse.json(
        { erro: "preco deve ser um número positivo." },
        { status: 400 },
      );
    }
    atualizacoes.preco = body.preco;
  }

  if (body?.status !== undefined) {
    if (typeof body.status !== "string" || !STATUS_VALIDOS.includes(body.status)) {
      return NextResponse.json(
        { erro: "status deve ser 'aberta', 'lotada' ou 'cancelada'." },
        { status: 400 },
      );
    }
    atualizacoes.status = body.status;
  }

  const supabaseAdmin = createAdminClient();

  if (body?.vagas_totais !== undefined) {
    if (
      typeof body.vagas_totais !== "number" ||
      !Number.isInteger(body.vagas_totais) ||
      body.vagas_totais <= 0
    ) {
      return NextResponse.json(
        { erro: "vagas_totais deve ser um inteiro positivo." },
        { status: 400 },
      );
    }

    const { data: vagaAtual, error: erroVagaAtual } = await supabaseAdmin
      .from("vagas")
      .select("vagas_totais, vagas_disponiveis")
      .eq("id", id)
      .maybeSingle();

    if (erroVagaAtual) {
      console.error(
        "Erro ao buscar vaga para editar vagas_totais (admin):",
        erroVagaAtual.message,
      );
      return NextResponse.json(
        { erro: "Erro ao editar vaga." },
        { status: 500 },
      );
    }

    if (!vagaAtual) {
      return NextResponse.json(
        { erro: "Vaga não encontrada." },
        { status: 404 },
      );
    }

    const vendidas = vagaAtual.vagas_totais - vagaAtual.vagas_disponiveis;

    if (body.vagas_totais < vendidas) {
      return NextResponse.json(
        {
          erro: `Não é possível reduzir abaixo do que já foi vendido (${vendidas}).`,
        },
        { status: 400 },
      );
    }

    atualizacoes.vagas_totais = body.vagas_totais;
    atualizacoes.vagas_disponiveis = body.vagas_totais - vendidas;
  }

  if (Object.keys(atualizacoes).length === 0) {
    return NextResponse.json(
      { erro: "Nenhum campo para atualizar." },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("vagas")
    .update(atualizacoes)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Erro ao editar vaga (admin):", error.message);
    return NextResponse.json(
      { erro: "Erro ao editar vaga." },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { erro: "Vaga não encontrada." },
      { status: 404 },
    );
  }

  return NextResponse.json({ vaga: data });
}
