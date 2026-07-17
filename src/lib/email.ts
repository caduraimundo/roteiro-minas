import { Resend } from "resend";
import { formatarData } from "@/lib/format";

// Domínio verificado no Resend é roteirominas.com.br (conta minasroteiro@gmail.com
// é só o login do painel, não um endereço de envio). Não existe env var pro
// remetente ainda - endereço fixo, fácil de trocar aqui se necessário.
const REMETENTE = "Roteiro Minas <ingressos@roteirominas.com.br>";

export type DadosEmailTicket = {
  paraEmail: string;
  paraNome: string;
  roteiroNome: string;
  data: string;
  codigoVerificacao: string;
  pdf: Uint8Array;
};

export async function enviarTicketPorEmail(dados: DadosEmailTicket) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY não configurada.");
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: REMETENTE,
    to: dados.paraEmail,
    subject: `Seu ingresso - ${dados.roteiroNome}`,
    html: `
      <p>Olá, ${dados.paraNome}!</p>
      <p>Sua compra para o passeio <strong>${dados.roteiroNome}</strong>, no dia
      ${formatarData(dados.data)}, foi confirmada.</p>
      <p>Seu ticket em PDF está anexado a este e-mail, com o código de
      verificação <strong>${dados.codigoVerificacao}</strong>. Apresente-o ao
      guia no dia do passeio.</p>
      <p>Bom passeio!</p>
    `,
    attachments: [
      {
        filename: "ticket-roteiro-minas.pdf",
        content: Buffer.from(dados.pdf),
      },
    ],
  });

  if (error) {
    throw new Error(error.message);
  }
}
