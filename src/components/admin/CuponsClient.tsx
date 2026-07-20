"use client";

import { useEffect, useState } from "react";
import { CupomLinha } from "@/components/admin/CupomLinha";

type Cupom = {
  id: string;
  codigo: string;
  roteiro_id: string;
  percentual_desconto: number;
  ativo: boolean;
};

type RoteiroResumo = { id: string; nome: string };

export function CuponsClient() {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [roteiros, setRoteiros] = useState<RoteiroResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    Promise.all([
      fetch("/api/admin/cupons").then(async (resposta) => ({
        ok: resposta.ok,
        body: await resposta.json().catch(() => null),
      })),
      fetch("/api/admin/roteiros").then(async (resposta) => ({
        ok: resposta.ok,
        body: await resposta.json().catch(() => null),
      })),
    ])
      .then(([cuponsResp, roteirosResp]) => {
        if (cancelado) return;

        if (!cuponsResp.ok || !roteirosResp.ok) {
          setErro(
            cuponsResp.body?.erro ??
              roteirosResp.body?.erro ??
              "Erro ao carregar cupons.",
          );
          return;
        }

        setErro(null);
        setCupons(cuponsResp.body.cupons);
        setRoteiros(roteirosResp.body.roteiros);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  function handleAtualizado(cupomAtualizado: Cupom) {
    setCupons((atual) =>
      atual.map((cupom) =>
        cupom.id === cupomAtualizado.id ? cupomAtualizado : cupom,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {erro && <p className="text-sm text-red-600">{erro}</p>}

      {carregando ? (
        <p className="text-zinc-600 dark:text-zinc-400">Carregando...</p>
      ) : cupons.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Nenhum cupom cadastrado ainda.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-600 dark:text-zinc-400">
              <th className="pb-2 font-medium">Código</th>
              <th className="pb-2 font-medium">Roteiro</th>
              <th className="pb-2 font-medium">Desconto</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {cupons.map((cupom) => (
              <CupomLinha
                key={cupom.id}
                cupom={cupom}
                roteiros={roteiros}
                onAtualizado={handleAtualizado}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
