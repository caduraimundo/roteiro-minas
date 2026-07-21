import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buscarOrderPagarme } from "@/lib/pagarme";
import { getVagaComRoteiro } from "@/data/roteiros";
import { gerarTicketPdf } from "@/lib/ticket";
import { enviarTicketPorEmail } from "@/lib/email";

const FORMAS_PAGAMENTO_VALIDAS = new Set([
  "pix",
  "cartao_avista",
  "cartao_parcelado",
]);

/**
 * Libera a reserva de vaga vinculada a um order que falhou/foi cancelado -
 * idempotente no banco (liberar_reserva_por_order só age se a reserva
 * ainda estiver 'reservada'), sem trava adicional necessária aqui.
 */
async function liberarReservaComLog(
  pagarmeOrderId: string,
  reservaId: string | null,
) {
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.rpc("liberar_reserva_por_order", {
    p_pagarme_order_id: pagarmeOrderId,
    p_reserva_id: reservaId,
  });

  if (error) {
    console.error(
      "Webhook Pagar.me: erro ao liberar reserva de vaga. orderId:",
      pagarmeOrderId,
      error.message,
    );
  }
}

/**
 * Webhook do Pagar.me para order.paid. O Pagar.me v5 não assina o payload
 * (sem HMAC), então o conteúdo recebido nunca é usado para decisões - só o
 * order_id é extraído daqui. O status real é sempre confirmado com um GET
 * autenticado direto na API, usando a chave secreta.
 *
 * Sempre responde 200 rapidamente, mesmo em erro/pendência, para evitar
 * retries desnecessários do Pagar.me. Casos que precisam de atenção manual
 * (vaga esgotada no momento da confirmação, erros de consulta) ficam
 * registrados via console.error - não existe estorno automático nesta fase.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const eventType = typeof body?.type === "string" ? body.type : "";
  const orderId = typeof body?.data?.id === "string" ? body.data.id : "";

  if (!orderId) {
    console.error("Webhook Pagar.me sem order id no payload. type:", eventType);
    return NextResponse.json({ ok: true });
  }

  if (eventType && !eventType.startsWith("order.")) {
    return NextResponse.json({ ok: true });
  }

  let order;
  try {
    order = await buscarOrderPagarme(orderId);
  } catch (erro) {
    console.error(
      "Webhook Pagar.me: falha ao consultar order",
      orderId,
      erro instanceof Error ? erro.message : erro,
    );
    return NextResponse.json({ ok: true });
  }

  const metadata = order?.metadata ?? {};

  // reserva_id pode legitimamente vir ausente/vazio em pedidos criados
  // antes dessa mudança - confirmar_venda_pagarme e liberar_reserva_por_order
  // já têm fallback pro comportamento antigo (casar por pagarme_order_id)
  // quando isso vier null.
  const reservaId =
    typeof metadata.reserva_id === "string" && metadata.reserva_id.length > 0
      ? metadata.reserva_id
      : null;

  if (order?.status === "failed") {
    console.error(
      "Webhook Pagar.me: pagamento recusado/falhou (order.payment_failed). orderId:",
      orderId,
      "vagaId:",
      order?.metadata?.vaga_id,
    );
    await liberarReservaComLog(orderId, reservaId);
    return NextResponse.json({ ok: true });
  }

  if (order?.status === "canceled") {
    console.error(
      "Webhook Pagar.me: pedido cancelado (order.canceled). orderId:",
      orderId,
      "vagaId:",
      order?.metadata?.vaga_id,
    );
    await liberarReservaComLog(orderId, reservaId);
    return NextResponse.json({ ok: true });
  }

  if (order?.status !== "paid") {
    return NextResponse.json({ ok: true });
  }

  const vagaId = typeof metadata.vaga_id === "string" ? metadata.vaga_id : "";
  const cupomId =
    typeof metadata.cupom_id === "string" && metadata.cupom_id.length > 0
      ? metadata.cupom_id
      : null;
  const formaPagamento = FORMAS_PAGAMENTO_VALIDAS.has(metadata.forma_pagamento)
    ? metadata.forma_pagamento
    : null;
  const parcelas = Number(metadata.parcelas) || 1;

  const charge = order?.charges?.[0];
  const customer = charge?.customer;

  if (!vagaId || !formaPagamento || !customer) {
    console.error(
      "Webhook Pagar.me: order paga sem metadata/customer suficiente pra confirmar venda. orderId:",
      orderId,
      "metadata:",
      metadata,
    );
    return NextResponse.json({ ok: true });
  }

  const valorTotalReais = (order?.amount ?? 0) / 100;

  const supabase = await createClient();
  const { data, error } = (await supabase
    .rpc("confirmar_venda_pagarme", {
      p_vaga_id: vagaId,
      p_pagarme_order_id: orderId,
      p_comprador_nome: customer.name ?? "",
      p_comprador_cpf: customer.document ?? "",
      p_comprador_email: customer.email ?? "",
      p_forma_pagamento: formaPagamento,
      p_parcelas: parcelas,
      p_valor_total: valorTotalReais,
      p_cupom_id: cupomId,
      p_reserva_id: reservaId,
    })
    .single()) as {
    data: { sucesso: boolean; motivo: string; venda_id: string | null } | null;
    error: { message: string } | null;
  };

  if (error) {
    console.error(
      "Webhook Pagar.me: erro ao confirmar venda. orderId:",
      orderId,
      error.message,
    );
    return NextResponse.json({ ok: true });
  }

  if (data?.motivo === "vaga_esgotada") {
    console.error(
      "PENDÊNCIA MANUAL: pagamento confirmado mas vaga esgotada no momento da confirmação. " +
        "orderId:",
      orderId,
      "vagaId:",
      vagaId,
      "comprador:",
      customer.email,
    );
  }

  if (data?.motivo === "erro_codigo_verificacao") {
    console.error(
      "PENDÊNCIA MANUAL: pagamento confirmado mas não foi possível gerar código de " +
        "verificação único (colisões esgotadas). orderId:",
      orderId,
      "vagaId:",
      vagaId,
      "comprador:",
      customer.email,
    );
  }

  // Geração de PDF + envio de e-mail rodam depois que a venda já foi
  // confirmada, em bloco separado: se falhar aqui, a venda continua válida
  // e o webhook não deve ser reprocessado por causa disso (por isso o
  // try/catch próprio e a resposta 200 sempre no final da função).
  if (data?.sucesso && data.motivo === "confirmado" && data.venda_id) {
    try {
      const supabaseAdmin = createAdminClient();

      const { data: dadosTicket, error: erroTicket } = (await supabaseAdmin
        .rpc("buscar_dados_ticket", { p_venda_id: data.venda_id })
        .single()) as {
        data: {
          comprador_nome: string;
          comprador_email: string;
          valor_total: number;
          codigo_verificacao: string;
          vaga_id: string;
          status: string;
          ticket_enviado_em: string | null;
        } | null;
        error: { message: string } | null;
      };

      if (erroTicket || !dadosTicket) {
        throw new Error(erroTicket?.message ?? "venda não encontrada");
      }

      if (dadosTicket.ticket_enviado_em) {
        // Já enviado - não deveria acontecer aqui (motivo só é "confirmado"
        // em vendas recém-criadas), mas a checagem é a trava de idempotência
        // pedida, defesa extra contra qualquer reprocessamento futuro.
        return NextResponse.json({ ok: true });
      }

      const registro = await getVagaComRoteiro(dadosTicket.vaga_id);
      if (!registro) {
        throw new Error("vaga/roteiro não encontrado pro ticket");
      }

      const pdf = await gerarTicketPdf({
        roteiroNome: registro.roteiro.nome,
        compradorNome: dadosTicket.comprador_nome,
        data: registro.vaga.data,
        valorPago: Number(dadosTicket.valor_total),
        codigoVerificacao: dadosTicket.codigo_verificacao,
      });

      const resendEmailId = await enviarTicketPorEmail({
        paraEmail: dadosTicket.comprador_email,
        paraNome: dadosTicket.comprador_nome,
        roteiroNome: registro.roteiro.nome,
        data: registro.vaga.data,
        codigoVerificacao: dadosTicket.codigo_verificacao,
        pdf,
      });

      await supabaseAdmin.rpc("marcar_ticket_enviado", {
        p_venda_id: data.venda_id,
      });

      // Mesmo padrão do bloco acima: venda já confirmada e ticket já
      // enviado, uma falha aqui não pode virar novo ponto de falha no
      // caminho de confirmação de pagamento - só loga e segue.
      const { error: erroResendId } = await supabaseAdmin
        .from("vendas")
        .update({ resend_email_id: resendEmailId })
        .eq("id", data.venda_id);

      if (erroResendId) {
        console.error(
          "Webhook Pagar.me: falha ao gravar resend_email_id. orderId:",
          orderId,
          "vendaId:",
          data.venda_id,
          erroResendId.message,
        );
      }
    } catch (erro) {
      console.error(
        "Webhook Pagar.me: falha ao gerar/enviar ticket (venda já confirmada, " +
          "não reprocessada por causa disso). orderId:",
        orderId,
        "vendaId:",
        data.venda_id,
        erro instanceof Error ? erro.message : erro,
      );
    }
  }

  return NextResponse.json({ ok: true });
}
