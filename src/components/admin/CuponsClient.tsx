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
      {/* Busca - só a UI por enquanto, mesmo padrão já usado na lista
          de Roteiros e no header do AdminShell, sem lógica de filtro
          real ainda. */}
      <div className="bg-pedra-sabao flex min-w-[260px] max-w-md items-center gap-2.5 rounded-2xl px-4 py-2.5">
        <SearchIcon className="text-terracota/50 h-[19px] w-[19px] shrink-0" />
        <input
          type="search"
          placeholder="Buscar por código do cupom"
          className="font-body text-terracota placeholder:text-terracota/40 w-full min-w-0 bg-transparent text-sm outline-none"
        />
      </div>

      {erro && <p className="font-body text-sm text-red-600">{erro}</p>}

      {carregando ? (
        <p className="font-body text-terracota/60 text-sm">Carregando...</p>
      ) : cupons.length === 0 ? (
        <div className="bg-pedra-sabao flex flex-col items-center gap-3 rounded-2xl p-14 text-center">
          <span className="bg-verde-mata/10 text-verde-mata flex h-16 w-16 items-center justify-center rounded-2xl">
            <TicketIcon className="h-7 w-7" />
          </span>
          <div>
            <p className="font-display text-terracota text-lg font-bold">
              Nenhum cupom cadastrado ainda
            </p>
            <p className="font-body text-terracota/60 mt-1 text-sm">
              Crie um código promocional.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-2">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="font-body text-terracota/50 text-left text-[11px] font-bold tracking-wide uppercase">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Roteiro</th>
                <th className="px-4 py-3">Desconto</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
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
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function TicketIcon({ className }: { className?: string }) {
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
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z" />
      <path d="M9 6v12" strokeDasharray="2 3" />
    </svg>
  );
}
