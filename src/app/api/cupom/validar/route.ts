import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apenasDigitos, validarCPF } from "@/lib/validacao";
import { validarCupomServidor } from "@/lib/cupom";

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
  const resultado = await validarCupomServidor(supabase, {
    codigo,
    roteiroId,
    cpf,
  });

  return NextResponse.json(resultado);
}
