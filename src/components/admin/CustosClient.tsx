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
      <SeletorMes mes={mes} onChange={handleMesChange} />

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      {carregando ? (
        <p className="text-zinc-600 dark:text-zinc-400">Carregando...</p>
      ) : (
        dados && (
          <>
            <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                Margem total do mês
              </span>
              <span className="font-medium">
                {formatarPreco(dados.resumo.margem_total)}
              </span>
            </div>

            {dados.resumo.roteiros_com_custo_incompleto > 0 && (
              <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {dados.resumo.roteiros_com_custo_incompleto} roteiro
                {dados.resumo.roteiros_com_custo_incompleto > 1 ? "s" : ""} sem
                custo cadastrado - a margem total acima é parcial.
              </p>
            )}

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
                      <th className="pb-2 font-medium">Execuções</th>
                      <th className="pb-2 font-medium">Vendas</th>
                      <th className="pb-2 font-medium">Receita líquida</th>
                      <th className="pb-2 font-medium">Custo</th>
                      <th className="pb-2 font-medium">Margem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.por_roteiro.map((item) => (
                      <tr
                        key={item.roteiro_id}
                        className="border-t border-zinc-200 dark:border-zinc-800"
                      >
                        <td className="py-2">{item.nome}</td>
                        <td className="py-2">{item.quantidade_execucoes}</td>
                        <td className="py-2">{item.quantidade_vendas}</td>
                        <td className="py-2">
                          {formatarPreco(item.receita_liquida)}
                        </td>
                        {item.custo_incompleto ? (
                          <td colSpan={2} className="py-2">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                                Custo não cadastrado
                              </span>
                              <Link
                                href={`/admin/roteiros/${item.roteiro_id}`}
                                className="text-xs font-medium underline"
                              >
                                Cadastrar
                              </Link>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="py-2">
                              {formatarPreco(item.custo_total as number)}
                            </td>
                            <td className="py-2">
                              {formatarPreco(item.margem as number)}
                            </td>
                          </>
                        )}
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
