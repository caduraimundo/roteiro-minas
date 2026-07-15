import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apenasDigitos, validarCPF } from "@/lib/validacao";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const codigo = typeof body?.codigo === "string" ? body.codigo.trim() : "";
  const roteiroId =
    typeof body?.roteiroId === "string" ? body.roteiroId : "";
  const cpf = typeof body?.cpf === "string" ? apenasDigitos(body.cpf) : "";

  if (!codigo || !roteiroId || !validarCPF(cpf)) {
    return NextResponse.json(
      { valido: false, motivo: "Dados inválidos para validar o cupom." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { data: cupom, error: erroCupom } = await supabase
    .from("cupons")
    .select("id, percentual_desconto, roteiro_id")
    .ilike("codigo", codigo)
    .eq("roteiro_id", roteiroId)
    .maybeSingle();

  if (erroCupom) {
    return NextResponse.json(
      { valido: false, motivo: "Não foi possível validar o cupom." },
      { status: 500 },
    );
  }

  if (!cupom) {
    return NextResponse.json({
      valido: false,
      motivo: "Cupom inválido para este roteiro.",
    });
  }

  const { data: jaUsado, error: erroUso } = await supabase.rpc(
    "cupom_ja_usado_por_cpf",
    { p_cupom_id: cupom.id, p_cpf: cpf },
  );

  if (erroUso) {
    return NextResponse.json(
      { valido: false, motivo: "Não foi possível validar o cupom." },
      { status: 500 },
    );
  }

  if (jaUsado) {
    return NextResponse.json({
      valido: false,
      motivo: "Este cupom já foi utilizado com este CPF.",
    });
  }

  return NextResponse.json({
    valido: true,
    percentualDesconto: Number(cupom.percentual_desconto),
  });
}
