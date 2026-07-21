import { NextResponse } from "next/server";
import {
  requireAdminSession,
  AdminSessionError,
} from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVagaComRoteiro } from "@/data/roteiros";
import { gerarTicketPdf } from "@/lib/ticket";
import { enviarTicketPorEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    await requireAdminSession();
  } catch (erro) {
    if (erro instanceof AdminSessionError) {
      return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
    }
    throw erro;
  }

  const body = await request.json().catch(() => null);

  const vagaId = typeof body?.vaga_id === "string" ? body.vaga_id : "";
  const compradorNome =
    typeof body?.comprador_nome === "string" ? body.comprador_nome.trim() : "";
  const compradorCpf =
    typeof body?.comprador_cpf === "string" ? body.comprador_cpf.trim() : "";
  const compradorEmail =
    typeof body?.comprador_email === "string"
      ? body.comprador_email.trim()
      : "";

  if (!vagaId || !compradorNome || !compradorCpf || !compradorEmail) {
    return NextResponse.json(
      {
        erro:
          "vaga_id, comprador_nome, comprador_cpf e comprador_email são obrigatórios.",
      },
      { status: 400 },
    );
  }

  const supabaseAdmin = createAdminClient();

  const { data: resultado, error: erroRegistro } = (await supabaseAdmin
    .rpc("registrar_venda_manual", {
      p_vaga_id: vagaId,
      p_comprador_nome: compradorNome,
      p_comprador_cpf: compradorCpf,
      p_comprador_email: compradorEmail,
    })
    .single()) as {
    data: {
      sucesso: boolean;
      motivo: string;
      venda_id: string | null;
      taxa_devida: number | null;
    } | null;
    error: { message: string } | null;
  };

  if (erroRegistro || !resultado) {
    console.error(
      "Erro ao registrar venda manual (admin):",
      erroRegistro?.message,
    );
    return NextResponse.json(
      { erro: "Erro ao registrar venda manual." },
      { status: 500 },
    );
  }

  if (!resultado.sucesso) {
    if (resultado.motivo === "vaga_esgotada") {
      return NextResponse.json({ erro: "Vaga esgotada." }, { status: 400 });
    }

    if (resultado.motivo === "erro_codigo_verificacao") {
      return NextResponse.json(
        { erro: "Erro ao gerar código de verificação, tente novamente." },
        { status: 500 },
      );
    }

    console.error(
      "registrar_venda_manual retornou motivo inesperado:",
      resultado.motivo,
    );
    return NextResponse.json(
      { erro: "Erro ao registrar venda manual." },
      { status: 500 },
    );
  }

  const vendaId = resultado.venda_id as string;
  const taxaDevida = resultado.taxa_devida;

  // A venda já foi gravada e a vaga já foi debitada acima - uma falha aqui
  // pra frente (busca dos dados, geração do PDF, envio do e-mail) não pode
  // virar 500 sugerindo que a venda não foi criada. Loga e devolve
  // ticket_enviado: false; o Markys reenvia manualmente depois via
  // tickets/reenviar.
  let ticketEnviado = false;

  const { data: dadosTicket, error: erroTicket } = (await supabaseAdmin
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

  if (erroTicket || !dadosTicket || !dadosTicket.codigo_verificacao) {
    console.error(
      "buscar_dados_ticket falhou/incompleto após registrar venda manual. vendaId:",
      vendaId,
      erroTicket?.message,
    );
  } else {
    const registro = await getVagaComRoteiro(dadosTicket.vaga_id).catch(
      () => null,
    );

    if (!registro) {
      console.error(
        "Vaga/roteiro não encontrado ao enviar ticket da venda manual. vendaId:",
        vendaId,
      );
    } else {
      try {
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
          p_venda_id: vendaId,
        });

        ticketEnviado = true;

        // Mesmo padrão de ticket_enviado: falha aqui não pode virar 500 -
        // a venda e o envio já aconteceram, só o rastreio pro webhook de
        // bounce que ficaria incompleto.
        const { error: erroResendId } = await supabaseAdmin
          .from("vendas")
          .update({ resend_email_id: resendEmailId })
          .eq("id", vendaId);

        if (erroResendId) {
          console.error(
            "Falha ao gravar resend_email_id após venda manual. vendaId:",
            vendaId,
            erroResendId.message,
          );
        }
      } catch (erro) {
        console.error(
          "Envio de ticket falhou após registrar venda manual. vendaId:",
          vendaId,
          erro instanceof Error ? erro.message : erro,
        );
      }
    }
  }

  return NextResponse.json(
    { venda_id: vendaId, taxa_devida: taxaDevida, ticket_enviado: ticketEnviado },
    { status: 201 },
  );
}
