import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buscarOrderPagarme } from "@/lib/pagarme";

const FORMAS_PAGAMENTO_VALIDAS = new Set([
  "pix",
  "cartao_avista",
  "cartao_parcelado",
]);

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

  if (order?.status !== "paid") {
    return NextResponse.json({ ok: true });
  }

  const metadata = order?.metadata ?? {};
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

  return NextResponse.json({ ok: true });
}
