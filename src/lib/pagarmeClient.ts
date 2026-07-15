const PAGARME_TOKENS_URL = "https://api.pagar.me/core/v5/tokens";

export type DadosCartao = {
  numero: string;
  nomeImpresso: string;
  mes: string;
  ano: string;
  cvv: string;
  documento: string;
};

/**
 * Tokeniza os dados do cartão diretamente no navegador via API pública do
 * Pagar.me. Os dados do cartão nunca chegam no nosso backend - só o token
 * retornado aqui é enviado ao servidor.
 */
export async function tokenizarCartao(dados: DadosCartao): Promise<string> {
  const publicKey = process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("Pagamento com cartão indisponível no momento.");
  }

  const anoCompleto =
    dados.ano.length === 2 ? `20${dados.ano}` : dados.ano;

  const resposta = await fetch(`${PAGARME_TOKENS_URL}?appId=${publicKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "card",
      card: {
        number: dados.numero.replace(/\s/g, ""),
        holder_name: dados.nomeImpresso,
        holder_document: dados.documento,
        exp_month: Number(dados.mes),
        exp_year: Number(anoCompleto),
        cvv: dados.cvv,
      },
    }),
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      resultado?.message ?? "Não foi possível validar os dados do cartão.",
    );
  }

  return resultado.id as string;
}
