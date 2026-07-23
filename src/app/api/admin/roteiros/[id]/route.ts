import { NextResponse } from "next/server";
import {
  requireAdminSession,
  AdminSessionError,
} from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { gerarSlug } from "@/lib/slug";

const TIPOS_VALIDOS = ["emissivel", "receptivo"];

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

  const supabaseAdmin = createAdminClient();
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

  // tipo/preco_receptivo não entram direto em `atualizacoes` aqui - a
  // obrigatoriedade de preco_receptivo pra tipo 'receptivo' depende do
  // tipo EFETIVO do roteiro (o que está sendo setado agora, ou o que já
  // está no banco se este PATCH não mexe em tipo), então a validação
  // fica no bloco abaixo, depois de parsear os dois campos.
  let tipoNovo: string | undefined;
  if (body?.tipo !== undefined) {
    if (typeof body.tipo !== "string" || !TIPOS_VALIDOS.includes(body.tipo)) {
      return NextResponse.json(
        { erro: "tipo deve ser 'emissivel' ou 'receptivo'." },
        { status: 400 },
      );
    }
    tipoNovo = body.tipo;
  }

  let precoReceptivoNovo: number | null | undefined;
  if (body?.preco_receptivo !== undefined) {
    if (
      body.preco_receptivo !== null &&
      (typeof body.preco_receptivo !== "number" ||
        !Number.isFinite(body.preco_receptivo) ||
        body.preco_receptivo <= 0)
    ) {
      return NextResponse.json(
        { erro: "preco_receptivo deve ser um número positivo ou null." },
        { status: 400 },
      );
    }
    precoReceptivoNovo = body.preco_receptivo;
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

  // Invariante tipo/preco_receptivo: só precisa saber o tipo/preço
  // EFETIVO (o que não veio neste PATCH busca no banco) se um dos dois
  // campos está sendo tocado - editar só, por exemplo, custo_fixo_execucao
  // não deve disparar uma leitura extra nem mexer em tipo/preco_receptivo.
  if (tipoNovo !== undefined || precoReceptivoNovo !== undefined) {
    let tipoEfetivo = tipoNovo;
    let precoEfetivo = precoReceptivoNovo;

    if (tipoEfetivo === undefined || precoEfetivo === undefined) {
      const { data: atual, error: erroAtual } = await supabaseAdmin
        .from("roteiros")
        .select("tipo, preco_receptivo")
        .eq("id", id)
        .maybeSingle();

      if (erroAtual) {
        console.error(
          "Erro ao buscar roteiro para validar tipo/preco_receptivo (admin):",
          erroAtual.message,
        );
        return NextResponse.json(
          { erro: "Erro ao editar roteiro." },
          { status: 500 },
        );
      }

      if (!atual) {
        return NextResponse.json(
          { erro: "Roteiro não encontrado." },
          { status: 404 },
        );
      }

      if (tipoEfetivo === undefined) tipoEfetivo = atual.tipo;
      if (precoEfetivo === undefined) precoEfetivo = atual.preco_receptivo;
    }

    if (tipoEfetivo === "receptivo") {
      if (precoEfetivo === null || precoEfetivo === undefined) {
        return NextResponse.json(
          {
            erro:
              "preco_receptivo é obrigatório e deve ser um número positivo quando tipo = 'receptivo'.",
          },
          { status: 400 },
        );
      }
    } else {
      // emissivel: preco_receptivo sempre null, mesmo que tenha vindo
      // preenchido por engano no body - ignora silenciosamente.
      precoEfetivo = null;
    }

    if (tipoNovo !== undefined) atualizacoes.tipo = tipoNovo;
    atualizacoes.preco_receptivo = precoEfetivo;
  }

  if (Object.keys(atualizacoes).length === 0) {
    return NextResponse.json(
      { erro: "Nenhum campo para atualizar." },
      { status: 400 },
    );
  }

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
