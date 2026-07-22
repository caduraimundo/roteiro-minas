import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("configuracoes_site")
    .select(
      "cadastur_numero, stats_seguidores_instagram, stats_roteiros_realizados, stats_avaliacao_media, cancelamento_texto, updated_at",
    )
    .single();

  if (error) {
    console.error("Erro ao buscar configurações do site:", error.message);
    return NextResponse.json(
      { erro: "Erro ao buscar configurações." },
      { status: 500 },
    );
  }

  return NextResponse.json({ configuracoes: data });
}
