import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { PopupCallbackNotifier } from "@/components/PopupCallbackNotifier";
import { formatarPreco, formatarDataCurta } from "@/lib/format";
import { hojeSaoPaulo } from "@/lib/mes-sao-paulo";
import type { Roteiro, Vaga } from "@/data/roteiros";

const RUBRICAS_TIPO: Record<Roteiro["tipo"], string> = {
  emissivel: "Emissível",
  receptivo: "Receptivo",
};

// Mesmo conjunto de CATEGORIAS_VALIDAS de src/app/api/admin/roteiros/route.ts.
const RUBRICAS_CATEGORIA: Record<string, string> = {
  trilha: "Trilha",
  cachoeira: "Cachoeira",
  travessia: "Travessia",
  cultural: "Cultural",
};

type RoteiroComVagas = Roteiro & { vagas: Vaga[] };

// Preço e vagas disponíveis são por vaga, não por roteiro (schema real:
// `vagas` é tabela separada, relacionada por roteiro_id) - a "próxima
// saída" é a vaga aberta mais próxima no futuro, usada pra derivar
// preço/estoque exibidos no card. Roteiros receptivos não têm vaga
// (preço fixo, sem contagem), então isso sempre vem null pra eles.
function proximaVagaAberta(vagas: Vaga[], hoje: string): Vaga | null {
  const abertas = vagas
    .filter((vaga) => vaga.status === "aberta" && vaga.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data));
  return abertas[0] ?? null;
}

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

function PencilIcon({ className }: { className?: string }) {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
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
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
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
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}

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
  // uma chamada HTTP de servidor pra servidor por nada. `vagas(*)` é o
  // mesmo padrão de embed já usado em getRoteirosAtivos (data/roteiros.ts)
  // - traz as vagas de cada roteiro numa query só, sem precisar de rota
  // nova nem de um segundo round-trip manual.
  const supabaseAdmin = createAdminClient();
  const { data: roteiros, error } = await supabaseAdmin
    .from("roteiros")
    .select("*, vagas(*)")
    .order("nome");

  if (error) {
    console.error("Erro ao listar roteiros (admin/page):", error.message);
  }

  const hoje = hojeSaoPaulo();

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-8">
      <PopupCallbackNotifier />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-terracota text-2xl font-extrabold tracking-tight">
            Roteiros
          </h1>
          <p className="font-body mt-1 text-sm text-zinc-600">
            Gerencie todos os passeios oferecidos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="font-body text-terracota rounded-2xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold"
          >
            Exportar lista
          </button>
          <Link
            href="/admin/roteiros/novo"
            className="font-body bg-verde-mata text-pedra-sabao rounded-2xl px-5 py-2.5 text-sm font-semibold"
          >
            Novo roteiro
          </Link>
        </div>
      </div>

      {/* Busca + filtro de categoria - só a UI por enquanto, mesmo
          padrão do campo de busca do header (AdminShell) - sem lógica
          de filtro real ainda, entra quando a listagem crescer o
          suficiente pra precisar. */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-pedra-sabao flex min-w-[260px] max-w-md flex-1 items-center gap-2.5 rounded-2xl px-4 py-2.5">
          <SearchIcon className="text-terracota/50 h-[19px] w-[19px] shrink-0" />
          <input
            type="search"
            placeholder="Buscar roteiro por nome"
            className="font-body text-terracota placeholder:text-terracota/40 w-full min-w-0 bg-transparent text-sm outline-none"
          />
        </div>
        <select
          defaultValue=""
          className="font-body text-terracota bg-pedra-sabao rounded-2xl px-4 py-2.5 text-sm font-medium outline-none"
        >
          <option value="">Todas as categorias</option>
          {Object.entries(RUBRICAS_CATEGORIA).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="font-body text-sm text-red-600">
          Não foi possível carregar os roteiros. Tente recarregar a página.
        </p>
      ) : !roteiros || roteiros.length === 0 ? (
        <div className="bg-pedra-sabao flex flex-col items-center gap-3 rounded-2xl p-14 text-center">
          <span className="bg-verde-mata/10 text-verde-mata flex h-16 w-16 items-center justify-center rounded-2xl">
            <MapIcon className="h-7 w-7" />
          </span>
          <div>
            <p className="font-display text-terracota text-lg font-bold">
              Nenhum roteiro cadastrado
            </p>
            <p className="font-body text-terracota/60 mt-1 text-sm">
              Comece criando seu primeiro roteiro.
            </p>
          </div>
          <Link
            href="/admin/roteiros/novo"
            className="font-body bg-verde-mata text-pedra-sabao mt-2 rounded-2xl px-5 py-2.5 text-sm font-semibold"
          >
            Novo roteiro
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-2">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="font-body text-terracota/50 text-left text-[11px] font-bold tracking-wide uppercase">
                <th className="px-4 py-3">Roteiro</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Próx. saída</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Vagas</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(roteiros as RoteiroComVagas[]).map((roteiro) => {
                const vaga = proximaVagaAberta(roteiro.vagas, hoje);
                const preco =
                  roteiro.tipo === "receptivo"
                    ? roteiro.preco_receptivo !== null
                      ? formatarPreco(roteiro.preco_receptivo)
                      : "—"
                    : vaga
                      ? formatarPreco(vaga.preco)
                      : "—";
                const percentualVagas =
                  vaga && vaga.vagas_totais > 0
                    ? Math.round(
                        (vaga.vagas_disponiveis / vaga.vagas_totais) * 100,
                      )
                    : 0;

                return (
                  <tr
                    key={roteiro.id}
                    className="font-body border-t border-zinc-100 text-sm"
                  >
                    <td className="px-4 py-4">
                      <div className="text-terracota font-semibold">
                        {roteiro.nome}
                      </div>
                      <div className="text-terracota/50 text-xs">
                        {RUBRICAS_TIPO[roteiro.tipo] ?? roteiro.tipo}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {roteiro.categoria ? (
                        <span className="bg-pedra-sabao text-terracota rounded-full px-3 py-1 text-xs font-semibold">
                          {RUBRICAS_CATEGORIA[roteiro.categoria] ??
                            roteiro.categoria}
                        </span>
                      ) : (
                        <span className="text-terracota/40">—</span>
                      )}
                    </td>
                    <td className="text-terracota px-4 py-4 font-medium">
                      {vaga ? formatarDataCurta(vaga.data) : "—"}
                    </td>
                    <td className="text-terracota px-4 py-4 font-semibold">
                      {preco}
                    </td>
                    <td className="px-4 py-4">
                      {roteiro.tipo === "receptivo" ? (
                        <span className="text-terracota/50 text-xs">
                          Sem controle de vagas
                        </span>
                      ) : vaga ? (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-terracota/70 text-xs font-semibold">
                            {vaga.vagas_disponiveis}/{vaga.vagas_totais}{" "}
                            disponíveis
                          </span>
                          <div className="bg-pedra-sabao h-1.5 w-24 overflow-hidden rounded-full">
                            <div
                              className="bg-verde-mata h-full rounded-full"
                              style={{ width: `${percentualVagas}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-terracota/50 text-xs">
                          Nenhuma vaga aberta
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          roteiro.ativo
                            ? "bg-verde-mata/10 text-verde-mata"
                            : "bg-pedra-sabao text-terracota/60"
                        }`}
                      >
                        {roteiro.ativo ? "Ativo" : "Pausado"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/roteiros/${roteiro.id}`}
                          aria-label={`Editar ${roteiro.nome}`}
                          className="text-terracota flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <a
                          href={`/roteiros/${roteiro.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Ver ${roteiro.nome} no site`}
                          className="text-terracota flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </a>
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
