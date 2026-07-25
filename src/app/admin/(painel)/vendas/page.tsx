import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { formatarData, formatarPreco } from "@/lib/format";
import { MarcarTaxaAcertadaButton } from "@/components/admin/MarcarTaxaAcertadaButton";
import { ReembolsarVendaButton } from "@/components/admin/ReembolsarVendaButton";
import { NovaVendaManualPanel } from "@/components/admin/NovaVendaManualPanel";

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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}

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
    <div className="flex w-full flex-1 flex-col gap-6 p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-terracota text-2xl font-extrabold tracking-tight">
            Vendas
          </h1>
          <p className="font-body mt-1 text-sm text-zinc-600">
            Acompanhe vendas, taxas pendentes e reembolsos.
          </p>
        </div>

        <NovaVendaManualPanel />
      </div>

      {/* Resumo usado pra cobrar o Markys mensalmente - soma agregada de
          todas as vendas com taxa pendente de acerto, não só da página
          atual. Mantido visível independente do redesign da lista. */}
      {taxaDevidaPendente > 0 && (
        <div className="bg-verde-mata/10 flex items-center gap-3 rounded-2xl px-5 py-3.5">
          <ReceiptIcon className="text-verde-mata h-5 w-5 shrink-0" />
          <p className="font-body text-verde-mata text-sm font-semibold">
            Taxa devida do Markys: {formatarPreco(taxaDevidaPendente)}
          </p>
        </div>
      )}

      {/* Busca - só a UI por enquanto, mesmo padrão já usado nas telas
          anteriores, sem lógica de filtro real ainda. */}
      <div className="bg-pedra-sabao flex min-w-[260px] max-w-md items-center gap-2.5 rounded-2xl px-4 py-2.5">
        <SearchIcon className="text-terracota/50 h-[19px] w-[19px] shrink-0" />
        <input
          type="search"
          placeholder="Buscar por nome do cliente"
          className="font-body text-terracota placeholder:text-terracota/40 w-full min-w-0 bg-transparent text-sm outline-none"
        />
      </div>

      {vendasTipadas.length === 0 ? (
        <div className="bg-pedra-sabao flex flex-col items-center gap-3 rounded-2xl p-14 text-center">
          <span className="bg-verde-mata/10 text-verde-mata flex h-16 w-16 items-center justify-center rounded-2xl">
            <ReceiptIcon className="h-7 w-7" />
          </span>
          <div>
            <p className="font-display text-terracota text-lg font-bold">
              Nenhuma venda registrada ainda
            </p>
            <p className="font-body text-terracota/60 mt-1 text-sm">
              As vendas confirmadas aparecerão aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-2">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="font-body text-terracota/50 text-left text-[11px] font-bold tracking-wide uppercase">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Roteiro</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Taxa devida</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendasTipadas.map((venda) => {
                const vaga = vagaPorId.get(venda.vaga_id);
                const taxaPendente =
                  venda.taxa_devida_valor !== null &&
                  !venda.taxa_devida_acertada_em;

                return (
                  <tr
                    key={venda.id}
                    className="font-body border-t border-zinc-100 text-sm align-top"
                  >
                    <td className="px-4 py-4">
                      <span className="text-terracota font-semibold">
                        {venda.comprador_nome}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-terracota font-medium">
                        {vaga?.roteiroNome ?? "Roteiro desconhecido"}
                      </div>
                      {vaga?.data && (
                        <div className="text-terracota/50 text-xs">
                          {formatarData(vaga.data)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-terracota font-semibold">
                        {formatarPreco(venda.valor_total)}
                      </div>
                      <div className="text-terracota/50 text-xs">
                        {new Date(venda.created_at).toLocaleDateString(
                          "pt-BR",
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        {venda.venda_manual && (
                          <span className="bg-pedra-sabao text-terracota/70 rounded-full px-3 py-1 text-xs font-semibold">
                            Manual
                          </span>
                        )}
                        {venda.status !== "confirmada" && (
                          <span className="bg-pedra-sabao text-terracota/70 rounded-full px-3 py-1 text-xs font-semibold">
                            {RUBRICAS_STATUS[venda.status]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {taxaPendente ? (
                        <div className="flex flex-col items-start gap-1.5">
                          <span className="text-terracota text-xs font-semibold">
                            {formatarPreco(
                              venda.taxa_devida_valor as number,
                            )}
                          </span>
                          <MarcarTaxaAcertadaButton vendaId={venda.id} />
                        </div>
                      ) : (
                        <span className="text-terracota/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end">
                        {venda.status === "confirmada" ? (
                          <ReembolsarVendaButton vendaId={venda.id} />
                        ) : (
                          <span className="text-terracota/40">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
