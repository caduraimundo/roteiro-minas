import { NextResponse } from "next/server";
import {
  requireAdminSession,
  AdminSessionError,
} from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

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
