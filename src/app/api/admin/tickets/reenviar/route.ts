import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getVagaComRoteiro } from "@/data/roteiros";
import { gerarTicketPdf } from "@/lib/ticket";
import { enviarTicketPorEmail } from "@/lib/email";

/**
 * Reenvio manual de ticket - uso interno, chamada via curl/Postman até o
 * painel admin existir. Sem autenticação nesta fase (não exposta em nenhum
 * link do frontend). Ignora a trava de idempotência de propósito: reenvio é
 * uma ação explícita, sempre gera o PDF de novo e atualiza
 * `ticket_enviado_em`, mesmo se já tiver sido enviado antes.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const vendaId = typeof body?.venda_id === "string" ? body.venda_id : "";

  if (!vendaId) {
    return NextResponse.json(
      { sucesso: false, motivo: "venda_id é obrigatório." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { data: dadosTicket, error: erroTicket } = (await supabase
    .rpc("buscar_dados_ticket", { p_venda_id: vendaId })
    .single()) as {
    data: {
      comprador_nome: string;
      comprador_email: string;
      valor_total: number;
      codigo_verificacao: string | null;
      vaga_id: string;
      status: string;
      ticket_enviado_em: string | null;
    } | null;
    error: { message: string } | null;
  };

  if (erroTicket || !dadosTicket) {
    return NextResponse.json(
      { sucesso: false, motivo: "Venda não encontrada." },
      { status: 404 },
    );
  }

  if (dadosTicket.status !== "confirmada" || !dadosTicket.codigo_verificacao) {
    return NextResponse.json(
      {
        sucesso: false,
        motivo: "Venda não confirmada ou sem código de verificação.",
      },
      { status: 400 },
    );
  }

  const registro = await getVagaComRoteiro(dadosTicket.vaga_id).catch(() => null);

  if (!registro) {
    return NextResponse.json(
      { sucesso: false, motivo: "Vaga/roteiro não encontrado." },
      { status: 404 },
    );
  }

  try {
    const pdf = await gerarTicketPdf({
      roteiroNome: registro.roteiro.nome,
      compradorNome: dadosTicket.comprador_nome,
      data: registro.vaga.data,
      valorPago: Number(dadosTicket.valor_total),
      codigoVerificacao: dadosTicket.codigo_verificacao,
    });

    await enviarTicketPorEmail({
      paraEmail: dadosTicket.comprador_email,
      paraNome: dadosTicket.comprador_nome,
      roteiroNome: registro.roteiro.nome,
      data: registro.vaga.data,
      codigoVerificacao: dadosTicket.codigo_verificacao,
      pdf,
    });

    await supabase.rpc("marcar_ticket_enviado", { p_venda_id: vendaId });

    return NextResponse.json({ sucesso: true });
  } catch (erro) {
    console.error(
      "Reenvio manual de ticket falhou. vendaId:",
      vendaId,
      erro instanceof Error ? erro.message : erro,
    );

    return NextResponse.json(
      { sucesso: false, motivo: "Falha ao gerar/enviar o ticket." },
      { status: 502 },
    );
  }
}
