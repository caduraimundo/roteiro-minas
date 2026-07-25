"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatarDataCurta } from "@/lib/format";

type RoteiroOpcao = {
  id: string;
  nome: string;
  tipo: "emissivel" | "receptivo";
};

type VagaOpcao = {
  id: string;
  data: string;
  status: string;
  vagas_disponiveis: number;
};

const campoClasse =
  "font-body text-terracota rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-verde-mata";
const labelClasse =
  "font-body text-terracota flex flex-col gap-1 text-sm font-medium";

function FecharIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

// Mesmo padrão visual/comportamental do NovoRoteiroPanel (desliza da
// direita, overlay, botão fechar) - mas esse painel não cria nada, só
// resolve "qual roteiro + qual vaga" e navega pra
// /admin/roteiros/[id]/vagas/[vagaId], onde o VendaManualForm já
// existe e funciona. Sem rota de API nova - reaproveita
// GET /api/admin/roteiros e GET /api/admin/vagas.
function NovaVendaManualForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const [roteiros, setRoteiros] = useState<RoteiroOpcao[]>([]);
  const [carregandoRoteiros, setCarregandoRoteiros] = useState(true);
  const [erroRoteiros, setErroRoteiros] = useState<string | null>(null);

  const [roteiroId, setRoteiroId] = useState("");
  const [vagaId, setVagaId] = useState("");

  const [vagas, setVagas] = useState<VagaOpcao[]>([]);
  const [carregandoVagas, setCarregandoVagas] = useState(false);
  const [erroVagas, setErroVagas] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    fetch("/api/admin/roteiros")
      .then(async (resposta) => {
        const corpo = await resposta.json().catch(() => null);
        if (cancelado) return;

        if (!resposta.ok || !corpo?.roteiros) {
          setErroRoteiros(corpo?.erro ?? "Erro ao carregar roteiros.");
          return;
        }

        setErroRoteiros(null);
        setRoteiros(corpo.roteiros);
      })
      .finally(() => {
        if (!cancelado) setCarregandoRoteiros(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    // queueMicrotask evita o "setState síncrono dentro de efeito"
    // (react-hooks/set-state-in-effect) - mesmo padrão já usado em
    // admin/login/page.tsx, não muda o comportamento percebido (roda
    // no mesmo tick, antes da próxima pintura).
    queueMicrotask(() => {
      setVagaId("");
    });

    if (!roteiroId) {
      queueMicrotask(() => {
        setVagas([]);
        setErroVagas(null);
      });
      return;
    }

    let cancelado = false;
    queueMicrotask(() => {
      setCarregandoVagas(true);
      setErroVagas(null);
    });

    fetch(`/api/admin/vagas?roteiro_id=${roteiroId}`)
      .then(async (resposta) => {
        const corpo = await resposta.json().catch(() => null);
        if (cancelado) return;

        if (!resposta.ok || !corpo?.vagas) {
          setErroVagas(corpo?.erro ?? "Erro ao carregar vagas.");
          return;
        }

        setErroVagas(null);
        const elegiveis = (corpo.vagas as VagaOpcao[])
          .filter(
            (vaga) => vaga.status === "aberta" && vaga.vagas_disponiveis > 0,
          )
          .sort((a, b) => a.data.localeCompare(b.data));
        setVagas(elegiveis);
      })
      .finally(() => {
        if (!cancelado) setCarregandoVagas(false);
      });

    return () => {
      cancelado = true;
    };
  }, [roteiroId]);

  function handleContinuar() {
    if (!roteiroId || !vagaId) return;
    router.push(`/admin/roteiros/${roteiroId}/vagas/${vagaId}`);
    onClose();
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6">
        {erroRoteiros && (
          <p className="font-body text-sm text-red-600">{erroRoteiros}</p>
        )}

        <label className={labelClasse}>
          Roteiro
          <select
            value={roteiroId}
            onChange={(evento) => setRoteiroId(evento.target.value)}
            disabled={carregandoRoteiros}
            className={campoClasse}
          >
            <option value="">
              {carregandoRoteiros ? "Carregando..." : "Selecione"}
            </option>
            {roteiros.map((roteiro) => (
              <option
                key={roteiro.id}
                value={roteiro.id}
                disabled={roteiro.tipo === "receptivo"}
              >
                {roteiro.nome}
                {roteiro.tipo === "receptivo"
                  ? " (receptivo - ainda não suportado)"
                  : ""}
              </option>
            ))}
          </select>
        </label>

        {roteiroId && (
          <label className={labelClasse}>
            Vaga
            {carregandoVagas ? (
              <p className="font-body text-terracota/60 text-sm font-normal">
                Carregando vagas...
              </p>
            ) : erroVagas ? (
              <p className="font-body text-sm font-normal text-red-600">
                {erroVagas}
              </p>
            ) : vagas.length === 0 ? (
              <p className="font-body text-terracota/60 text-sm font-normal">
                Nenhuma vaga aberta com estoque disponível.
              </p>
            ) : (
              <select
                value={vagaId}
                onChange={(evento) => setVagaId(evento.target.value)}
                className={campoClasse}
              >
                <option value="">Selecione</option>
                {vagas.map((vaga) => (
                  <option key={vaga.id} value={vaga.id}>
                    {formatarDataCurta(vaga.data)} -{" "}
                    {vaga.vagas_disponiveis}{" "}
                    {vaga.vagas_disponiveis === 1 ? "vaga" : "vagas"}
                  </option>
                ))}
              </select>
            )}
          </label>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 p-6">
        <button
          type="button"
          onClick={onClose}
          className="font-body text-terracota rounded-2xl border border-zinc-300 px-5 py-2 text-sm font-medium"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleContinuar}
          disabled={!roteiroId || !vagaId}
          className="font-body bg-verde-mata text-pedra-sabao rounded-2xl px-5 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </>
  );
}

export function NovaVendaManualPanel() {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="font-body bg-verde-mata text-pedra-sabao rounded-2xl px-5 py-2.5 text-sm font-semibold"
      >
        Nova venda manual
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setAberto(false)}
            className="absolute inset-0 bg-black/40"
          />

          <div className="bg-ocre absolute top-0 right-0 flex h-full w-full max-w-[480px] flex-col">
            <div className="flex items-start justify-between gap-4 p-6">
              <div>
                <h2 className="font-display text-terracota text-xl font-extrabold tracking-tight">
                  Nova venda manual
                </h2>
                <p className="font-body text-terracota/60 mt-1 text-sm">
                  Escolha o roteiro e a vaga pra continuar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="text-terracota flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-300"
              >
                <FecharIcon />
              </button>
            </div>

            {/* key força remount a cada abertura - reseta toda a
                seleção (roteiro, vaga, erros) em vez de manter estado
                de uma tentativa anterior. */}
            <NovaVendaManualForm
              key={aberto ? "aberto" : "fechado"}
              onClose={() => setAberto(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
