import { NextResponse } from "next/server";
import {
  requireAdminSession,
  AdminSessionError,
} from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("vendas")
    .update({ taxa_devida_acertada_em: new Date().toISOString() })
    .eq("id", id)
    .eq("venda_manual", true)
    .not("taxa_devida_valor", "is", null)
    .is("taxa_devida_acertada_em", null)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Erro ao marcar taxa devida acertada (admin):", error.message);
    return NextResponse.json(
      { erro: "Erro ao marcar taxa como acertada." },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      {
        erro:
          "Venda não encontrada, não é venda manual, ou taxa já foi acertada.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ sucesso: true });
}
