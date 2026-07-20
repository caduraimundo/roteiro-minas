import { NextResponse } from "next/server";
import {
  requireAdminSession,
  AdminSessionError,
} from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { gerarSlug } from "@/lib/slug";

const TIPOS_VALIDOS = ["fixo", "personalizado"];

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

  if (body?.nome !== undefined) {
    if (typeof body.nome !== "string" || !body.nome.trim()) {
      return NextResponse.json(
        { erro: "nome inválido." },
        { status: 400 },
      );
    }
    // editar nome não regenera slug automaticamente - o slug é usado em
    // URL pública, mudar silenciosamente quebraria links já compartilhados.
    atualizacoes.nome = body.nome.trim();
  }

  if (body?.descricao !== undefined) {
    if (body.descricao !== null && typeof body.descricao !== "string") {
      return NextResponse.json(
        { erro: "descricao inválida." },
        { status: 400 },
      );
    }
    atualizacoes.descricao = body.descricao;
  }

  if (body?.tipo !== undefined) {
    if (typeof body.tipo !== "string" || !TIPOS_VALIDOS.includes(body.tipo)) {
      return NextResponse.json(
        { erro: "tipo deve ser 'fixo' ou 'personalizado'." },
        { status: 400 },
      );
    }
    atualizacoes.tipo = body.tipo;
  }

  if (body?.pdf_url !== undefined) {
    if (body.pdf_url !== null && typeof body.pdf_url !== "string") {
      return NextResponse.json(
        { erro: "pdf_url inválida." },
        { status: 400 },
      );
    }
    atualizacoes.pdf_url = body.pdf_url;
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

  if (body?.custo_fixo_execucao !== undefined) {
    if (
      body.custo_fixo_execucao !== null &&
      (typeof body.custo_fixo_execucao !== "number" ||
        !Number.isFinite(body.custo_fixo_execucao))
    ) {
      return NextResponse.json(
        { erro: "custo_fixo_execucao deve ser numérico ou null." },
        { status: 400 },
      );
    }
    atualizacoes.custo_fixo_execucao = body.custo_fixo_execucao;
  }

  if (body?.custo_variavel_pessoa !== undefined) {
    if (
      body.custo_variavel_pessoa !== null &&
      (typeof body.custo_variavel_pessoa !== "number" ||
        !Number.isFinite(body.custo_variavel_pessoa))
    ) {
      return NextResponse.json(
        { erro: "custo_variavel_pessoa deve ser numérico ou null." },
        { status: 400 },
      );
    }
    atualizacoes.custo_variavel_pessoa = body.custo_variavel_pessoa;
  }

  if (body?.slug !== undefined) {
    const slug =
      typeof body.slug === "string" ? gerarSlug(body.slug) : "";
    if (!slug) {
      return NextResponse.json(
        { erro: "slug inválido." },
        { status: 400 },
      );
    }
    atualizacoes.slug = slug;
  }

  if (Object.keys(atualizacoes).length === 0) {
    return NextResponse.json(
      { erro: "Nenhum campo para atualizar." },
      { status: 400 },
    );
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("roteiros")
    .update(atualizacoes)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { erro: "Já existe um roteiro com esse slug." },
        { status: 409 },
      );
    }

    console.error("Erro ao editar roteiro (admin):", error.message);
    return NextResponse.json(
      { erro: "Erro ao editar roteiro." },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { erro: "Roteiro não encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json({ roteiro: data });
}
