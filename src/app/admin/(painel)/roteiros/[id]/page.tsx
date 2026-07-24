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
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-8">
        <Link
          href="/admin"
          className="text-sm text-zinc-600 dark:text-zinc-400"
        >
          ← Roteiros
        </Link>

        <RoteiroCabecalho roteiro={roteiroTipado} />

        <div className="flex flex-col gap-2">
          <h2 className="font-semibold">Datas indisponíveis</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Roteiro receptivo: preço fixo, sem contagem de vaga - o
            cliente escolhe a data e o site checa contra os bloqueios
            abaixo. Datas desativadas ficam aqui pra histórico, não são
            excluídas.
          </p>

          {!datasIndisponiveis || datasIndisponiveis.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">
              Nenhuma data bloqueada ainda.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {(datasIndisponiveis as DataIndisponivelAdmin[]).map(
                (dataIndisponivel) => (
                  <li
                    key={dataIndisponivel.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {formatarData(dataIndisponivel.data)}
                      </span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
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
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-8">
      <Link href="/admin" className="text-sm text-zinc-600 dark:text-zinc-400">
        ← Roteiros
      </Link>

      <RoteiroCabecalho roteiro={roteiroTipado} />

      {!vagas || vagas.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Nenhuma vaga cadastrada ainda.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {(vagas as Vaga[]).map((vaga) => (
            <li key={vaga.id}>
              <Link
                href={`/admin/roteiros/${id}/vagas/${vaga.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {formatarData(vaga.data)}
                  </span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {formatarPreco(vaga.preco)} ·{" "}
                    {vaga.vagas_disponiveis}/{vaga.vagas_totais} vagas
                  </span>
                </div>

                {vaga.status !== "aberta" && (
                  <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {RUBRICAS_STATUS_VAGA[vaga.status]}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <NovaVagaForm roteiroId={id} />
    </div>
  );
}
