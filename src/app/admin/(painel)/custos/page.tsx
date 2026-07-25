import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { mesAtualSaoPaulo } from "@/lib/mes-sao-paulo";
import { CustosClient } from "@/components/admin/CustosClient";

export default async function AdminCustos() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email || !ADMIN_ALLOWLIST.includes(user.email)) {
    redirect("/admin/login");
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-8">
      <Link
        href="/admin/roteiros"
        className="font-body text-terracota/60 hover:text-terracota text-sm font-medium"
      >
        ← Roteiros
      </Link>

      <div>
        <h1 className="font-display text-terracota text-2xl font-extrabold tracking-tight">
          Painel de custos
        </h1>
        <p className="font-body mt-1 text-sm text-zinc-600">
          Acompanhe custo e margem por roteiro, mês a mês.
        </p>
      </div>

      <CustosClient mesInicial={mesAtualSaoPaulo()} />
    </div>
  );
}
