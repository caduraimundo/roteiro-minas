"use client";

import { useEffect, useState } from "react";
import { formatarPreco } from "@/lib/format";
import { SeletorMes } from "@/components/admin/SeletorMes";

type ResumoRelatorio = {
  total_vendas: number | null;
  receita_bruta: number | null;
  valor_roteiros: number | null;
  taxa_online: number | null;
  taxa_manual_pendente: number | null;
};

type PorRoteiro = {
  roteiro_id: string;
  nome: string;
  total_vendas: number;
  valor_roteiros: number;
};

type PorFormaPagamento = {
  forma_pagamento: string;
  total_vendas: number;
  valor_roteiros: number;
};

type Relatorio = {
  mes: string;
  resumo: ResumoRelatorio;
  por_roteiro: PorRoteiro[];
  por_forma_pagamento: PorFormaPagamento[];
};

const RUBRICAS_FORMA_PAGAMENTO: Record<string, string> = {
  pix: "Pix",
  cartao_avista: "Cartão à vista",
  cartao_parcelado: "Cartão parcelado",
  manual: "Manual",
};

function numeroOuZero(valor: number | null | undefined) {
  return valor ?? 0;
}

export function RelatorioClient({ mesInicial }: { mesInicial: string }) {
  const [mes, setMes] = useState(mesInicial);
  const [dados, setDados] = useState<Relatorio | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // As trocas de estado (carregando/erro) acontecem só dentro do .then/
  // .finally da própria promise, nunca direto no corpo síncrono do
  // effect - o estado inicial (carregando: true) já cobre o primeiro
  // fetch, e a troca de mês dispara a próxima via handleMesChange.
  useEffect(() => {
    let cancelado = false;

    fetch(`/api/admin/relatorio?mes=${mes}`)
      .then(async (resposta) => {
        const corpo = await resposta.json().catch(() => null);
        if (cancelado) return;

        if (!resposta.ok) {
          setErro(corpo?.erro ?? "Erro ao carregar relatório.");
          setDados(null);
          return;
        }

        setErro(null);
        setDados(corpo);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [mes]);

  function handleMesChange(evento: React.ChangeEvent<HTMLInputElement>) {
    setMes(evento.target.value);
    setCarregando(true);
    setErro(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <SeletorMes mes={mes} onChange={handleMesChange} />

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      {carregando ? (
        <p className="text-zinc-600 dark:text-zinc-400">Carregando...</p>
      ) : (
        dados && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <CardResumo
                titulo="Total de vendas"
                valor={String(numeroOuZero(dados.resumo.total_vendas))}
              />
              <CardResumo
                titulo="Receita bruta"
                valor={formatarPreco(numeroOuZero(dados.resumo.receita_bruta))}
              />
              <CardResumo
                titulo="Valor dos roteiros"
                valor={formatarPreco(numeroOuZero(dados.resumo.valor_roteiros))}
              />
              <CardResumo
                titulo="Taxa online (recebida)"
                valor={formatarPreco(numeroOuZero(dados.resumo.taxa_online))}
              />
              <CardResumo
                titulo="Taxa manual (a receber do Markys)"
                valor={formatarPreco(
                  numeroOuZero(dados.resumo.taxa_manual_pendente),
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-semibold">Por roteiro</h2>
              {dados.por_roteiro.length === 0 ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Nenhuma venda no período.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-600 dark:text-zinc-400">
                      <th className="pb-2 font-medium">Roteiro</th>
                      <th className="pb-2 font-medium">Vendas</th>
                      <th className="pb-2 font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.por_roteiro.map((item) => (
                      <tr
                        key={item.roteiro_id}
                        className="border-t border-zinc-200 dark:border-zinc-800"
                      >
                        <td className="py-2">{item.nome}</td>
                        <td className="py-2">{item.total_vendas}</td>
                        <td className="py-2">
                          {formatarPreco(item.valor_roteiros)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-semibold">Por forma de pagamento</h2>
              {dados.por_forma_pagamento.length === 0 ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Nenhuma venda no período.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-600 dark:text-zinc-400">
                      <th className="pb-2 font-medium">Forma</th>
                      <th className="pb-2 font-medium">Vendas</th>
                      <th className="pb-2 font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.por_forma_pagamento.map((item) => (
                      <tr
                        key={item.forma_pagamento}
                        className="border-t border-zinc-200 dark:border-zinc-800"
                      >
                        <td className="py-2">
                          {RUBRICAS_FORMA_PAGAMENTO[item.forma_pagamento] ??
                            item.forma_pagamento}
                        </td>
                        <td className="py-2">{item.total_vendas}</td>
                        <td className="py-2">
                          {formatarPreco(item.valor_roteiros)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )
      )}
    </div>
  );
}

function CardResumo({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <span className="text-xs text-zinc-600 dark:text-zinc-400">{titulo}</span>
      <span className="font-medium">{valor}</span>
    </div>
  );
}
