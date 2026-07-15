import type { SupabaseClient } from "@supabase/supabase-js";

export type ResultadoCupom =
  | { valido: true; percentualDesconto: number }
  | { valido: false; motivo: string };

/** Valida um cupom no servidor: existência, vínculo com o roteiro e uso prévio pelo CPF. */
export async function validarCupomServidor(
  supabase: SupabaseClient,
  { codigo, roteiroId, cpf }: { codigo: string; roteiroId: string; cpf: string },
): Promise<ResultadoCupom> {
  const { data: cupom, error: erroCupom } = await supabase
    .from("cupons")
    .select("id, percentual_desconto, roteiro_id")
    .ilike("codigo", codigo)
    .eq("roteiro_id", roteiroId)
    .maybeSingle();

  if (erroCupom) {
    return { valido: false, motivo: "Não foi possível validar o cupom." };
  }

  if (!cupom) {
    return { valido: false, motivo: "Cupom inválido para este roteiro." };
  }

  const { data: jaUsado, error: erroUso } = await supabase.rpc(
    "cupom_ja_usado_por_cpf",
    { p_cupom_id: cupom.id, p_cpf: cpf },
  );

  if (erroUso) {
    return { valido: false, motivo: "Não foi possível validar o cupom." };
  }

  if (jaUsado) {
    return {
      valido: false,
      motivo: "Este cupom já foi utilizado com este CPF.",
    };
  }

  return {
    valido: true,
    percentualDesconto: Number(cupom.percentual_desconto),
  };
}
