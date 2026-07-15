import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  apenasDigitos,
  validarCPF,
  validarEmail,
  validarTelefone,
} from "@/lib/validacao";
import { validarCupomServidor } from "@/lib/cupom";
import { calcularValores, criarOrderPagarme } from "@/lib/pagarme";
import { getVagaComRoteiro } from "@/data/roteiros";

const FORMAS_PAGAMENTO = ["pix", "cartao_avista", "cartao_parcelado"] as const;
type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";
  const cpf = typeof body?.cpf === "string" ? apenasDigitos(body.cpf) : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const telefone =
    typeof body?.telefone === "string" ? apenasDigitos(body.telefone) : "";
  const vagaId = typeof body?.vagaId === "string" ? body.vagaId : "";
  const cupomCodigo =
    typeof body?.cupomCodigo === "string" ? body.cupomCodigo.trim() : "";
  const formaPagamento = FORMAS_PAGAMENTO.includes(body?.formaPagamento)
    ? (body.formaPagamento as FormaPagamento)
    : null;
  const parcelas =
    typeof body?.parcelas === "number" ? body.parcelas : 1;
  const cardToken =
    typeof body?.cardToken === "string" ? body.cardToken : "";

  if (
    nome.length < 3 ||
    !validarCPF(cpf) ||
    !validarEmail(email) ||
    !validarTelefone(telefone) ||
    !vagaId ||
    !formaPagamento
  ) {
    return NextResponse.json(
      { sucesso: false, motivo: "Dados inválidos para iniciar a cobrança." },
      { status: 400 },
    );
  }

  if (
    formaPagamento !== "pix" &&
    (!cardToken || cardToken.length === 0)
  ) {
    return NextResponse.json(
      { sucesso: false, motivo: "Token de cartão ausente." },
      { status: 400 },
    );
  }

  if (
    formaPagamento === "cartao_parcelado" &&
    (parcelas < 2 || parcelas > 6)
  ) {
    return NextResponse.json(
      { sucesso: false, motivo: "Número de parcelas inválido." },
      { status: 400 },
    );
  }

  const registro = await getVagaComRoteiro(vagaId).catch(() => null);

  if (!registro) {
    return NextResponse.json(
      { sucesso: false, motivo: "Vaga não encontrada." },
      { status: 404 },
    );
  }

  const { vaga, roteiro } = registro;

  if (
    !roteiro.ativo ||
    vaga.status !== "aberta" ||
    vaga.vagas_disponiveis <= 0
  ) {
    return NextResponse.json(
      { sucesso: false, motivo: "Essa data não está mais disponível." },
      { status: 409 },
    );
  }

  let percentualDesconto: number | null = null;
  let cupomId = "";

  if (cupomCodigo) {
    const supabase = await createClient();
    const resultadoCupom = await validarCupomServidor(supabase, {
      codigo: cupomCodigo,
      roteiroId: roteiro.id,
      cpf,
    });

    if (!resultadoCupom.valido) {
      return NextResponse.json(
        { sucesso: false, motivo: resultadoCupom.motivo },
        { status: 400 },
      );
    }

    percentualDesconto = resultadoCupom.percentualDesconto;
    cupomId = resultadoCupom.cupomId;
  }

  const { precoComDesconto, valorFinal } = calcularValores(
    vaga.preco,
    percentualDesconto,
  );

  try {
    const order = await criarOrderPagarme({
      descricaoItem: roteiro.nome,
      valorFinalReais: valorFinal,
      valorRoteiroReais: precoComDesconto,
      comprador: { nome, email, cpfDigitos: cpf, telefoneDigitos: telefone },
      pagamento:
        formaPagamento === "pix"
          ? { payment_method: "pix", pix: { expires_in: 3600 } }
          : {
              payment_method: "credit_card",
              credit_card: {
                operation_type: "auth_and_capture",
                installments: formaPagamento === "cartao_parcelado" ? parcelas : 1,
                card_token: cardToken,
              },
            },
      metadata: {
        vaga_id: vaga.id,
        roteiro_id: roteiro.id,
        cupom_id: cupomId,
        forma_pagamento: formaPagamento,
        parcelas: String(formaPagamento === "cartao_parcelado" ? parcelas : 1),
      },
    });

    const charge = order?.charges?.[0];
    const transacao = charge?.last_transaction;

    if (formaPagamento === "pix") {
      const pixFalhou = charge?.status === "failed" || !transacao?.qr_code;

      if (pixFalhou) {
        console.error(
          "Falha ao gerar Pix. status:",
          charge?.status,
          "erros:",
          transacao?.gateway_response?.errors,
        );

        return NextResponse.json(
          {
            sucesso: false,
            motivo:
              transacao?.gateway_response?.errors?.[0]?.message ??
              "Não foi possível gerar o Pix.",
          },
          { status: 502 },
        );
      }

      return NextResponse.json({
        sucesso: true,
        formaPagamento: "pix",
        orderId: order.id,
        qrCode: transacao.qr_code,
        qrCodeUrl: transacao.qr_code_url ?? null,
      });
    }

    const statusAprovado = charge?.status === "paid";

    return NextResponse.json({
      sucesso: statusAprovado,
      formaPagamento: "cartao",
      orderId: order.id,
      status: charge?.status ?? "desconhecido",
      motivo: statusAprovado
        ? undefined
        : (transacao?.acquirer_message ?? "Pagamento não aprovado."),
    });
  } catch (erro) {
    console.error(
      "Erro ao criar cobrança no Pagar.me:",
      erro instanceof Error ? erro.message : erro,
    );

    return NextResponse.json(
      {
        sucesso: false,
        motivo: "Não foi possível processar o pagamento. Tente novamente.",
      },
      { status: 502 },
    );
  }
}
