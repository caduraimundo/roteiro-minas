import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { formatarData, formatarPreco } from "@/lib/format";
import { RoteiroCabecalho } from "@/components/admin/RoteiroCabecalho";
import { NovaVagaForm } from "@/components/admin/NovaVagaForm";
import { NovaDataIndisponivelForm } from "@/components/admin/NovaDataIndisponivelForm";
import { AlternarDataIndisponivelButton } from "@/components/admin/AlternarDataIndisponivelButton";
import type { Roteiro, Vaga } from "@/data/roteiros";

const RUBRICAS_STATUS_VAGA: Record<"lotada" | "cancelada", string> = {
  lotada: "Lotada",
  cancelada: "Cancelada",
};

type DataIndisponivelAdmin = {
  id: string;
  roteiro_id: string;
  data: string;
  ativo: boolean;
  created_at: string;
};

function EyeIcon({ className }: { className?: string }) {
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
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default async function AdminRoteiroDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email || !ADMIN_ALLOWLIST.includes(user.email)) {
    redirect("/admin/login");
  }

  const supabaseAdmin = createAdminClient();

  const { data: roteiro, error: erroRoteiro } = await supabaseAdmin
    .from("roteiros")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (erroRoteiro) {
    console.error(
      "Erro ao buscar roteiro (admin/roteiros/[id]):",
      erroRoteiro.message,
    );
  }

  if (!roteiro) {
    notFound();
  }

  const roteiroTipado = roteiro as Roteiro;

  // Roteiro receptivo não tem vaga (preço fixo, sem contagem) - a gestão
  // aqui é de datas bloqueadas manualmente, não de vagas. Emissível
  // continua exatamente como antes, sem tocar nesse caminho.
  if (roteiroTipado.tipo === "receptivo") {
    const { data: datasIndisponiveis, error: erroDatas } = await supabaseAdmin
      .from("roteiro_datas_indisponiveis")
      .select("*")
      .eq("roteiro_id", id)
      .order("data");

    if (erroDatas) {
      console.error(
        "Erro ao listar datas indisponíveis (admin/roteiros/[id]):",
        erroDatas.message,
      );
    }

    return (
      <div className="flex w-full flex-1 flex-col gap-6 p-8">
        <Link
          href="/admin"
          className="font-body text-terracota/60 hover:text-terracota text-sm font-medium"
        >
          ← Roteiros
        </Link>

        <RoteiroCabecalho roteiro={roteiroTipado} />

        <div className="flex flex-col gap-3">
          <div>
            <h2 className="font-display text-terracota text-lg font-bold">
              Datas indisponíveis
            </h2>
            <p className="font-body text-terracota/60 mt-1 text-sm">
              Roteiro receptivo: preço fixo, sem contagem de vaga - o
              cliente escolhe a data e o site checa contra os bloqueios
              abaixo. Datas desativadas ficam aqui pra histórico, não são
              excluídas.
            </p>
          </div>

          {!datasIndisponiveis || datasIndisponiveis.length === 0 ? (
            <p className="font-body text-terracota/60 text-sm">
              Nenhuma data bloqueada ainda.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {(datasIndisponiveis as DataIndisponivelAdmin[]).map(
                (dataIndisponivel) => (
                  <li
                    key={dataIndisponivel.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4"
                  >
                    <div className="flex flex-col">
                      <span className="font-body text-terracota font-semibold">
                        {formatarData(dataIndisponivel.data)}
                      </span>
                      <span className="font-body text-terracota/60 text-sm">
                        {dataIndisponivel.ativo ? "Bloqueada" : "Desativada"}
                      </span>
                    </div>

                    <AlternarDataIndisponivelButton
                      id={dataIndisponivel.id}
                      ativo={dataIndisponivel.ativo}
                    />
                  </li>
                ),
              )}
            </ul>
          )}
        </div>

        <NovaDataIndisponivelForm roteiroId={id} />
      </div>
    );
  }

  const { data: vagas, error: erroVagas } = await supabaseAdmin
    .from("vagas")
    .select("*")
    .eq("roteiro_id", id)
    .order("data");

  if (erroVagas) {
    console.error(
      "Erro ao listar vagas (admin/roteiros/[id]):",
      erroVagas.message,
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-8">
      <Link
        href="/admin"
        className="font-body text-terracota/60 hover:text-terracota text-sm font-medium"
      >
        ← Roteiros
      </Link>

      <RoteiroCabecalho roteiro={roteiroTipado} />

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-terracota text-lg font-bold">
          Vagas
        </h2>

        {!vagas || vagas.length === 0 ? (
          <p className="font-body text-terracota/60 text-sm">
            Nenhuma vaga cadastrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-2">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="font-body text-terracota/50 text-left text-[11px] font-bold tracking-wide uppercase">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3">Vagas</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {(vagas as Vaga[]).map((vaga) => {
                  const percentual =
                    vaga.vagas_totais > 0
                      ? Math.round(
                          (vaga.vagas_disponiveis / vaga.vagas_totais) * 100,
                        )
                      : 0;

                  return (
                    <tr
                      key={vaga.id}
                      className="font-body border-t border-zinc-100 text-sm"
                    >
                      <td className="text-terracota px-4 py-4 font-semibold">
                        {formatarData(vaga.data)}
                      </td>
                      <td className="text-terracota px-4 py-4 font-medium">
                        {formatarPreco(vaga.preco)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-terracota/70 text-xs font-semibold">
                            {vaga.vagas_disponiveis}/{vaga.vagas_totais}{" "}
                            disponíveis
                          </span>
                          <div className="bg-pedra-sabao h-1.5 w-24 overflow-hidden rounded-full">
                            <div
                              className="bg-verde-mata h-full rounded-full"
                              style={{ width: `${percentual}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {vaga.status !== "aberta" ? (
                          <span className="bg-pedra-sabao text-terracota/60 rounded-full px-3 py-1 text-xs font-semibold">
                            {RUBRICAS_STATUS_VAGA[vaga.status]}
                          </span>
                        ) : (
                          <span className="bg-verde-mata/10 text-verde-mata rounded-full px-3 py-1 text-xs font-semibold">
                            Aberta
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end">
                          <Link
                            href={`/admin/roteiros/${id}/vagas/${vaga.id}`}
                            aria-label={`Ver vaga de ${formatarData(vaga.data)}`}
                            className="text-terracota flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NovaVagaForm roteiroId={id} />
    </div>
  );
}
