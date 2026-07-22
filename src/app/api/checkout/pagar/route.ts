import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  apenasDigitos,
  validarCEP,
  validarCPF,
  validarDataNascimento,
  validarEmail,
  validarTelefone,
  validarUF,
} from "@/lib/validacao";
import { validarCupomServidor } from "@/lib/cupom";
import { calcularValores, criarOrderPagarme } from "@/lib/pagarme";
import { getVagaComRoteiro } from "@/data/roteiros";

const FORMAS_PAGAMENTO = ["pix", "cartao_avista", "cartao_parcelado"] as const;
type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number];

/**
 * Libera a reserva de vaga vinculada a um order que falhou/foi recusado
 * de forma síncrona (Pix que não gerou QR Code, cartão recusado) - não
 * pode impedir a resposta ao cliente se falhar, só loga.
 */
async function liberarReservaComLog(
  supabase: SupabaseClient,
  pagarmeOrderId: string,
  reservaId: string,
) {
  const { error } = await supabase.rpc("liberar_reserva_por_order", {
    p_pagarme_order_id: pagarmeOrderId,
    p_reserva_id: reservaId,
  });

  if (error) {
    console.error(
      "Erro ao liberar reserva de vaga. orderId:",
      pagarmeOrderId,
      error.message,
    );
  }
}

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

  // Pedido do Markys (card 6 do Kanban): igualar o checkout online ao que
  // ele já coleta manualmente por WhatsApp. Complemento é o único campo
  // de endereço sempre opcional - todos os outros são exigidos aqui, na
  // camada de API (o schema em si aceita todos nullable, de propósito,
  // pra não travar vendas antigas).
  const dataNascimento =
    typeof body?.dataNascimento === "string" ? body.dataNascimento.trim() : "";
  const cep = typeof body?.cep === "string" ? apenasDigitos(body.cep) : "";
  const rua = typeof body?.rua === "string" ? body.rua.trim() : "";
  const numero = typeof body?.numero === "string" ? body.numero.trim() : "";
  const complemento =
    typeof body?.complemento === "string" && body.complemento.trim().length > 0
      ? body.complemento.trim()
      : null;
  const bairro = typeof body?.bairro === "string" ? body.bairro.trim() : "";
  const cidade = typeof body?.cidade === "string" ? body.cidade.trim() : "";
  const uf = typeof body?.uf === "string" ? body.uf.trim().toUpperCase() : "";

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
    !validarDataNascimento(dataNascimento) ||
    !validarCEP(cep) ||
    !rua ||
    !numero ||
    !bairro ||
    !cidade ||
    !validarUF(uf)
  ) {
    return NextResponse.json(
      {
        sucesso: false,
        motivo:
          "Preencha data de nascimento e endereço completo (CEP, rua, número, bairro, cidade e UF) antes de continuar.",
      },
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

  if (!roteiro.ativo || vaga.status !== "aberta") {
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

  // Reserva a vaga pra qualquer forma de pagamento (não só Pix) - cartão
  // também depende do webhook pra confirmação final, então também precisa
  // segurar a vaga até lá. Mesma janela de 15min do QR Code Pix. Só
  // depois da validação do cupom de propósito - reservar antes deixaria
  // um cupom inválido prender a vaga por 15min sem jeito de liberar antes
  // da expiração (nenhum order chega a existir nesse ponto).
  const EXPIRACAO_RESERVA_MS = 15 * 60 * 1000;
  const expiresAt = new Date(Date.now() + EXPIRACAO_RESERVA_MS).toISOString();

  const supabaseReserva = await createClient();
  const { data: reserva, error: erroReserva } = (await supabaseReserva
    .rpc("reservar_vaga_checkout", {
      p_vaga_id: vaga.id,
      p_expires_at: expiresAt,
    })
    .single()) as {
    data: { sucesso: boolean; motivo: string; reserva_id: string | null } | null;
    error: { message: string } | null;
  };

  if (erroReserva || !reserva) {
    console.error(
      "Erro ao reservar vaga no checkout:",
      erroReserva?.message,
    );
    return NextResponse.json(
      {
        sucesso: false,
        motivo: "Não foi possível processar o pagamento. Tente novamente.",
      },
      { status: 502 },
    );
  }

  if (reserva.motivo === "vaga_esgotada") {
    return NextResponse.json(
      { sucesso: false, motivo: "Essa data não está mais disponível." },
      { status: 409 },
    );
  }

  const reservaId = reserva.reserva_id as string;

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
      endereco: { cep, rua, numero, complemento, bairro, cidade, uf },
      pagamento:
        formaPagamento === "pix"
          ? { payment_method: "pix", pix: { expires_in: 900 } }
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
        reserva_id: reservaId,
        // Campos crus (não só o line_1/line_2 concatenado do Pagar.me) pra
        // uma futura extensão de confirmar_venda_pagarme conseguir gravar
        // em vendas sem precisar desmontar a string concatenada do
        // endereço. Isso NÃO persiste os dados em `vendas` ainda - só
        // preserva no order do Pagar.me até essa extensão existir (ver
        // card 6 do Kanban).
        data_nascimento: dataNascimento,
        cep,
        rua,
        numero,
        complemento: complemento ?? "",
        bairro,
        cidade,
        uf,
      },
    });

    // Não pode impedir a resposta se falhar (mesmo padrão já usado em
    // outros lugares do projeto pra passos "de rastreio", não o pagamento
    // em si) - a reserva expira sozinha em 15min se isso não conseguir
    // ligar ela ao order.
    const { error: erroVincular } = await supabaseReserva.rpc(
      "vincular_reserva_order",
      { p_reserva_id: reservaId, p_pagarme_order_id: order.id },
    );

    if (erroVincular) {
      console.error(
        "Erro ao vincular reserva ao order do Pagar.me. reservaId:",
        reservaId,
        "orderId:",
        order.id,
        erroVincular.message,
      );
    }

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

        await liberarReservaComLog(supabaseReserva, order.id, reservaId);

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
        expiresAt: transacao.expires_at ?? null,
      });
    }

    const statusAprovado = charge?.status === "paid";

    if (!statusAprovado) {
      // Nunca repassa o motivo/código cru do adquirente pro cliente (pode
      // conter detalhes internos do banco/gateway) - fica só no log server-side.
      console.error(
        "Cartão recusado. status:",
        charge?.status,
        "acquirer_message:",
        transacao?.acquirer_message,
        "acquirer_return_code:",
        transacao?.acquirer_return_code,
      );

      await liberarReservaComLog(supabaseReserva, order.id, reservaId);
    }

    return NextResponse.json({
      sucesso: statusAprovado,
      formaPagamento: "cartao",
      orderId: order.id,
      status: charge?.status ?? "desconhecido",
      motivo: statusAprovado
        ? undefined
        : "Pagamento recusado. Confira os dados do cartão ou tente outro método.",
    });
  } catch (erro) {
    // Não existe order.id aqui pra liberar a reserva por (criarOrderPagarme
    // é o único ponto que lança dentro deste try, e ele lança antes de
    // retornar um order) - decisão consciente de não adicionar acesso
    // direto à tabela de reservas só pra esse caso raro (falha de rede/API
    // ao criar o order): a reserva expira sozinha em 15min via a limpeza
    // automática já embutida em reservar_vaga_checkout, sem precisar de
    // função de banco nova nem de grants extras.
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
