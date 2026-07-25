import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { RelatorioClient } from "@/components/admin/RelatorioClient";

// Mesma lógica de src/app/api/admin/relatorio/route.ts (Brasil não observa
// horário de verão desde 2019, offset -03:00 fixo é seguro) - repetida
// aqui só pra escolher o valor inicial do seletor de mês; a API já aplica
// o mesmo default quando `mes` vem vazio, então mesmo se isso divergir um
// dia o pior caso é o seletor abrir num mês diferente do default real.
const OFFSET_SAO_PAULO_MS = 3 * 60 * 60 * 1000;

function mesAtualSaoPaulo(): string {
  const agoraSp = new Date(Date.now() - OFFSET_SAO_PAULO_MS);
  const ano = agoraSp.getUTCFullYear();
  const mes = String(agoraSp.getUTCMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

export default async function AdminRelatorio() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email || !ADMIN_ALLOWLIST.includes(user.email)) {
    redirect("/admin/login");
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="font-display text-terracota text-2xl font-extrabold tracking-tight">
          Relatório mensal
        </h1>
        <p className="font-body mt-1 text-sm text-zinc-600">
          Acompanhe o desempenho financeiro por mês.
        </p>
      </div>

      <RelatorioClient mesInicial={mesAtualSaoPaulo()} />
    </div>
  );
}
