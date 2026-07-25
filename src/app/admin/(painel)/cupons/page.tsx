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
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-8">
      <Link href="/admin/roteiros" className="text-sm text-zinc-600 dark:text-zinc-400">
        ← Roteiros
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Cupons</h1>
        <Link
          href="/admin/cupons/novo"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background"
        >
          Novo cupom
        </Link>
      </div>

      <CuponsClient />
    </div>
  );
}
