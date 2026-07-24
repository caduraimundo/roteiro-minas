import { Footer } from "@/components/Footer";
import { GlobalNav } from "@/components/GlobalNav";
import { TexturaTopografica } from "@/components/TexturaTopografica";

export default function PoliticaDeReembolso() {
  return (
    <div className="flex flex-1 flex-col">
      <GlobalNav />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-8 py-4">
        <h1 className="font-display text-2xl font-semibold uppercase text-verde-mata dark:text-pedra-sabao">
          Política de Reembolso e Cancelamento
        </h1>
      </div>

      <div className="relative h-12 w-full">
        <TexturaTopografica variant="divisor" />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-8">
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-semibold text-verde-mata dark:text-pedra-sabao">
            1. Cancelamento pelo cliente
          </h2>
          <p className="font-body text-zinc-600 dark:text-zinc-400">
            Cancelamentos feitos até 7 dias antes da data do passeio têm
            direito a 100% de reembolso do valor do roteiro.
            Cancelamentos com menos de 7 dias de antecedência, ou não
            comparecimento (no-show), não têm direito a reembolso.
          </p>
          <p className="font-body text-zinc-600 dark:text-zinc-400">
            A taxa de serviço (6%) não é devolvida em nenhum
            cancelamento feito por decisão do cliente, mesmo dentro do
            prazo de 7 dias - só o valor do roteiro em si é reembolsado.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-semibold text-verde-mata dark:text-pedra-sabao">
            2. Cancelamento ou alteração pelo Roteiro Minas
          </h2>
          <p className="font-body text-zinc-600 dark:text-zinc-400">
            Se o passeio for cancelado por nós ou pelo guia (condição
            climática, nível do rio, risco de segurança, número
            insuficiente de participantes, ou qualquer outro motivo de
            nossa responsabilidade), você tem direito a escolher entre
            reembolso integral do valor pago, incluindo a taxa de
            serviço, ou remarcação para outra data disponível, sem
            custo adicional.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-semibold text-verde-mata dark:text-pedra-sabao">
            3. Como funciona o reembolso na prática
          </h2>
          {/* PENDENTE DE VALIDAÇÃO COM O MARKYS: o prazo de "7 dias
              úteis" abaixo também não foi confirmado. */}
          <p className="font-body text-zinc-600 dark:text-zinc-400">
            O reembolso não é processado automaticamente pelo sistema -
            é feito manualmente por nós após confirmação do
            cancelamento, em até 7 dias úteis, devolvido pelo mesmo meio
            de pagamento utilizado na compra sempre que possível.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-semibold text-verde-mata dark:text-pedra-sabao">
            4. Casos excepcionais
          </h2>
          {/* PENDENTE DE VALIDAÇÃO COM O MARKYS: a regra de "caso a
              caso" abaixo é uma proposta, não decisão fechada. */}
          <p className="font-body text-zinc-600 dark:text-zinc-400">
            Situações como problema de saúde comprovado por atestado
            médico, evento de força maior, ou erro comprovado do sistema
            (ex: cobrança duplicada) são tratadas caso a caso e podem
            receber tratamento diferente das regras acima, a critério do
            Roteiro Minas.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-semibold text-verde-mata dark:text-pedra-sabao">
            5. Roteiros personalizados / receptivo
          </h2>
          <p className="font-body text-zinc-600 dark:text-zinc-400">
            Roteiros personalizados seguem a mesma regra de cancelamento
            e reembolso descrita no item 1 (7 dias / sem reembolso da
            taxa de serviço).
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-semibold text-verde-mata dark:text-pedra-sabao">
            6. Como solicitar
          </h2>
          <p className="font-body text-zinc-600 dark:text-zinc-400">
            Solicite pelo WhatsApp: (31) 8474-3523.
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
