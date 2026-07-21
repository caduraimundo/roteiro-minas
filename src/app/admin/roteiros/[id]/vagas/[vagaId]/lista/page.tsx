import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { ListaDoDiaClient } from "@/components/admin/ListaDoDiaClient";
import type { Roteiro, Vaga } from "@/data/roteiros";

export default async function AdminListaDoDia({
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
      "Erro ao buscar roteiro (admin/roteiros/[id]/vagas/[vagaId]/lista):",
      erroRoteiro.message,
    );
  }

  if (!roteiro) {
    notFound();
  }

  // As duas condições juntas evitam acessar uma vaga de outro roteiro via
  // URL manipulada (mesmo padrão da página de detalhe da vaga).
  const { data: vaga, error: erroVaga } = await supabaseAdmin
    .from("vagas")
    .select("*")
    .eq("id", vagaId)
    .eq("roteiro_id", id)
    .maybeSingle();

  if (erroVaga) {
    console.error(
      "Erro ao buscar vaga (admin/roteiros/[id]/vagas/[vagaId]/lista):",
      erroVaga.message,
    );
  }

  if (!vaga) {
    notFound();
  }

  const roteiroTipado = roteiro as Roteiro;
  const vagaTipada = vaga as Vaga;

  return (
    <ListaDoDiaClient
      roteiroId={id}
      vagaId={vagaId}
      roteiroNome={roteiroTipado.nome}
      vagaData={vagaTipada.data}
    />
  );
}
