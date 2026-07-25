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
      <CustosClient mesInicial={mesAtualSaoPaulo()} />
    </div>
  );
}
