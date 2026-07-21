import { Resend } from "resend";
import { formatarData } from "@/lib/format";

// Domínio verificado no Resend é roteirominas.com.br (conta minasroteiro@gmail.com
// é só o login do painel, não um endereço de envio). Não existe env var pro
// remetente ainda - endereço fixo, fácil de trocar aqui se necessário.
const REMETENTE = "Roteiro Minas <ingressos@roteirominas.com.br>";

function escaparHtml(valor: string) {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type DadosEmailTicket = {
  paraEmail: string;
  paraNome: string;
  roteiroNome: string;
  data: string;
  codigoVerificacao: string;
  pdf: Uint8Array;
};

export async function enviarTicketPorEmail(
  dados: DadosEmailTicket,
): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY não configurada.");
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: REMETENTE,
    to: dados.paraEmail,
    subject: `Seu ingresso - ${dados.roteiroNome}`,
    html: `
      <p>Olá, ${escaparHtml(dados.paraNome)}!</p>
      <p>Sua compra para o passeio <strong>${escaparHtml(dados.roteiroNome)}</strong>, no dia
      ${formatarData(dados.data)}, foi confirmada.</p>
      <p>Seu ticket em PDF está anexado a este e-mail, com o código de
      verificação <strong>${escaparHtml(dados.codigoVerificacao)}</strong>. Apresente-o ao
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

  return data.id;
}
