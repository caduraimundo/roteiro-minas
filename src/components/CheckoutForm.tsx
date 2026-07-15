"use client";

import { useMemo, useState } from "react";
import {
  formatarCPFInput,
  validarCPF,
  validarEmail,
} from "@/lib/validacao";

const TEXTO_CONSENTIMENTO =
  "Ao continuar, você concorda com os Termos de compra e a Política de reembolso. Seus dados (CPF e nome) serão utilizados para contratação do seguro de viagem do passeio.";

type Campo = "nome" | "cpf" | "email";

export function CheckoutForm() {
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

  const nomeValido = nome.trim().length >= 3;
  const cpfValido = validarCPF(cpf);
  const emailValido = validarEmail(email);
  const formularioValido = nomeValido && cpfValido && emailValido && consentimento;

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
      cpf: cpf.replace(/\D/g, ""),
      email: email.trim(),
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
