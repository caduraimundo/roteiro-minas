import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { NovoRoteiroForm } from "@/components/admin/NovoRoteiroForm";
import { VoltarLink } from "@/components/admin/VoltarLink";

export default async function AdminNovoRoteiro() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email || !ADMIN_ALLOWLIST.includes(user.email)) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-8">
      <VoltarLink href="/admin/roteiros" label="Roteiros" />

      <div>
        <h1 className="font-display text-terracota text-2xl font-extrabold tracking-tight">
          Novo roteiro
        </h1>
        <p className="font-body mt-1 text-sm text-zinc-600">
          Preencha as informações do passeio.
        </p>
      </div>

      <NovoRoteiroForm />
    </div>
  );
}
