import { NextResponse } from "next/server";
import {
  requireAdminSession,
  AdminSessionError,
} from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const status = searchParams.get("status");

  const supabaseAdmin = createAdminClient();

  let query = supabaseAdmin
    .from("vendas")
    .select(
      "id, vaga_id, comprador_nome, comprador_email, comprador_cpf, valor_total, status, created_at, venda_manual, codigo_verificacao, vagas!inner(roteiro_id)",
    )
    .order("created_at", { ascending: false });

  if (roteiroId) {
    query = query.eq("vagas.roteiro_id", roteiroId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao listar vendas (admin):", error.message);
    return NextResponse.json(
      { erro: "Erro ao buscar vendas." },
      { status: 500 },
    );
  }

  // Remove o embed de `vagas` usado só pra filtrar por roteiro_id - o
  // admin não precisa dele na listagem, só os campos pedidos.
  const vendas = (data ?? []).map(
    ({ vagas: _vagas, ...resto }) => resto,
  );

  return NextResponse.json({ vendas });
}
