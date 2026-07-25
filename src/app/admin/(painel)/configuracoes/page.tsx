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
      <Link href="/admin/roteiros" className="text-sm text-zinc-600 dark:text-zinc-400">
        ← Roteiros
      </Link>

      <h1 className="text-xl font-semibold">Configurações do site</h1>

      <ConfiguracoesForm />
    </div>
  );
}
