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
