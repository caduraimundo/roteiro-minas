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
        className="font-body text-terracota/60 hover:text-terracota text-sm font-medium print:hidden"
      >
        ← Voltar
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="font-display text-terracota text-2xl font-extrabold tracking-tight print:text-black">
            {roteiroNome}
          </h1>
          <span className="font-body text-terracota/60 text-sm print:text-black">
            {formatarData(vagaData)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="font-body text-terracota rounded-2xl border border-zinc-300 px-5 py-2.5 text-sm font-medium print:hidden"
        >
          Imprimir
        </button>
      </div>

      {erro && (
        <p className="font-body text-sm text-red-600 print:hidden">{erro}</p>
      )}

      {carregando ? (
        <p className="font-body text-terracota/60 text-sm print:hidden">
          Carregando...
        </p>
      ) : vendas.length === 0 ? (
        <p className="font-body text-terracota/60 text-sm print:text-black">
          Nenhuma venda confirmada pra essa data.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="font-body text-terracota/50 text-left text-[11px] font-bold tracking-wide uppercase print:text-black">
              <th className="pb-2">Nome</th>
              <th className="pb-2">CPF</th>
              <th className="pb-2">Código</th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda) => (
              <tr
                key={venda.id}
                className="font-body text-terracota border-t border-zinc-200 text-sm print:border-black print:text-black"
              >
                <td className="py-2.5">{venda.comprador_nome}</td>
                <td className="py-2.5">{mascararCpf(venda.comprador_cpf)}</td>
                <td className="py-2.5">{venda.codigo_verificacao ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
