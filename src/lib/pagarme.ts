const PAGARME_API_URL = "https://api.pagar.me/core/v5";
export const TAXA_PLATAFORMA_PERCENTUAL = 6;

function authHeaderPagarme() {
  const apiKey = process.env.PAGARME_API_KEY;
  if (!apiKey) {
    throw new Error("PAGARME_API_KEY não configurada.");
  }

  return `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
}

/**
 * Busca uma order direto na API do Pagar.me (fonte de verdade). Usado pelo
 * webhook pra nunca confiar no conteúdo do payload recebido - o status real
 * do pagamento só é aceito se vier desta consulta autenticada com a chave
 * secreta, nunca do corpo do webhook em si.
 */
export async function buscarOrderPagarme(orderId: string) {
  const resposta = await fetch(`${PAGARME_API_URL}/orders/${orderId}`, {
    headers: { Authorization: authHeaderPagarme() },
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    const mensagem =
      dados?.message ?? dados?.errors?.[0]?.message ?? "Erro ao consultar order.";
    throw new Error(mensagem);
  }

  return dados;
}

export function calcularValores(preco: number, percentualDesconto: number | null) {
  const precoComDesconto = percentualDesconto
    ? preco - (preco * percentualDesconto) / 100
    : preco;

  const taxa = (precoComDesconto * TAXA_PLATAFORMA_PERCENTUAL) / 100;
  const valorFinal = precoComDesconto + taxa;

  return { precoComDesconto, taxa, valorFinal };
}

export function reaisParaCentavos(valor: number) {
  return Math.round(valor * 100);
}

type ItemPagarme = { amount: number; description: string; quantity: number };

type PagamentoPix = {
  payment_method: "pix";
  pix: { expires_in: number };
};

type PagamentoCartao = {
  payment_method: "credit_card";
  credit_card: {
    operation_type: "auth_and_capture";
    installments: number;
    card_token: string;
  };
};

export type CriarOrderParams = {
  descricaoItem: string;
  valorFinalReais: number;
  valorRoteiroReais: number;
  comprador: {
    nome: string;
    email: string;
    cpfDigitos: string;
    telefoneDigitos: string;
  };
  pagamento: PagamentoPix | PagamentoCartao;
  metadata: Record<string, string>;
};

/**
 * Cria uma order no Pagar.me (API v5, REST direto, chave de teste).
 * split é incluído apenas se PAGARME_MARKYS_RECIPIENT_ID existir - sem essa env var
 * (caso atual, recipient_id só existe na conta de produção do Pagar.me), a order é
 * criada sem split e o valor cai 100% na conta principal.
 */
export async function criarOrderPagarme({
  descricaoItem,
  valorFinalReais,
  valorRoteiroReais,
  comprador,
  pagamento,
  metadata,
}: CriarOrderParams) {
  const items: ItemPagarme[] = [
    {
      amount: reaisParaCentavos(valorFinalReais),
      description: descricaoItem,
      quantity: 1,
    },
  ];

  const recipientIdMarkys = process.env.PAGARME_MARKYS_RECIPIENT_ID;

  const payment: Record<string, unknown> = { ...pagamento };

  if (recipientIdMarkys) {
    // Estrutura conforme documentação Pagar.me v5. Não testável nesta fase
    // (chave de teste não tem recipient_id real - ver card "Ir a produção
    // com o Pagar.me" no Notion) - revisar payload exato quando essa env
    // var for preenchida de verdade.
    payment.split = [
      {
        amount: reaisParaCentavos(valorRoteiroReais),
        recipient_id: recipientIdMarkys,
        type: "flat",
        options: { charge_processing_fee: false, liable: true },
      },
      {
        amount:
          reaisParaCentavos(valorFinalReais) -
          reaisParaCentavos(valorRoteiroReais),
        recipient_id: process.env.PAGARME_PLATAFORMA_RECIPIENT_ID ?? "",
        type: "flat",
        options: { charge_processing_fee: true, liable: true },
      },
    ];
  }

  const resposta = await fetch(`${PAGARME_API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeaderPagarme(),
    },
    body: JSON.stringify({
      items,
      metadata,
      customer: {
        name: comprador.nome,
        email: comprador.email,
        type: "individual",
        document: comprador.cpfDigitos,
        document_type: "CPF",
        phones: {
          mobile_phone: {
            country_code: "55",
            area_code: comprador.telefoneDigitos.slice(0, 2),
            number: comprador.telefoneDigitos.slice(2),
          },
        },
      },
      payments: [payment],
    }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    const mensagem =
      dados?.message ?? dados?.errors?.[0]?.message ?? "Erro ao criar cobrança.";
    throw new Error(mensagem);
  }

  return dados;
}
