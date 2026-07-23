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
  const body = await request.json().catch(() => null);

  // Só alterna ativo (bloquear/desbloquear) - mudar a data em si não é
  // suportado aqui, cria-se um novo bloqueio pra outra data.
  if (typeof body?.ativo !== "boolean") {
    return NextResponse.json(
      { erro: "ativo é obrigatório e deve ser um booleano." },
      { status: 400 },
    );
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("roteiro_datas_indisponiveis")
    .update({ ativo: body.ativo })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao alternar data indisponível (admin):",
      error.message,
    );
    return NextResponse.json(
      { erro: "Erro ao atualizar data indisponível." },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { erro: "Data indisponível não encontrada." },
      { status: 404 },
    );
  }

  return NextResponse.json({ data_indisponivel: data });
}
