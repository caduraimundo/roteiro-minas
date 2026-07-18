import { NextResponse } from "next/server";
import {
  requireAdminSession,
  AdminSessionError,
} from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { gerarSlug } from "@/lib/slug";

const TIPOS_VALIDOS = ["fixo", "personalizado"];

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
      { erro: "tipo deve ser 'fixo' ou 'personalizado'." },
      { status: 400 },
    );
  }
  const tipo = body.tipo;

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
      pdf_url: pdfUrl,
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
