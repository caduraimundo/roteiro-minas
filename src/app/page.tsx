import { RoteiroCard } from "@/components/RoteiroCard";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Header } from "@/components/Header";
import { WhatsAppFloatButton } from "@/components/WhatsAppFloatButton";
import { Depoimentos } from "@/components/Depoimentos";
import { TexturaTopografica } from "@/components/TexturaTopografica";
import { Footer } from "@/components/Footer";
import { getRoteirosAtivos } from "@/data/roteiros";

export default async function Home() {
  const roteiros = await getRoteirosAtivos();

  // "Próximo roteiro" e contagem de vaga não fazem sentido pro tipo
  // receptivo (preço fixo, sem vagas) - por isso ele nunca entra nesse
  // grid, tem seção própria logo abaixo.
  const emissiveis = roteiros.filter((roteiro) => roteiro.tipo === "emissivel");
  const receptivos = roteiros.filter((roteiro) => roteiro.tipo === "receptivo");

  return (
    <>
      <div className="relative">
        <Header />
        <HeroCarousel />
      </div>
      <WhatsAppFloatButton />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-14 p-8">
        <section className="flex flex-col gap-5">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            Próximos roteiros
          </h2>

          {emissiveis.length === 0 ? (
            <p className="font-body text-zinc-600 dark:text-zinc-400">
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
          <section className="bg-ocre/70 flex flex-col gap-5 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col gap-1">
              <span className="font-body text-terracota text-xs font-semibold tracking-[0.2em] uppercase">
                Sob encomenda
              </span>
              <h2 className="font-display text-2xl font-extrabold tracking-tight">
                Roteiros receptivos
              </h2>
              <p className="font-body max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
                Passeios personalizados pra grupos e agências, com data e
                valor combinados diretamente com a gente pelo WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 md:grid-cols-3">
              {receptivos.map((roteiro) => (
                <RoteiroCard key={roteiro.id} roteiro={roteiro} />
              ))}
            </div>
          </section>
        )}

        <div className="relative h-16 w-full">
          <TexturaTopografica variant="divisor" />
        </div>

        <Depoimentos />
      </div>

      <Footer />
    </>
  );
}
