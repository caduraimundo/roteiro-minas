"use client";

import { useEffect, useState } from "react";
import { formatarPreco, formatarDataCurta } from "@/lib/format";
import { NovoRoteiroPanel } from "@/components/admin/NovoRoteiroPanel";

type VendasMes = {
  mes: string;
  total_vendas: number;
  valor_total: number;
};

type VagaResumo = {
  vaga_id: string;
  roteiro_nome: string;
  data: string;
  vagas_disponiveis: number;
};

type VendaSemanaDia = {
  dia: string;
  data: string;
  total_vendas: number;
};

type DashboardData = {
  vendas_mes: VendasMes;
  taxa_devida_pendente: number;
  roteiros_ativos: number;
  vagas_esgotando: VagaResumo[];
  vendas_semana: VendaSemanaDia[];
  proximas_vagas: VagaResumo[];
};

// Mesmo critério de "esgotando" usado em LIMITE_VAGAS_ESGOTANDO
// (src/app/api/admin/dashboard/route.ts), reaplicado aqui só como
// destaque visual na lista de próximos roteiros - a API já devolve
// proximas_vagas sem filtro de estoque, isso não filtra nada, só
// estiliza os itens com pouca vaga sobrando.
const LIMITE_VAGAS_BAIXAS = 3;

export function DashboardClient() {
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [panelAberto, setPanelAberto] = useState(false);

  useEffect(() => {
    let cancelado = false;

    fetch("/api/admin/dashboard")
      .then(async (resposta) => {
        const corpo = await resposta.json().catch(() => null);
        if (cancelado) return;

        if (!resposta.ok) {
          setErro(corpo?.erro ?? "Erro ao carregar dashboard.");
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
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-terracota text-2xl font-extrabold tracking-tight">
            Dashboard
          </h1>
          <p className="font-body mt-1 text-sm text-zinc-600">
            Gerencie roteiros, vendas e vagas em um só lugar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="font-body text-terracota rounded-2xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold"
          >
            Exportar dados
          </button>
          <button
            type="button"
            onClick={() => setPanelAberto(true)}
            className="font-body bg-verde-mata text-pedra-sabao rounded-2xl px-5 py-2.5 text-sm font-semibold"
          >
            Novo Roteiro
          </button>
        </div>
      </div>

      <NovoRoteiroPanel
        aberto={panelAberto}
        onClose={() => setPanelAberto(false)}
      />

      {erro && <p className="font-body text-sm text-red-600">{erro}</p>}

      {carregando ? (
        <p className="font-body text-sm text-zinc-600">Carregando...</p>
      ) : (
        dados && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                titulo="Roteiros ativos"
                valor={String(dados.roteiros_ativos)}
                destaque
              />
              <MetricCard
                titulo="Vendas do mês"
                valor={String(dados.vendas_mes.total_vendas)}
                subtitulo={formatarPreco(dados.vendas_mes.valor_total)}
              />
              <MetricCard
                titulo="Taxa devida pendente"
                valor={formatarPreco(dados.taxa_devida_pendente)}
              />
              <MetricCard
                titulo="Vagas esgotando"
                valor={String(dados.vagas_esgotando.length)}
                subtitulo="com estoque baixo"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="flex flex-col gap-4 lg:col-span-2">
                <VendasSemanaCard dias={dados.vendas_semana} />
                <ProximosRoteirosCard vagas={dados.proximas_vagas} />
              </div>

              <ProximoRoteiroCard vaga={dados.proximas_vagas[0] ?? null} />
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
  subtitulo,
  destaque,
}: {
  titulo: string;
  valor: string;
  subtitulo?: string;
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
      <span className="font-display text-3xl font-extrabold tracking-tight">
        {valor}
      </span>
      {subtitulo && (
        <span
          className={`font-body text-xs ${
            destaque ? "text-pedra-sabao/70" : "text-terracota/50"
          }`}
        >
          {subtitulo}
        </span>
      )}
    </div>
  );
}

function VendasSemanaCard({ dias }: { dias: VendaSemanaDia[] }) {
  const maiorValor = Math.max(1, ...dias.map((dia) => dia.total_vendas));

  return (
    <div className="bg-pedra-sabao flex flex-col gap-4 rounded-2xl p-5">
      <h2 className="font-display text-terracota text-sm font-bold uppercase tracking-wide">
        Vendas da semana
      </h2>

      <div className="flex h-32 items-end justify-between gap-2">
        {dias.map((dia) => (
          <div
            key={dia.data}
            className="flex h-full flex-1 flex-col items-center gap-2"
          >
            <div className="flex h-full w-full items-end">
              <div
                className="bg-verde-mata w-full rounded-t-md"
                style={{
                  height: `${(dia.total_vendas / maiorValor) * 100}%`,
                  minHeight: dia.total_vendas > 0 ? "4px" : "2px",
                }}
                title={`${dia.total_vendas} venda(s) em ${formatarDataCurta(dia.data)}`}
              />
            </div>
            <span className="font-body text-terracota/60 text-xs font-semibold">
              {dia.dia}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProximoRoteiroCard({ vaga }: { vaga: VagaResumo | null }) {
  return (
    <div className="bg-verde-mata text-pedra-sabao flex flex-col gap-3 rounded-2xl p-5">
      <span className="font-body text-pedra-sabao/80 text-xs font-semibold uppercase tracking-wide">
        Próximo roteiro
      </span>

      {vaga ? (
        <>
          <span className="font-display text-xl font-bold">
            {vaga.roteiro_nome}
          </span>
          <div className="font-body text-pedra-sabao/90 flex items-center gap-3 text-sm">
            <span>{formatarDataCurta(vaga.data)}</span>
            <span>·</span>
            <span>{vaga.vagas_disponiveis} vaga(s) disponível(is)</span>
          </div>
        </>
      ) : (
        <span className="font-body text-pedra-sabao/80 text-sm">
          Nenhuma vaga agendada.
        </span>
      )}
    </div>
  );
}

function ProximosRoteirosCard({ vagas }: { vagas: VagaResumo[] }) {
  return (
    <div className="bg-pedra-sabao flex flex-col gap-3 rounded-2xl p-5">
      <h2 className="font-display text-terracota text-sm font-bold uppercase tracking-wide">
        Próximos roteiros
      </h2>

      {vagas.length === 0 ? (
        <p className="font-body text-terracota/60 text-sm">
          Nenhuma vaga agendada.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {vagas.map((vaga) => {
            const estoqueBaixo = vaga.vagas_disponiveis <= LIMITE_VAGAS_BAIXAS;
            return (
              <li
                key={vaga.vaga_id}
                className="font-body flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm"
              >
                <span className="text-terracota font-medium">
                  {vaga.roteiro_nome}
                </span>
                <span className="text-terracota/60">
                  {formatarDataCurta(vaga.data)}
                </span>
                <span
                  className={
                    estoqueBaixo ? "text-terracota font-bold" : "text-terracota/60"
                  }
                >
                  {vaga.vagas_disponiveis} vaga(s)
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
