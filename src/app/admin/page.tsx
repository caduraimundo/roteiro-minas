import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { LogoutButton } from "@/components/LogoutButton";
import { PopupCallbackNotifier } from "@/components/PopupCallbackNotifier";
import type { Roteiro } from "@/data/roteiros";

const RUBRICAS_TIPO: Record<Roteiro["tipo"], string> = {
  fixo: "Fixo",
  personalizado: "Personalizado",
};

export default async function AdminHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // O proxy já filtra isso antes de chegar aqui, mas a página não deve
  // assumir isso silenciosamente - reconfere antes de renderizar qualquer
  // coisa, evita vazar conteúdo em caso de race condition.
  if (!user || !user.email || !ADMIN_ALLOWLIST.includes(user.email)) {
    redirect("/admin/login");
  }

  // Consulta direto via service_role, sem passar pela rota de API - evitar
  // uma chamada HTTP de servidor pra servidor por nada.
  const supabaseAdmin = createAdminClient();
  const { data: roteiros, error } = await supabaseAdmin
    .from("roteiros")
    .select("*")
    .order("nome");

  if (error) {
    console.error("Erro ao listar roteiros (admin/page):", error.message);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-8">
      <PopupCallbackNotifier />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Roteiros</h1>
        <LogoutButton />
      </div>

      <div className="flex gap-2">
        <Link
          href="/admin/roteiros/novo"
          className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background"
        >
          Novo roteiro
        </Link>
        <Link
          href="/admin/vendas"
          className="self-start rounded-full border border-zinc-300 px-5 py-2 text-sm dark:border-zinc-700"
        >
          Vendas
        </Link>
        <Link
          href="/admin/relatorio"
          className="self-start rounded-full border border-zinc-300 px-5 py-2 text-sm dark:border-zinc-700"
        >
          Relatório
        </Link>
        <Link
          href="/admin/custos"
          className="self-start rounded-full border border-zinc-300 px-5 py-2 text-sm dark:border-zinc-700"
        >
          Custos
        </Link>
        <Link
          href="/admin/cupons"
          className="self-start rounded-full border border-zinc-300 px-5 py-2 text-sm dark:border-zinc-700"
        >
          Cupons
        </Link>
      </div>

      {!roteiros || roteiros.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Nenhum roteiro cadastrado ainda.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {(roteiros as Roteiro[]).map((roteiro) => (
            <li key={roteiro.id}>
              <Link
                href={`/admin/roteiros/${roteiro.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{roteiro.nome}</span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {RUBRICAS_TIPO[roteiro.tipo]}
                  </span>
                </div>

                {!roteiro.ativo && (
                  <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Pausado
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
