import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { formatarData, formatarPreco } from "@/lib/format";
import { MarcarTaxaAcertadaButton } from "@/components/admin/MarcarTaxaAcertadaButton";
import { ReembolsarVendaButton } from "@/components/admin/ReembolsarVendaButton";

type StatusVenda =
  | "confirmada"
  | "cancelada"
  | "pendencia_vaga_esgotada"
  | "reembolsada";

type Venda = {
  id: string;
  vaga_id: string;
  comprador_nome: string;
  comprador_email: string;
  comprador_cpf: string;
  valor_total: number;
  status: StatusVenda;
  created_at: string;
  venda_manual: boolean;
  codigo_verificacao: string | null;
  taxa_devida_valor: number | null;
  taxa_devida_acertada_em: string | null;
};

const RUBRICAS_STATUS: Record<Exclude<StatusVenda, "confirmada">, string> = {
  cancelada: "Cancelada",
  pendencia_vaga_esgotada: "Pendência (vaga esgotada)",
  reembolsada: "Reembolsada",
};

export default async function AdminVendas() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email || !ADMIN_ALLOWLIST.includes(user.email)) {
    redirect("/admin/login");
  }

  const supabaseAdmin = createAdminClient();

  const { data: vendas, error: erroVendas } = await supabaseAdmin
    .from("vendas")
    .select(
      "id, vaga_id, comprador_nome, comprador_email, comprador_cpf, valor_total, status, created_at, venda_manual, codigo_verificacao, taxa_devida_valor, taxa_devida_acertada_em",
    )
    .order("created_at", { ascending: false });

  if (erroVendas) {
    console.error("Erro ao listar vendas (admin/vendas):", erroVendas.message);
  }

  const { data: vagas, error: erroVagas } = await supabaseAdmin
    .from("vagas")
    .select("id, roteiro_id, data");

  if (erroVagas) {
    console.error(
      "Erro ao listar vagas (admin/vendas):",
      erroVagas.message,
    );
  }

  const { data: roteiros, error: erroRoteiros } = await supabaseAdmin
    .from("roteiros")
    .select("id, nome");

  if (erroRoteiros) {
    console.error(
      "Erro ao listar roteiros (admin/vendas):",
      erroRoteiros.message,
    );
  }

  const roteiroNomePorId = new Map(
    (roteiros ?? []).map((roteiro) => [roteiro.id, roteiro.nome]),
  );

  const vagaPorId = new Map(
    (vagas ?? []).map((vaga) => [
      vaga.id,
      { data: vaga.data, roteiroNome: roteiroNomePorId.get(vaga.roteiro_id) },
    ]),
  );

  const vendasTipadas = (vendas ?? []) as Venda[];

  const taxaDevidaPendente = vendasTipadas.reduce((total, venda) => {
    if (venda.taxa_devida_valor && !venda.taxa_devida_acertada_em) {
      return total + venda.taxa_devida_valor;
    }
    return total;
  }, 0);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-8">
      <Link href="/admin" className="text-sm text-zinc-600 dark:text-zinc-400">
        ← Roteiros
      </Link>

      <h1 className="text-xl font-semibold">Vendas</h1>

      {taxaDevidaPendente > 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Taxa devida do Markys: {formatarPreco(taxaDevidaPendente)}
        </p>
      )}

      {vendasTipadas.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Nenhuma venda registrada ainda.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {vendasTipadas.map((venda) => {
            const vaga = vagaPorId.get(venda.vaga_id);
            const taxaPendente =
              venda.taxa_devida_valor !== null &&
              !venda.taxa_devida_acertada_em;

            return (
              <li
                key={venda.id}
                className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="font-medium">{venda.comprador_nome}</span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {vaga?.roteiroNome ?? "Roteiro desconhecido"}
                      {vaga?.data && ` · ${formatarData(vaga.data)}`}
                    </span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {formatarPreco(venda.valor_total)} ·{" "}
                      {new Date(venda.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {venda.venda_manual && (
                      <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        Manual
                      </span>
                    )}
                    {venda.status !== "confirmada" && (
                      <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {RUBRICAS_STATUS[venda.status]}
                      </span>
                    )}
                  </div>
                </div>

                {taxaPendente && (
                  <div className="flex items-center justify-between gap-4 border-t border-zinc-200 pt-2 dark:border-zinc-800">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Taxa devida: {formatarPreco(venda.taxa_devida_valor as number)}
                    </span>
                    <MarcarTaxaAcertadaButton vendaId={venda.id} />
                  </div>
                )}

                {venda.status === "confirmada" && (
                  <div className="border-t border-zinc-200 pt-2 dark:border-zinc-800">
                    <ReembolsarVendaButton vendaId={venda.id} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
