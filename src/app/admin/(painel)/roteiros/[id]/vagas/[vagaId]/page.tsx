import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { formatarData, formatarPreco } from "@/lib/format";
import { VendaManualForm } from "@/components/admin/VendaManualForm";
import type { Roteiro, Vaga } from "@/data/roteiros";

const RUBRICAS_STATUS_VAGA: Record<Vaga["status"], string> = {
  aberta: "Aberta",
  lotada: "Lotada",
  cancelada: "Cancelada",
};

export default async function AdminVagaDetalhe({
  params,
}: {
  params: Promise<{ id: string; vagaId: string }>;
}) {
  const { id, vagaId } = await params;

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
      "Erro ao buscar roteiro (admin/roteiros/[id]/vagas/[vagaId]):",
      erroRoteiro.message,
    );
  }

  if (!roteiro) {
    notFound();
  }

  // As duas condições juntas evitam acessar uma vaga de outro roteiro via
  // URL manipulada.
  const { data: vaga, error: erroVaga } = await supabaseAdmin
    .from("vagas")
    .select("*")
    .eq("id", vagaId)
    .eq("roteiro_id", id)
    .maybeSingle();

  if (erroVaga) {
    console.error(
      "Erro ao buscar vaga (admin/roteiros/[id]/vagas/[vagaId]):",
      erroVaga.message,
    );
  }

  if (!vaga) {
    notFound();
  }

  const roteiroTipado = roteiro as Roteiro;
  const vagaTipada = vaga as Vaga;

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-8">
      <Link
        href={`/admin/roteiros/${id}`}
        className="font-body text-terracota/60 hover:text-terracota text-sm font-medium"
      >
        ← {roteiroTipado.nome}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-terracota text-2xl font-extrabold tracking-tight">
            {formatarData(vagaTipada.data)}
          </h1>
          <span className="font-body text-terracota/60 text-sm">
            {formatarPreco(vagaTipada.preco)} ·{" "}
            {vagaTipada.vagas_disponiveis}/{vagaTipada.vagas_totais} vagas ·{" "}
            {RUBRICAS_STATUS_VAGA[vagaTipada.status]}
          </span>
        </div>

        <Link
          href={`/admin/roteiros/${id}/vagas/${vagaId}/lista`}
          className="font-body text-terracota self-start rounded-2xl border border-zinc-300 px-5 py-2.5 text-sm font-medium"
        >
          Lista do dia
        </Link>
      </div>

      <VendaManualForm
        vagaId={vagaTipada.id}
        vagasDisponiveis={vagaTipada.vagas_disponiveis}
      />
    </div>
  );
}
