import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { formatarData, formatarPreco } from "@/lib/format";
import { RoteiroCabecalho } from "@/components/admin/RoteiroCabecalho";
import { NovaVagaForm } from "@/components/admin/NovaVagaForm";
import type { Roteiro, Vaga } from "@/data/roteiros";

const RUBRICAS_STATUS_VAGA: Record<"lotada" | "cancelada", string> = {
  lotada: "Lotada",
  cancelada: "Cancelada",
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

  const roteiroTipado = roteiro as Roteiro;

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
