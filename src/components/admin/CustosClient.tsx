"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatarPreco } from "@/lib/format";
import { SeletorMes } from "@/components/admin/SeletorMes";

type PorRoteiro = {
  roteiro_id: string;
  nome: string;
  quantidade_execucoes: number;
  quantidade_vendas: number;
  receita_liquida: number;
  custo_total: number | null;
  margem: number | null;
  custo_incompleto: boolean;
};

type Custos = {
  mes: string;
  resumo: {
    margem_total: number;
    roteiros_com_custo_incompleto: number;
  };
  por_roteiro: PorRoteiro[];
};

export function CustosClient({ mesInicial }: { mesInicial: string }) {
  const [mes, setMes] = useState(mesInicial);
  const [dados, setDados] = useState<Custos | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Mesmo padrão de RelatorioClient: troca de estado só dentro do .then/
  // .finally, nunca direto no corpo síncrono do effect.
  useEffect(() => {
    let cancelado = false;

    fetch(`/api/admin/custos?mes=${mes}`)
      .then(async (resposta) => {
        const corpo = await resposta.json().catch(() => null);
        if (cancelado) return;

        if (!resposta.ok) {
          setErro(corpo?.erro ?? "Erro ao carregar painel de custos.");
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
            Painel de custos
          </h1>
          <p className="font-body mt-1 text-sm text-zinc-600">
            Acompanhe custo e margem por roteiro, mês a mês.
          </p>
        </div>

        <SeletorMes mes={mes} onChange={handleMesChange} />
      </div>

      {erro && <p className="font-body text-sm text-red-600">{erro}</p>}

      {carregando ? (
        <p className="font-body text-terracota/60 text-sm">Carregando...</p>
      ) : (
        dados && (
          <>
            <div className="max-w-xs">
              <MetricCard
                titulo="Margem total do mês"
                valor={formatarPreco(dados.resumo.margem_total)}
                destaque
              />
            </div>

            {dados.resumo.roteiros_com_custo_incompleto > 0 && (
              <p className="font-body rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                {dados.resumo.roteiros_com_custo_incompleto} roteiro
                {dados.resumo.roteiros_com_custo_incompleto > 1 ? "s" : ""} sem
                custo cadastrado - a margem total acima é parcial.
              </p>
            )}

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
                  <table className="w-full min-w-[720px] border-collapse">
                    <thead>
                      <tr className="font-body text-terracota/50 text-left text-[11px] font-bold tracking-wide uppercase">
                        <th className="px-4 py-3">Roteiro</th>
                        <th className="px-4 py-3">Execuções</th>
                        <th className="px-4 py-3">Vendas</th>
                        <th className="px-4 py-3">Receita líquida</th>
                        <th className="px-4 py-3">Custo</th>
                        <th className="px-4 py-3">Margem</th>
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
                            {item.quantidade_execucoes}
                          </td>
                          <td className="text-terracota/70 px-4 py-4">
                            {item.quantidade_vendas}
                          </td>
                          <td className="text-terracota px-4 py-4 font-semibold">
                            {formatarPreco(item.receita_liquida)}
                          </td>
                          {item.custo_incompleto ? (
                            <td colSpan={2} className="px-4 py-4">
                              <div className="flex items-center gap-2.5">
                                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                                  Custo não cadastrado
                                </span>
                                <Link
                                  href={`/admin/roteiros/${item.roteiro_id}`}
                                  className="text-verde-mata text-xs font-semibold underline"
                                >
                                  Cadastrar
                                </Link>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="text-terracota px-4 py-4 font-semibold">
                                {formatarPreco(item.custo_total as number)}
                              </td>
                              <td className="text-terracota px-4 py-4 font-semibold">
                                {formatarPreco(item.margem as number)}
                              </td>
                            </>
                          )}
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
