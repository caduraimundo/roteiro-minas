import { NextResponse } from "next/server";
import {
  requireAdminSession,
  AdminSessionError,
} from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const CAMPOS_EDITAVEIS = [
  "cadastur_numero",
  "stats_seguidores_instagram",
  "stats_roteiros_realizados",
  "stats_avaliacao_media",
  "cancelamento_texto",
] as const;

export async function PATCH(request: Request) {
  try {
    await requireAdminSession();
  } catch (erro) {
    if (erro instanceof AdminSessionError) {
      return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
    }
    throw erro;
  }

  const body = await request.json().catch(() => null);

  const atualizacoes: Record<string, unknown> = {};

  for (const campo of CAMPOS_EDITAVEIS) {
    if (body?.[campo] === undefined) continue;

    if (body[campo] !== null && typeof body[campo] !== "string") {
      return NextResponse.json(
        { erro: `${campo} deve ser string ou null.` },
        { status: 400 },
      );
    }

    atualizacoes[campo] = body[campo];
  }

  if (Object.keys(atualizacoes).length === 0) {
    return NextResponse.json(
      { erro: "Nenhum campo para atualizar." },
      { status: 400 },
    );
  }

  atualizacoes.updated_at = new Date().toISOString();

  const supabaseAdmin = createAdminClient();

  // Singleton - sempre uma linha só. Busca o id dela primeiro em vez de
  // fazer UPDATE sem filtro, pra nunca correr o risco de atualizar (ou
  // silenciosamente ignorar) mais de uma linha por engano; nunca faz
  // INSERT, então não cria uma segunda linha.
  const { data: linhaAtual, error: erroBusca } = await supabaseAdmin
    .from("configuracoes_site")
    .select("id")
    .single();

  if (erroBusca || !linhaAtual) {
    console.error(
      "Erro ao buscar linha única de configuracoes_site:",
      erroBusca?.message,
    );
    return NextResponse.json(
      { erro: "Erro ao editar configurações." },
      { status: 500 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("configuracoes_site")
    .update(atualizacoes)
    .eq("id", linhaAtual.id)
    .select(
      "cadastur_numero, stats_seguidores_instagram, stats_roteiros_realizados, stats_avaliacao_media, cancelamento_texto, updated_at",
    )
    .single();

  if (error) {
    console.error("Erro ao editar configurações do site:", error.message);
    return NextResponse.json(
      { erro: "Erro ao editar configurações." },
      { status: 500 },
    );
  }

  return NextResponse.json({ configuracoes: data });
}
