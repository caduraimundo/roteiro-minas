import { Footer } from "@/components/Footer";
import { GlobalNav } from "@/components/GlobalNav";
import { TexturaTopografica } from "@/components/TexturaTopografica";

export default function Termos() {
  return (
    <div className="flex flex-1 flex-col">
      <GlobalNav />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-8 py-4">
        <h1 className="font-display text-2xl font-semibold uppercase text-verde-mata">
          Termos de Compra
        </h1>
      </div>

      <div className="relative h-12 w-full">
        <TexturaTopografica variant="divisor" />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-8">
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-semibold text-verde-mata">
            1. Quem somos
          </h2>
          <p className="font-body text-verde-mata/70">
            O Roteiro Minas é uma plataforma de venda de ingressos para
            passeios de ecoturismo (trilhas, cachoeiras, travessias e
            roteiros personalizados) na região de Ouro Preto, Mariana e
            Minas Gerais. Cadastur nº 41.020.460/0001-69.
          </p>
          {/* PENDENTE DE VALIDAÇÃO COM O MARKYS: razão social/CNPJ formal
              do Markys não foi incluído aqui porque ainda não foi
              confirmado - adicionar campo quando o dado existir, se
              fizer falta juridicamente. */}
          <p className="font-body text-verde-mata/70">
            Ao comprar um ingresso pelo site, você concorda com estes
            Termos de Compra e com a nossa Política de Reembolso e
            Cancelamento.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-semibold text-verde-mata">
            2. O que você está comprando
          </h2>
          {/* PENDENTE DE VALIDAÇÃO COM O MARKYS: o texto de "o que vem
              incluso" abaixo foi um preenchimento razoável, não
              confirmado pelo Markys. */}
          <p className="font-body text-verde-mata/70">
            O ingresso dá direito à participação no passeio descrito na
            página do roteiro, na data e horário informados no momento
            da compra, sujeito a vagas disponíveis. Salvo indicação
            diferente na página específica do roteiro, o valor pago
            inclui transporte ida e volta ao ponto de embarque
            informado, acompanhamento de guia credenciado durante o
            passeio, e seguro de viagem contratado no ato da compra.
            Alimentação, hospedagem e itens pessoais não estão inclusos,
            salvo quando explicitamente informado na página do roteiro.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-semibold text-verde-mata">
            3. Preço e taxa de serviço
          </h2>
          <p className="font-body text-verde-mata/70">
            O valor final exibido no checkout inclui uma taxa de serviço
            de 6% sobre o preço do roteiro, adicionada ao valor
            anunciado. Cupons de desconto, quando aplicáveis, reduzem
            proporcionalmente tanto o preço do roteiro quanto a taxa de
            serviço.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-semibold text-verde-mata">
            4. Seus dados e o seguro do passeio
          </h2>
          <p className="font-body text-verde-mata/70">
            Para participar do passeio, é necessário informar nome
            completo, CPF, data de nascimento e endereço. Esses dados
            são utilizados para a contratação do seguro de viagem que
            cobre o passeio - sem eles, não é possível emitir o seguro
            nem confirmar sua vaga.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-semibold text-verde-mata">
            5. Condições do passeio e segurança
          </h2>
          <p className="font-body text-verde-mata/70">
            Passeios de ecoturismo envolvem esforço físico, terreno
            natural e exposição a condições climáticas. Ao participar,
            você declara estar em condições físicas adequadas para a
            atividade escolhida, se compromete a seguir as orientações
            do guia durante todo o passeio, e reconhece os riscos
            inerentes a atividades ao ar livre em terreno natural.
            Recomenda-se o uso de calçado fechado e adequado à trilha,
            roupas confortáveis e proteção solar.
          </p>
          <p className="font-body text-verde-mata/70">
            O guia pode alterar o roteiro ou suspender a atividade por
            motivos de segurança (condição climática, nível do rio,
            risco de trilha), inclusive sem aviso prévio quando a
            decisão precisar ser tomada no local. Nesses casos,
            aplica-se a nossa Política de Reembolso e Cancelamento.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-semibold text-verde-mata">
            6. Vagas limitadas
          </h2>
          <p className="font-body text-verde-mata/70">
            O transporte (van/ônibus) tem capacidade limitada. A
            confirmação da compra garante sua vaga; não há overbooking
            intencional, mas em caso de erro de sistema, você será
            contatado e reembolsado integralmente, incluindo a taxa de
            serviço.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-semibold text-verde-mata">
            7. Dúvidas e contato
          </h2>
          <p className="font-body text-verde-mata/70">
            Fale com a gente pelo WhatsApp: (31) 8474-3523.
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
