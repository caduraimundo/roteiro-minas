"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatarData, mascararCpf } from "@/lib/format";

type Venda = {
  id: string;
  vaga_id: string;
  comprador_nome: string;
  comprador_cpf: string;
  codigo_verificacao: string | null;
};

export function ListaDoDiaClient({
  roteiroId,
  vagaId,
  roteiroNome,
  vagaData,
}: {
  roteiroId: string;
  vagaId: string;
  roteiroNome: string;
  vagaData: string;
}) {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    fetch(`/api/admin/vendas?roteiro_id=${roteiroId}&status=confirmada`)
      .then(async (resposta) => {
        const corpo = await resposta.json().catch(() => null);
        if (cancelado) return;

        if (!resposta.ok || !corpo?.vendas) {
          setErro(corpo?.erro ?? "Erro ao carregar a lista.");
          return;
        }

        setErro(null);
        // A API não filtra por vaga - filtra aqui e ordena por nome pra
        // facilitar achar o comprador na hora do embarque.
        const daVaga = (corpo.vendas as Venda[])
          .filter((venda) => venda.vaga_id === vagaId)
          .sort((a, b) => a.comprador_nome.localeCompare(b.comprador_nome, "pt-BR"));

        setVendas(daVaga);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [roteiroId, vagaId]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-8 print:max-w-none">
      <Link
        href={`/admin/roteiros/${roteiroId}/vagas/${vagaId}`}
        className="text-sm text-zinc-600 dark:text-zinc-400 print:hidden"
      >
        ← Voltar
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold print:text-black">
            {roteiroNome}
          </h1>
          <span className="text-sm text-zinc-600 dark:text-zinc-400 print:text-black">
            {formatarData(vagaData)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full border border-zinc-300 px-5 py-2 text-sm dark:border-zinc-700 print:hidden"
        >
          Imprimir
        </button>
      </div>

      {erro && <p className="text-sm text-red-600 print:hidden">{erro}</p>}

      {carregando ? (
        <p className="text-zinc-600 dark:text-zinc-400 print:hidden">
          Carregando...
        </p>
      ) : vendas.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Nenhuma venda confirmada pra essa data.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-600 dark:text-zinc-400 print:text-black">
              <th className="pb-2 font-medium">Nome</th>
              <th className="pb-2 font-medium">CPF</th>
              <th className="pb-2 font-medium">Código</th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda) => (
              <tr
                key={venda.id}
                className="border-t border-zinc-200 dark:border-zinc-800 print:border-black print:text-black"
              >
                <td className="py-2">{venda.comprador_nome}</td>
                <td className="py-2">{mascararCpf(venda.comprador_cpf)}</td>
                <td className="py-2">{venda.codigo_verificacao ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
