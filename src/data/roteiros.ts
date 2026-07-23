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

export type DataIndisponivel = {
  data: string;
};

export type Roteiro = {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  tipo: "emissivel" | "receptivo";
  pdf_url: string | null;
  ativo: boolean;
  created_at: string;
  custo_fixo_execucao: number | null;
  custo_variavel_pessoa: number | null;
  // Preço fixo pro tipo 'receptivo' - sempre null pra 'emissivel', que
  // continua usando o preço por vaga (Vaga.preco).
  preco_receptivo: number | null;
};

// Sempre presente (mesmo pra roteiros emissíveis, onde vem vazio) -
// mesmo tratamento simétrico já dado a `vagas` abaixo. Só tem conteúdo
// de fato pra roteiros receptivos (bloqueio manual de data pelo admin).
export type RoteiroComVagas = Roteiro & {
  vagas: Vaga[];
  datas_indisponiveis: DataIndisponivel[];
};

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

// datas_indisponiveis: embed filtrado (sem !inner) - o roteiro continua
// retornado mesmo sem nenhuma linha bloqueada (emissíveis, ou
// receptivos sem bloqueio ativo no momento), só a lista de datas vem
// vazia nesse caso.
const SELECT_ROTEIRO_COM_VAGAS =
  "*, vagas(*), datas_indisponiveis:roteiro_datas_indisponiveis(data)";

export async function getRoteirosAtivos(): Promise<RoteiroComVagas[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roteiros")
    .select(SELECT_ROTEIRO_COM_VAGAS)
    .eq("ativo", true)
    .eq("datas_indisponiveis.ativo", true)
    .order("nome");

  if (error) throw error;

  return data as unknown as RoteiroComVagas[];
}

export async function getRoteiroPorSlug(
  slug: string,
): Promise<RoteiroComVagas | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roteiros")
    .select(SELECT_ROTEIRO_COM_VAGAS)
    .eq("slug", slug)
    .eq("ativo", true)
    .eq("datas_indisponiveis.ativo", true)
    .maybeSingle();

  if (error) throw error;

  return data as unknown as RoteiroComVagas | null;
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
