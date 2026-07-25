import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { ConfiguracoesForm } from "@/components/admin/ConfiguracoesForm";

export default async function AdminConfiguracoes() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email || !ADMIN_ALLOWLIST.includes(user.email)) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-8">
      <Link
        href="/admin/roteiros"
        className="font-body text-terracota/60 hover:text-terracota text-sm font-medium"
      >
        ← Roteiros
      </Link>

      <div>
        <h1 className="font-display text-terracota text-2xl font-extrabold tracking-tight">
          Configurações do site
        </h1>
        <p className="font-body mt-1 text-sm text-zinc-600">
          Dados usados no site público (Cadastur, estatísticas e
          política de cancelamento).
        </p>
      </div>

      <ConfiguracoesForm />
    </div>
  );
}
