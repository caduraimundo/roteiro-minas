import { Footer } from "@/components/Footer";
import { GlobalNav } from "@/components/GlobalNav";
import { TexturaTopografica } from "@/components/TexturaTopografica";
import { getConfiguracoesSite } from "@/data/configuracoes";

export default async function SobreNos() {
  const configuracoes = await getConfiguracoesSite();

  return (
    <div className="flex flex-1 flex-col">
      <GlobalNav />

      <div className="mx-auto flex w-full max-w-5xl px-8 py-4">
        <h1 className="font-display text-verde-mata dark:text-pedra-sabao text-2xl font-extrabold tracking-tight">
          Sobre Nós
        </h1>
      </div>

      <div className="relative h-12 w-full">
        <TexturaTopografica variant="divisor" />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-8">
        <p className="font-display text-verde-mata dark:text-pedra-sabao text-2xl font-extrabold tracking-tight sm:text-3xl">
          Experiências que conectam você à natureza.
        </p>

        <p className="font-body text-zinc-600 dark:text-zinc-400">
          Somos uma agência especializada em ecoturismo e experiências de
          conexão com a natureza. Organizamos bate-voltas, travessias,
          expedições, roteiros de fim de semana e feriados, além de viagens
          para destinos naturais, culturais e históricos em Minas Gerais e em
          outros estados. Também trabalhamos com receptivo em Ouro Preto,
          Mariana e região, roteiros personalizados, transporte, hospedagem,
          seguro aventura conduzido pelos nossos guias.
        </p>

        {/* Trajetória em números - tratamento de destaque (não é o rodapé
            pequeno do Footer), reaproveitando o mesmo box tintado em
            verde-mata/5 já usado no "Cancelamento flexível" do Detalhe do
            roteiro, adaptado pra 3 blocos centralizados. */}
        <section className="flex flex-col gap-5">
          <h2 className="font-display text-verde-mata dark:text-pedra-sabao text-2xl font-extrabold tracking-tight">
            Nossa trajetória em números
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="border-verde-mata/20 bg-verde-mata/5 flex flex-col items-center gap-1 rounded-2xl border p-6 text-center dark:border-zinc-800">
              <span className="font-display text-terracota text-3xl font-extrabold">
                {configuracoes?.stats_seguidores_instagram ?? "—"}
              </span>
              <span className="font-body text-sm text-zinc-600 dark:text-zinc-400">
                seguidores no Instagram
              </span>
            </div>
            <div className="border-verde-mata/20 bg-verde-mata/5 flex flex-col items-center gap-1 rounded-2xl border p-6 text-center dark:border-zinc-800">
              <span className="font-display text-terracota text-3xl font-extrabold">
                {configuracoes?.stats_roteiros_realizados ?? "—"}
              </span>
              <span className="font-body text-sm text-zinc-600 dark:text-zinc-400">
                roteiros realizados
              </span>
            </div>
            <div className="border-verde-mata/20 bg-verde-mata/5 flex flex-col items-center gap-1 rounded-2xl border p-6 text-center dark:border-zinc-800">
              <span className="font-display text-terracota text-3xl font-extrabold">
                {configuracoes?.stats_avaliacao_media ?? "—"}
              </span>
              <span className="font-body text-sm text-zinc-600 dark:text-zinc-400">
                avaliação média
              </span>
            </div>
          </div>
        </section>

        <p className="font-body text-sm text-zinc-500 dark:text-zinc-500">
          Cadastur {configuracoes?.cadastur_numero ?? "—"}
        </p>
      </div>

      <Footer />
    </div>
  );
}
