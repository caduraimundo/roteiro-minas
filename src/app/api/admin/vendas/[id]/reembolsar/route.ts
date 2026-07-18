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

  const { data: resultado, error } = (await supabaseAdmin
    .rpc("marcar_venda_reembolsada", { p_venda_id: id })
    .single()) as {
    data: { sucesso: boolean; motivo: string | null } | null;
    error: { message: string } | null;
  };

  if (error || !resultado) {
    console.error(
      "Erro ao marcar venda reembolsada (admin):",
      error?.message,
    );
    return NextResponse.json(
      { erro: "Erro ao reembolsar venda." },
      { status: 500 },
    );
  }

  if (!resultado.sucesso) {
    return NextResponse.json(
      { erro: "Venda não encontrada ou não está mais confirmada." },
      { status: 400 },
    );
  }

  return NextResponse.json({ sucesso: true });
}
