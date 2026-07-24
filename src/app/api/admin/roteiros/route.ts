import { NextResponse } from "next/server";
import {
  requireAdminSession,
  AdminSessionError,
} from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { gerarSlug } from "@/lib/slug";

const TIPOS_VALIDOS = ["emissivel", "receptivo"];
// Mesmo conjunto do CHECK da migração
// 20260724120000_roteiros_categoria_dificuldade.sql.
const CATEGORIAS_VALIDAS = ["trilha", "cachoeira", "travessia", "cultural"];
const NIVEIS_DIFICULDADE_VALIDOS = ["leve", "moderado", "dificil", "extremo"];

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
    .from("roteiros")
    .select("*")
    .order("nome");

  if (error) {
    console.error("Erro ao listar roteiros (admin):", error.message);
    return NextResponse.json(
      { erro: "Erro ao buscar roteiros." },
      { status: 500 },
    );
  }

  return NextResponse.json({ roteiros: data });
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

  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";
  if (!nome) {
    return NextResponse.json(
      { erro: "nome é obrigatório." },
      { status: 400 },
    );
  }

  const descricao =
    typeof body?.descricao === "string" ? body.descricao : null;
  const pdfUrl = typeof body?.pdf_url === "string" ? body.pdf_url : null;

  // tipo é NOT NULL no banco (coluna `tipo` de `roteiros`), mesmo não
  // sendo pedido no body no schema documentado - sem valor válido aqui o
  // insert quebraria com erro genérico do Postgres.
  if (typeof body?.tipo !== "string" || !TIPOS_VALIDOS.includes(body.tipo)) {
    return NextResponse.json(
      { erro: "tipo deve ser 'emissivel' ou 'receptivo'." },
      { status: 400 },
    );
  }
  const tipo = body.tipo;

  // preco_receptivo é obrigatório só pra tipo 'receptivo' (preço fixo,
  // sem vaga) - pra 'emissivel' o preço vem por vaga (vagas.preco), então
  // este campo fica sempre null, mesmo que venha preenchido por engano.
  let precoReceptivo: number | null = null;
  if (tipo === "receptivo") {
    if (
      typeof body?.preco_receptivo !== "number" ||
      !Number.isFinite(body.preco_receptivo) ||
      body.preco_receptivo <= 0
    ) {
      return NextResponse.json(
        {
          erro:
            "preco_receptivo é obrigatório e deve ser um número positivo quando tipo = 'receptivo'.",
        },
        { status: 400 },
      );
    }
    precoReceptivo = body.preco_receptivo;
  }

  const categoria =
    typeof body?.categoria === "string" && body.categoria.trim() !== ""
      ? body.categoria
      : null;
  if (categoria !== null && !CATEGORIAS_VALIDAS.includes(categoria)) {
    return NextResponse.json(
      { erro: "categoria inválida." },
      { status: 400 },
    );
  }

  const nivelDificuldade =
    typeof body?.nivel_dificuldade === "string" &&
    body.nivel_dificuldade.trim() !== ""
      ? body.nivel_dificuldade
      : null;
  if (
    nivelDificuldade !== null &&
    !NIVEIS_DIFICULDADE_VALIDOS.includes(nivelDificuldade)
  ) {
    return NextResponse.json(
      { erro: "nivel_dificuldade inválido." },
      { status: 400 },
    );
  }

  const slug = gerarSlug(nome);
  if (!slug) {
    return NextResponse.json(
      { erro: "nome inválido para gerar slug." },
      { status: 400 },
    );
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("roteiros")
    .insert({
      nome,
      descricao,
      tipo,
      preco_receptivo: precoReceptivo,
      pdf_url: pdfUrl,
      categoria,
      nivel_dificuldade: nivelDificuldade,
      slug,
      ativo: true,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { erro: "Já existe um roteiro com esse nome (slug duplicado)." },
        { status: 409 },
      );
    }

    console.error("Erro ao criar roteiro (admin):", error.message);
    return NextResponse.json(
      { erro: "Erro ao criar roteiro." },
      { status: 500 },
    );
  }

  return NextResponse.json({ roteiro: data }, { status: 201 });
}
