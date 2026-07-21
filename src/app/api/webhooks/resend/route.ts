import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createAdminClient } from "@/lib/supabase/admin";

type PayloadResend = {
  type: string;
  data?: {
    email_id?: string;
  };
};

/**
 * Webhook do Resend pra eventos de e-mail (bounce, etc). Sem
 * requireAdminSession() de propósito - é um webhook externo, sem sessão
 * de admin; a segurança vem da verificação de assinatura via svix contra
 * RESEND_WEBHOOK_SECRET, nunca pulada mesmo que a env var esteja ausente
 * (rejeita com 400 nesse caso, não deixa passar sem checar).
 *
 * Responde 200 rápido (processamento síncrono aqui mesmo, sem fila - volume
 * baixo do projeto não justifica isso ainda).
 */
export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  if (!secret) {
    console.error(
      "Webhook Resend: RESEND_WEBHOOK_SECRET não configurada - rejeitando.",
    );
    return NextResponse.json(
      { erro: "Webhook não configurado." },
      { status: 400 },
    );
  }

  const corpoBruto = await request.text();

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { erro: "Cabeçalhos de assinatura ausentes." },
      { status: 400 },
    );
  }

  let payload: PayloadResend;

  try {
    const webhook = new Webhook(secret);
    payload = webhook.verify(corpoBruto, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as PayloadResend;
  } catch (erro) {
    console.error(
      "Webhook Resend: assinatura inválida.",
      erro instanceof Error ? erro.message : erro,
    );
    return NextResponse.json({ erro: "Assinatura inválida." }, { status: 400 });
  }

  if (payload.type !== "email.bounced") {
    return NextResponse.json({ ok: true });
  }

  const emailId = payload.data?.email_id;

  if (!emailId) {
    console.error("Webhook Resend: evento email.bounced sem data.email_id.");
    return NextResponse.json({ ok: true });
  }

  const supabaseAdmin = createAdminClient();

  // .is("email_bounced_em", null) garante idempotência - replay do mesmo
  // evento não sobrescreve o timestamp do primeiro bounce.
  const { error } = await supabaseAdmin
    .from("vendas")
    .update({ email_bounced_em: new Date().toISOString() })
    .eq("resend_email_id", emailId)
    .is("email_bounced_em", null);

  if (error) {
    console.error(
      "Webhook Resend: falha ao gravar email_bounced_em. emailId:",
      emailId,
      error.message,
    );
  }

  return NextResponse.json({ ok: true });
}
