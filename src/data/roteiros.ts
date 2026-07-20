import { createClient } from "@/lib/supabase/server";

export type Vaga = {
  id: string;
  roteiro_id: string;
  data: string;
  preco: number;
  vagas_totais: number;
  vagas_disponiveis: number;
  status: "aberta" | "lotada" | "cancelada";
  created_at: string;
};

export type Roteiro = {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  tipo: "fixo" | "personalizado";
  pdf_url: string | null;
  ativo: boolean;
  created_at: string;
  custo_fixo_execucao: number | null;
  custo_variavel_pessoa: number | null;
};

export type RoteiroComVagas = Roteiro & { vagas: Vaga[] };

function vagaTemVagaDisponivel(vaga: Vaga) {
  return vaga.status === "aberta" && vaga.vagas_disponiveis > 0;
}

/** Vaga disponível mais barata entre as vagas em aberto de um roteiro, ou `null` se esgotado. */
export function proximaVagaDisponivel(vagas: Vaga[]): Vaga | null {
  const disponiveis = vagas.filter(vagaTemVagaDisponivel);
  if (disponiveis.length === 0) return null;

  return disponiveis.reduce((maisBarata, vaga) =>
    vaga.preco < maisBarata.preco ? vaga : maisBarata,
  );
}

export async function getRoteirosAtivos(): Promise<RoteiroComVagas[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roteiros")
    .select("*, vagas(*)")
    .eq("ativo", true)
    .order("nome");

  if (error) throw error;

  return data as RoteiroComVagas[];
}

export async function getRoteiroPorSlug(
  slug: string,
): Promise<RoteiroComVagas | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roteiros")
    .select("*, vagas(*)")
    .eq("slug", slug)
    .eq("ativo", true)
    .maybeSingle();

  if (error) throw error;

  return data as RoteiroComVagas | null;
}

export async function getVagaComRoteiro(
  vagaId: string,
): Promise<{ vaga: Vaga; roteiro: Roteiro } | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vagas")
    .select("*, roteiro:roteiros(*)")
    .eq("id", vagaId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { roteiro, ...vaga } = data as Vaga & { roteiro: Roteiro };

  return { vaga, roteiro };
}
