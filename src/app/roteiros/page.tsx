import { RoteiroCard } from "@/components/RoteiroCard";
import { RoteiroReceptivoCard } from "@/components/RoteiroReceptivoCard";
import { GlobalNav } from "@/components/GlobalNav";
import { Footer } from "@/components/Footer";
import { getRoteirosAtivos } from "@/data/roteiros";

export default async function AgendaRoteiros() {
  const roteiros = await getRoteirosAtivos();

  // Mesma separação já resolvida na Home - "próximo"/vaga não se aplica
  // a receptivo (preço fixo, sem vagas), então cada tipo tem sua própria
  // seção em vez de dividir um grid único.
  const emissiveis = roteiros.filter((roteiro) => roteiro.tipo !== "receptivo");
  const receptivos = roteiros.filter((roteiro) => roteiro.tipo === "receptivo");

  return (
    <div className="flex flex-1 flex-col">
      <GlobalNav />

      {/* Cabeçalho no padrão do wireframe: label pequeno ("Agenda 2026")
          acima do H1 ("Próximos Roteiros") - mx-auto max-w-5xl px-8, sem
          breakpoint horizontal adicional, igual ao resto do site
          (GlobalNav/Footer usam o mesmo). Sem BackButton aqui: a
          navegação do GlobalNav já cobre voltar pra Home, diferente do
          detalhe do roteiro e do checkout, onde ele volta pra uma tela
          específica (não pra Home) e continua fazendo sentido. */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-8 py-8">
        <span className="font-body text-verde-mata/60 text-xs font-bold tracking-[0.14em] uppercase">
          Agenda 2026
        </span>
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          Próximos Roteiros
        </h1>
      </div>

      {/* Mesmo mx-auto max-w-5xl px-8 do cabeçalho acima, sem
          breakpoint horizontal adicional - garante que a grade e a
          seção "Sob encomenda" fiquem na mesma margem esquerda do
          cabeçalho, do GlobalNav e do Footer. gap-10 entre as seções
          (emissíveis/receptivos), mesmo valor usado na Home. */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-8 pb-8">
        <section className="flex flex-col gap-5">
          {emissiveis.length === 0 ? (
            <p className="font-body text-verde-mata/70">
              Nenhum roteiro disponível no momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 md:grid-cols-3">
              {emissiveis.map((roteiro) => (
                <RoteiroCard key={roteiro.id} roteiro={roteiro} />
              ))}
            </div>
          )}
        </section>

        {receptivos.length > 0 && (
          <section className="bg-pedra-sabao flex flex-col gap-5 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col gap-1">
              <span className="font-body text-terracota text-xs font-semibold tracking-[0.2em] uppercase">
                Sob encomenda
              </span>
              <h2 className="font-display text-2xl font-extrabold tracking-tight">
                Roteiros receptivos
              </h2>
              <p className="font-body text-verde-mata/70 max-w-2xl text-sm">
                Passeios personalizados pra grupos e agências, com data e
                valor combinados diretamente com a gente pelo WhatsApp.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {receptivos.map((roteiro) => (
                <RoteiroReceptivoCard key={roteiro.id} roteiro={roteiro} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
