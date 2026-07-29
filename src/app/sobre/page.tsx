import Link from "next/link";
import { FotoPlaceholder } from "@/components/FotoPlaceholder";
import { Footer } from "@/components/Footer";
import { GlobalNav } from "@/components/GlobalNav";
import { getConfiguracoesSite } from "@/data/configuracoes";

// Ícones inline (stroke, sem lib externa) - mesmo padrão já usado em
// GlobalNav.tsx e na Home (page.tsx).
function IconeSetaDireita({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function IconeCompass() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.5l-2 5-5 2 2-5z" />
    </svg>
  );
}

function IconeShieldCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function IconeGrupo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
      <circle cx="17.5" cy="9" r="2.2" />
      <path d="M15.7 13.3c2.1.3 3.9 1.7 4.3 3.7" />
    </svg>
  );
}

function IconeFolha() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M5 19c8-1 13-6 14-14-8 1-13 6-14 14z" />
      <path d="M5 19c2-4 5-7 9-9" />
    </svg>
  );
}

// Só afirmações com lastro em outro lugar do site - sem número de
// pessoas por grupo, sem endereço, sem horário (nenhum confirmado).
const COMO_TRABALHAMOS = [
  {
    titulo: "Guias credenciados",
    texto:
      "Guia credenciado acompanha o grupo do início ao fim, garantindo segurança e boas indicações no caminho.",
    Icone: IconeCompass,
  },
  {
    titulo: "Seguro incluso",
    texto:
      "Cobertura de seguro de aventura para todos os participantes, em todo roteiro.",
    Icone: IconeShieldCheck,
  },
  {
    titulo: "Grupos organizados",
    texto:
      "Grupos organizados, com transporte e logística cuidados do embarque ao retorno.",
    Icone: IconeGrupo,
  },
  {
    titulo: "Turismo responsável",
    texto:
      "Atuação comprometida com o turismo responsável na região de Ouro Preto e Mariana.",
    Icone: IconeFolha,
  },
] as const;

export default async function SobreNos() {
  const configuracoes = await getConfiguracoesSite();

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero de página - mesmo tratamento visual do hero da Home
          (fundo escuro, badge, título, GlobalNav transparente por
          cima), mas sem foto: usa a cor de marca verde-mata sólida em
          vez de imagem, já que essa página não tem asset de fundo. */}
      <div className="relative">
        <GlobalNav variant="transparente" />

        <section className="bg-verde-mata relative overflow-hidden">
          <div aria-hidden="true" className="h-24" />

          <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-8 pt-4 pb-16 sm:pb-20">
            <span className="font-body border-pedra-sabao/30 bg-pedra-sabao/10 text-pedra-sabao inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.15em] uppercase">
              <span className="bg-ocre h-1.5 w-1.5 rounded-full" aria-hidden="true" />
              Quem somos
            </span>

            <h1 className="font-display text-pedra-sabao max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              Nossa história
            </h1>

            {/* Texto real já existente na página (não o texto do
                wireframe, que fala de "cachoeiras, montanhas e trilhas
                autênticas" sem lastro confirmado). */}
            <p className="font-body text-pedra-sabao/90 max-w-2xl text-base sm:text-lg">
              Somos uma agência especializada em ecoturismo e experiências de
              conexão com a natureza. Organizamos bate-voltas, travessias,
              expedições, roteiros de fim de semana e feriados, além de
              viagens para destinos naturais, culturais e históricos em
              Minas Gerais e em outros estados. Também trabalhamos com
              receptivo em Ouro Preto, Mariana e região, roteiros
              personalizados, transporte, hospedagem, seguro aventura
              conduzido pelos nossos guias.
            </p>
          </div>
        </section>
      </div>

      {/* Nosso propósito - copy institucional nova, sem dado que
          precise de confirmação (nenhuma afirmação factual específica
          aqui, só tom/posicionamento). */}
      <section className="mx-auto w-full max-w-5xl px-8 py-16">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <span className="font-body text-verde-mata/60 text-xs font-bold tracking-[0.14em] uppercase">
              Nosso propósito
            </span>
            <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Jornadas com sentido
            </h2>
            <p className="font-body text-verde-mata/80 text-base sm:text-lg">
              Nosso propósito é inspirar jornadas que transformam, para que
              você retorne à rotina leve e com um novo olhar sobre o mundo.
            </p>
            <p className="font-body text-verde-mata/60 text-sm sm:text-base">
              Mais do que levar você a lugares bonitos, queremos que cada
              roteiro seja uma pausa com sentido - no ritmo certo, com
              segurança e em contato direto com a natureza que faz de Minas
              um lugar único.
            </p>
          </div>

          <FotoPlaceholder className="aspect-[4/3] w-full rounded-2xl md:aspect-auto md:h-[360px]" />
        </div>
      </section>

      {/* Nossa trajetória em números - só os 3 stats reais existentes,
          sem 4º stat nem estrelas (nenhum dos dois tem lastro). */}
      <section className="border-pedra-sabao bg-pedra-sabao/40 border-y">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-8 py-16">
          <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            Nossa trajetória em números
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="border-pedra-sabao bg-ocre flex flex-col items-center gap-1 rounded-2xl border p-6 text-center">
              <span className="font-display text-terracota text-3xl font-extrabold">
                {configuracoes?.stats_seguidores_instagram ?? "—"}
              </span>
              <span className="font-body text-verde-mata/70 text-sm">
                seguidores no Instagram
              </span>
            </div>
            <div className="border-pedra-sabao bg-ocre flex flex-col items-center gap-1 rounded-2xl border p-6 text-center">
              <span className="font-display text-terracota text-3xl font-extrabold">
                {configuracoes?.stats_roteiros_realizados ?? "—"}
              </span>
              <span className="font-body text-verde-mata/70 text-sm">
                roteiros realizados
              </span>
            </div>
            <div className="border-pedra-sabao bg-ocre flex flex-col items-center gap-1 rounded-2xl border p-6 text-center">
              <span className="font-display text-terracota text-3xl font-extrabold">
                {configuracoes?.stats_avaliacao_media ?? "—"}
              </span>
              <span className="font-body text-verde-mata/70 text-sm">
                avaliação média
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Como trabalhamos - só afirmações já respaldadas em outro
          lugar do site (mesma lista de COMO_TRABALHAMOS acima). */}
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-8 py-16">
        <div className="mx-auto flex max-w-xl flex-col gap-2 text-center">
          <span className="font-body text-verde-mata/60 text-xs font-bold tracking-[0.14em] uppercase">
            Nosso jeito
          </span>
          <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            Como trabalhamos
          </h2>
          <p className="font-body text-verde-mata/70 mt-1 text-sm sm:text-base">
            Alguns princípios acompanham cada saída, do primeiro contato ao
            retorno pra casa.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {COMO_TRABALHAMOS.map(({ titulo, texto, Icone }) => (
            <div
              key={titulo}
              className="border-pedra-sabao bg-ocre flex items-start gap-4 rounded-2xl border p-6"
            >
              <div className="bg-pedra-sabao text-verde-mata flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                <Icone />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-base font-bold">{titulo}</h3>
                <p className="font-body text-verde-mata/70 text-sm">
                  {texto}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Onde atuamos - substitui o mapa + chips de destinos do
          wireframe (nenhum bate com roteiro real cadastrado) por texto
          simples mencionando só Ouro Preto/Mariana, mesma região já
          citada no texto real do hero acima. */}
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-8 pb-16">
        <span className="font-body text-verde-mata/60 text-xs font-bold tracking-[0.14em] uppercase">
          Onde atuamos
        </span>
        <p className="font-body text-verde-mata/80 max-w-2xl text-base sm:text-lg">
          Fazemos turismo receptivo com base em Ouro Preto e Mariana,
          levando grupos às cachoeiras, trilhas e cidades históricas da
          região.
        </p>
      </section>

      {/* CTA final - mesmo estilo de fundo escuro do hero acima (não
          existe um componente de CTA escuro pronto em outro lugar do
          site ainda, então replica o padrão visual do hero). */}
      <section className="mx-auto w-full max-w-5xl px-8 pb-16">
        <div className="bg-verde-mata flex flex-col items-center gap-6 rounded-2xl px-8 py-14 text-center sm:py-16">
          <h2 className="font-display text-pedra-sabao max-w-lg text-2xl font-extrabold tracking-tight sm:text-3xl">
            Pronto para trocar a rotina por um roteiro?
          </h2>
          <Link
            href="/roteiros"
            className="font-display bg-pedra-sabao text-verde-mata hover:bg-ocre inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold tracking-wide uppercase transition-colors"
          >
            Ver próximos roteiros <IconeSetaDireita />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
