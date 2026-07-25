import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { CuponsClient } from "@/components/admin/CuponsClient";

export default async function AdminCupons() {
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

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-terracota text-2xl font-extrabold tracking-tight">
            Cupons
          </h1>
          <p className="font-body mt-1 text-sm text-zinc-600">
            Crie e gerencie códigos promocionais.
          </p>
        </div>
        <Link
          href="/admin/cupons/novo"
          className="font-body bg-verde-mata text-pedra-sabao rounded-2xl px-5 py-2.5 text-sm font-semibold"
        >
          Novo cupom
        </Link>
      </div>

      <CuponsClient />
    </div>
  );
}
