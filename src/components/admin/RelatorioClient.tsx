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

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M4 19h16" />
    </svg>
  );
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-terracota text-2xl font-extrabold tracking-tight">
            Relatório mensal
          </h1>
          <p className="font-body mt-1 text-sm text-zinc-600">
            Acompanhe o desempenho financeiro por mês.
          </p>
        </div>

        <div className="flex items-end gap-3">
          <SeletorMes mes={mes} onChange={handleMesChange} />
          {/* Decorativo por enquanto, sem função real - mesmo padrão de
              botão primário já usado em "Nova venda manual"/"Novo
              cupom". */}
          <button
            type="button"
            className="font-body bg-verde-mata text-pedra-sabao flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold"
          >
            <DownloadIcon className="h-4 w-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {erro && <p className="font-body text-sm text-red-600">{erro}</p>}

      {carregando ? (
        <p className="font-body text-terracota/60 text-sm">Carregando...</p>
      ) : (
        dados && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                titulo="Total de vendas"
                valor={String(numeroOuZero(dados.resumo.total_vendas))}
              />
              <MetricCard
                titulo="Receita bruta"
                valor={formatarPreco(numeroOuZero(dados.resumo.receita_bruta))}
                destaque
              />
              <MetricCard
                titulo="Valor dos roteiros"
                valor={formatarPreco(numeroOuZero(dados.resumo.valor_roteiros))}
              />
              <MetricCard
                titulo="Taxa online (recebida)"
                valor={formatarPreco(numeroOuZero(dados.resumo.taxa_online))}
              />
              <MetricCard
                titulo="Taxa manual (a receber do Markys)"
                valor={formatarPreco(
                  numeroOuZero(dados.resumo.taxa_manual_pendente),
                )}
              />
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-terracota text-lg font-bold">
                Por roteiro
              </h2>
              {dados.por_roteiro.length === 0 ? (
                <p className="font-body text-terracota/60 text-sm">
                  Nenhuma venda no período.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-2">
                  <table className="w-full min-w-[480px] border-collapse">
                    <thead>
                      <tr className="font-body text-terracota/50 text-left text-[11px] font-bold tracking-wide uppercase">
                        <th className="px-4 py-3">Roteiro</th>
                        <th className="px-4 py-3">Vendas</th>
                        <th className="px-4 py-3">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dados.por_roteiro.map((item) => (
                        <tr
                          key={item.roteiro_id}
                          className="font-body border-t border-zinc-100 text-sm"
                        >
                          <td className="text-terracota px-4 py-4 font-medium">
                            {item.nome}
                          </td>
                          <td className="text-terracota/70 px-4 py-4">
                            {item.total_vendas}
                          </td>
                          <td className="text-terracota px-4 py-4 font-semibold">
                            {formatarPreco(item.valor_roteiros)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-terracota text-lg font-bold">
                Por forma de pagamento
              </h2>
              {dados.por_forma_pagamento.length === 0 ? (
                <p className="font-body text-terracota/60 text-sm">
                  Nenhuma venda no período.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-2">
                  <table className="w-full min-w-[480px] border-collapse">
                    <thead>
                      <tr className="font-body text-terracota/50 text-left text-[11px] font-bold tracking-wide uppercase">
                        <th className="px-4 py-3">Forma</th>
                        <th className="px-4 py-3">Vendas</th>
                        <th className="px-4 py-3">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dados.por_forma_pagamento.map((item) => (
                        <tr
                          key={item.forma_pagamento}
                          className="font-body border-t border-zinc-100 text-sm"
                        >
                          <td className="text-terracota px-4 py-4 font-medium">
                            {RUBRICAS_FORMA_PAGAMENTO[item.forma_pagamento] ??
                              item.forma_pagamento}
                          </td>
                          <td className="text-terracota/70 px-4 py-4">
                            {item.total_vendas}
                          </td>
                          <td className="text-terracota px-4 py-4 font-semibold">
                            {formatarPreco(item.valor_roteiros)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )
      )}
    </div>
  );
}

function MetricCard({
  titulo,
  valor,
  destaque,
}: {
  titulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl p-5 ${
        destaque
          ? "bg-verde-mata text-pedra-sabao"
          : "bg-pedra-sabao text-terracota"
      }`}
    >
      <span
        className={`font-body text-xs font-semibold ${
          destaque ? "text-pedra-sabao/80" : "text-terracota/60"
        }`}
      >
        {titulo}
      </span>
      <span className="font-display text-2xl font-extrabold tracking-tight">
        {valor}
      </span>
    </div>
  );
}
