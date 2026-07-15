"use client";

import { useMemo, useState } from "react";
import {
  apenasDigitos,
  formatarCPFInput,
  validarCPF,
  validarEmail,
} from "@/lib/validacao";
import { formatarPreco } from "@/lib/format";

const TEXTO_CONSENTIMENTO =
  "Ao continuar, você concorda com os Termos de compra e a Política de reembolso. Seus dados (CPF e nome) serão utilizados para contratação do seguro de viagem do passeio.";

type Campo = "nome" | "cpf" | "email";

type CupomAplicado = {
  codigo: string;
  cpf: string;
  percentualDesconto: number;
};

export function CheckoutForm({
  roteiroId,
  preco,
}: {
  roteiroId: string;
  preco: number;
}) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [tocado, setTocado] = useState<Record<Campo, boolean>>({
    nome: false,
    cpf: false,
    email: false,
  });
  const [enviado, setEnviado] = useState(false);

  const [cupomCodigo, setCupomCodigo] = useState("");
  const [cupomValidando, setCupomValidando] = useState(false);
  const [cupomErro, setCupomErro] = useState<string | null>(null);
  const [cupomAplicado, setCupomAplicado] = useState<CupomAplicado | null>(
    null,
  );

  const nomeValido = nome.trim().length >= 3;
  const cpfValido = validarCPF(cpf);
  const emailValido = validarEmail(email);
  const formularioValido = nomeValido && cpfValido && emailValido && consentimento;

  const cpfDigitos = apenasDigitos(cpf);
  const cupomValidoParaCpfAtual =
    cupomAplicado !== null && cupomAplicado.cpf === cpfDigitos;

  const precoComDesconto = cupomValidoParaCpfAtual
    ? preco - (preco * cupomAplicado.percentualDesconto) / 100
    : preco;

  async function handleAplicarCupom() {
    setCupomErro(null);

    if (!cpfValido) {
      setCupomErro("Informe um CPF válido antes de aplicar o cupom.");
      return;
    }

    if (!cupomCodigo.trim()) {
      setCupomErro("Informe um código de cupom.");
      return;
    }

    setCupomValidando(true);

    try {
      const resposta = await fetch("/api/cupom/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: cupomCodigo.trim(),
          roteiroId,
          cpf: cpfDigitos,
        }),
      });

      const resultado = await resposta.json();

      if (!resultado.valido) {
        setCupomAplicado(null);
        setCupomErro(resultado.motivo ?? "Cupom inválido.");
        return;
      }

      setCupomAplicado({
        codigo: cupomCodigo.trim(),
        cpf: cpfDigitos,
        percentualDesconto: resultado.percentualDesconto,
      });
    } catch {
      setCupomAplicado(null);
      setCupomErro("Não foi possível validar o cupom. Tente novamente.");
    } finally {
      setCupomValidando(false);
    }
  }

  function handleRemoverCupom() {
    setCupomAplicado(null);
    setCupomCodigo("");
    setCupomErro(null);
  }

  const marcarTocado = (campo: Campo) =>
    setTocado((atual) => ({ ...atual, [campo]: true }));

  const erroNome = useMemo(
    () => (tocado.nome && !nomeValido ? "Informe o nome completo." : null),
    [tocado.nome, nomeValido],
  );
  const erroCpf = useMemo(
    () => (tocado.cpf && !cpfValido ? "CPF inválido." : null),
    [tocado.cpf, cpfValido],
  );
  const erroEmail = useMemo(
    () => (tocado.email && !emailValido ? "E-mail inválido." : null),
    [tocado.email, emailValido],
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!formularioValido) return;

    console.log("Dados do checkout:", {
      nome: nome.trim(),
      cpf: cpfDigitos,
      email: email.trim(),
      cupom: cupomValidoParaCpfAtual
        ? {
            codigo: cupomAplicado.codigo,
            percentualDesconto: cupomAplicado.percentualDesconto,
          }
        : null,
      precoOriginal: preco,
      precoFinal: precoComDesconto,
    });

    setEnviado(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="nome" className="text-sm font-medium">
          Nome completo
        </label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          onBlur={() => marcarTocado("nome")}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {erroNome && <span className="text-sm text-red-600">{erroNome}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="cpf" className="text-sm font-medium">
          CPF
        </label>
        <input
          id="cpf"
          type="text"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(event) => setCpf(formatarCPFInput(event.target.value))}
          onBlur={() => marcarTocado("cpf")}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {erroCpf && <span className="text-sm text-red-600">{erroCpf}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => marcarTocado("email")}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {erroEmail && (
          <span className="text-sm text-red-600">{erroEmail}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="cupom" className="text-sm font-medium">
          Cupom de desconto (opcional)
        </label>
        <div className="flex gap-2">
          <input
            id="cupom"
            type="text"
            value={cupomCodigo}
            onChange={(event) => {
              setCupomCodigo(event.target.value);
              if (cupomAplicado) setCupomAplicado(null);
            }}
            disabled={cupomValidoParaCpfAtual}
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 disabled:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:disabled:bg-zinc-800"
          />
          {cupomValidoParaCpfAtual ? (
            <button
              type="button"
              onClick={handleRemoverCupom}
              className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
            >
              Remover
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAplicarCupom}
              disabled={cupomValidando}
              className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
            >
              {cupomValidando ? "Validando..." : "Aplicar"}
            </button>
          )}
        </div>
        {cupomErro && <span className="text-sm text-red-600">{cupomErro}</span>}
        {cupomValidoParaCpfAtual && (
          <span className="text-sm text-green-700 dark:text-green-500">
            Cupom aplicado: {cupomAplicado.percentualDesconto}% de desconto.
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        {cupomValidoParaCpfAtual ? (
          <>
            <span className="text-sm text-zinc-500 line-through">
              {formatarPreco(preco)}
            </span>
            <span className="text-lg font-semibold">
              {formatarPreco(precoComDesconto)}
            </span>
          </>
        ) : (
          <span className="text-lg font-semibold">
            {formatarPreco(preco)}
          </span>
        )}
      </div>

      <label className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <input
          type="checkbox"
          checked={consentimento}
          onChange={(event) => setConsentimento(event.target.checked)}
          className="mt-1"
        />
        <span>{TEXTO_CONSENTIMENTO}</span>
      </label>

      <button
        type="submit"
        disabled={!formularioValido}
        className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
      >
        Continuar
      </button>

      {enviado && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Dados registrados. O pagamento será implementado nos próximos
          passos.
        </p>
      )}
    </form>
  );
}
