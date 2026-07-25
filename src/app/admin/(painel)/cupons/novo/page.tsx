import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { NovoCupomForm } from "@/components/admin/NovoCupomForm";

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
      <Link
        href="/admin/cupons"
        className="font-body text-terracota/60 hover:text-terracota text-sm font-medium"
      >
        ← Cupons
      </Link>

      <h1 className="font-display text-terracota text-2xl font-extrabold tracking-tight">
        Novo cupom
      </h1>

      <NovoCupomForm />
    </div>
  );
}
