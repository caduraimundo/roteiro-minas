import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { NovoCupomForm } from "@/components/admin/NovoCupomForm";
import { VoltarLink } from "@/components/admin/VoltarLink";

export default async function AdminNovoCupom() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email || !ADMIN_ALLOWLIST.includes(user.email)) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-8">
      <VoltarLink href="/admin/cupons" label="Cupons" />

      <h1 className="font-display text-terracota text-2xl font-extrabold tracking-tight">
        Novo cupom
      </h1>

      <NovoCupomForm />
    </div>
  );
}
