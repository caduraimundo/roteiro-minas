"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  apenasDigitos,
  formatarCPFInput,
  formatarTelefoneInput,
  validarCEP,
  validarCPF,
  validarDataNascimento,
  validarEmail,
  validarTelefone,
  validarUF,
} from "@/lib/validacao";
import { formatarPreco } from "@/lib/format";
import { tokenizarCartao } from "@/lib/pagarmeClient";

// Duplicado de src/lib/pagarme.ts de propósito: aquele módulo usa Buffer
// (Node-only) e não deve ser importado em código client-side.
const TAXA_PLATAFORMA_PERCENTUAL = 6;

type Campo =
  | "nome"
  | "cpf"
  | "email"
  | "telefone"
  | "dataNascimento"
  | "cep"
  | "rua"
  | "numero"
  | "bairro"
  | "cidade"
  | "uf";
type FormaPagamento = "pix" | "cartao_avista" | "cartao_parcelado";

type CupomAplicado = {
  codigo: string;
  cpf: string;
  percentualDesconto: number;
};

type Resultado =
  | {
      tipo: "pix";
      qrCode: string | null;
      qrCodeUrl: string | null;
      expiresAt: string | null;
    }
  | { tipo: "cartao_sucesso" }
  | { tipo: "erro"; motivo: string };

export function CheckoutForm({
  roteiroId,
  vagaId,
  preco,
}: {
  roteiroId: string;
  vagaId: string;
  preco: number;
}) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirmacao, setEmailConfirmacao] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [tocado, setTocado] = useState<Record<Campo, boolean>>({
    nome: false,
    cpf: false,
    email: false,
    telefone: false,
    dataNascimento: false,
    cep: false,
    rua: false,
    numero: false,
    bairro: false,
    cidade: false,
    uf: false,
  });

  const [cupomCodigo, setCupomCodigo] = useState("");
  const [cupomValidando, setCupomValidando] = useState(false);
  const [cupomErro, setCupomErro] = useState<string | null>(null);
  const [cupomAplicado, setCupomAplicado] = useState<CupomAplicado | null>(
    null,
  );

  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");
  const [parcelas, setParcelas] = useState(2);
  const [numeroCartao, setNumeroCartao] = useState("");
  const [nomeCartao, setNomeCartao] = useState("");
  const [validadeCartao, setValidadeCartao] = useState("");
  const [cvv, setCvv] = useState("");

  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const nomeValido = nome.trim().length >= 3;
  const cpfValido = validarCPF(cpf);
  const emailValido = validarEmail(email);
  const telefoneValido = validarTelefone(telefone);

  // Mesma exigência do backend (POST /api/checkout/pagar) - complemento
  // continua sempre opcional, os outros 7 são obrigatórios aqui também,
  // reusando os validadores de validacao.ts em vez de duplicar a lógica.
  const dataNascimentoValida = validarDataNascimento(dataNascimento);
  const cepValido = validarCEP(cep);
  const ruaValida = rua.trim().length > 0;
  const numeroValido = numero.trim().length > 0;
  const bairroValido = bairro.trim().length > 0;
  const cidadeValida = cidade.trim().length > 0;
  const ufValido = validarUF(uf);

  // Comparação só pra pegar erro de digitação - mesmo trim/lowercase que
  // já seria aplicado no e-mail original no submit, sem sanitização extra.
  const emailsIguais =
    email.trim().toLowerCase() === emailConfirmacao.trim().toLowerCase();
  const emailConfirmadoValido =
    emailConfirmacao.trim().length > 0 && emailsIguais;

  const cpfDigitos = apenasDigitos(cpf);
  const cupomValidoParaCpfAtual =
    cupomAplicado !== null && cupomAplicado.cpf === cpfDigitos;

  const precoComDesconto = cupomValidoParaCpfAtual
    ? preco - (preco * cupomAplicado.percentualDesconto) / 100
    : preco;
  const taxa = (precoComDesconto * TAXA_PLATAFORMA_PERCENTUAL) / 100;
  const valorFinal = precoComDesconto + taxa;

  const ehCartao = formaPagamento !== "pix";
  const [mesValidade, anoValidade] = validadeCartao.split("/");
  const cartaoValido =
    !ehCartao ||
    (apenasDigitos(numeroCartao).length >= 13 &&
      nomeCartao.trim().length >= 3 &&
      /^\d{2}$/.test(mesValidade ?? "") &&
      /^\d{2}$/.test(anoValidade ?? "") &&
      /^\d{3,4}$/.test(cvv));

  const formularioValido =
    nomeValido &&
    cpfValido &&
    emailValido &&
    emailConfirmadoValido &&
    telefoneValido &&
    dataNascimentoValida &&
    cepValido &&
    ruaValida &&
    numeroValido &&
    bairroValido &&
    cidadeValida &&
    ufValido &&
    consentimento &&
    cartaoValido;

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
  const erroEmailConfirmacao = useMemo(
    () =>
      emailConfirmacao.length > 0 && !emailsIguais
        ? "Os e-mails não são iguais."
        : null,
    [emailConfirmacao, emailsIguais],
  );
  const erroTelefone = useMemo(
    () =>
      tocado.telefone && !telefoneValido ? "Telefone inválido." : null,
    [tocado.telefone, telefoneValido],
  );
  const erroDataNascimento = useMemo(
    () =>
      tocado.dataNascimento && !dataNascimentoValida
        ? "Data de nascimento inválida."
        : null,
    [tocado.dataNascimento, dataNascimentoValida],
  );
  const erroCep = useMemo(
    () => (tocado.cep && !cepValido ? "CEP inválido." : null),
    [tocado.cep, cepValido],
  );
  const erroRua = useMemo(
    () => (tocado.rua && !ruaValida ? "Informe a rua." : null),
    [tocado.rua, ruaValida],
  );
  const erroNumero = useMemo(
    () => (tocado.numero && !numeroValido ? "Informe o número." : null),
    [tocado.numero, numeroValido],
  );
  const erroBairro = useMemo(
    () => (tocado.bairro && !bairroValido ? "Informe o bairro." : null),
    [tocado.bairro, bairroValido],
  );
  const erroCidade = useMemo(
    () => (tocado.cidade && !cidadeValida ? "Informe a cidade." : null),
    [tocado.cidade, cidadeValida],
  );
  const erroUf = useMemo(
    () => (tocado.uf && !ufValido ? "UF inválida." : null),
    [tocado.uf, ufValido],
  );

  async function realizarPagamento() {
    if (processando) return;

    setProcessando(true);
    setResultado(null);

    try {
      let cardToken: string | undefined;

      if (ehCartao) {
        cardToken = await tokenizarCartao({
          numero: numeroCartao,
          nomeImpresso: nomeCartao,
          mes: mesValidade,
          ano: anoValidade,
          cvv,
          documento: cpfDigitos,
        });
      }

      const resposta = await fetch("/api/checkout/pagar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          cpf: cpfDigitos,
          email: email.trim(),
          telefone: apenasDigitos(telefone),
          vagaId,
          cupomCodigo: cupomValidoParaCpfAtual ? cupomAplicado.codigo : "",
          formaPagamento,
          parcelas: formaPagamento === "cartao_parcelado" ? parcelas : 1,
          cardToken,
          dataNascimento,
          cep: apenasDigitos(cep),
          rua: rua.trim(),
          numero: numero.trim(),
          complemento: complemento.trim(),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          uf: uf.trim().toUpperCase(),
        }),
      });

      const dados = await resposta.json();

      if (!dados.sucesso) {
        setResultado({
          tipo: "erro",
          motivo: dados.motivo ?? "Não foi possível concluir o pagamento.",
        });
        return;
      }

      if (dados.formaPagamento === "pix") {
        setResultado({
          tipo: "pix",
          qrCode: dados.qrCode,
          qrCodeUrl: dados.qrCodeUrl,
          expiresAt: dados.expiresAt,
        });
      } else {
        setResultado({ tipo: "cartao_sucesso" });
      }
    } catch (erro) {
      setResultado({
        tipo: "erro",
        motivo:
          erro instanceof Error
            ? erro.message
            : "Não foi possível concluir o pagamento.",
      });
    } finally {
      setProcessando(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!formularioValido) return;

    await realizarPagamento();
  }

  if (resultado?.tipo === "pix") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-zinc-200 p-6 text-center dark:border-zinc-800">
        <h2 className="font-semibold">Pague com Pix pra confirmar</h2>
        {resultado.qrCodeUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resultado.qrCodeUrl}
            alt="QR Code Pix"
            className="h-56 w-56"
          />
        )}
        {resultado.qrCode && (
          <div className="flex w-full flex-col gap-1">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Ou copie o código:
            </span>
            <textarea
              readOnly
              value={resultado.qrCode}
              className="w-full resize-none rounded-lg border border-zinc-300 p-2 text-xs dark:border-zinc-700 dark:bg-zinc-900"
              rows={4}
            />
          </div>
        )}
        {resultado.expiresAt && (
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Esse QR Code expira às{" "}
            {new Date(resultado.expiresAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            .
          </p>
        )}
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          A confirmação do pagamento acontece automaticamente após o Pix cair.
        </p>
        <button
          type="button"
          onClick={realizarPagamento}
          disabled={processando}
          className="text-sm font-medium underline disabled:opacity-50"
        >
          {processando ? "Gerando..." : "Gerar novo QR Code"}
        </button>
      </div>
    );
  }

  if (resultado?.tipo === "cartao_sucesso") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 p-6 text-center dark:border-zinc-800">
        <h2 className="font-semibold">Pagamento aprovado!</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Você vai receber o ticket por e-mail em breve.
        </p>
      </div>
    );
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
        <label htmlFor="emailConfirmacao" className="text-sm font-medium">
          Confirme seu e-mail
        </label>
        <input
          id="emailConfirmacao"
          type="email"
          value={emailConfirmacao}
          onChange={(event) => setEmailConfirmacao(event.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {erroEmailConfirmacao && (
          <span className="text-sm text-red-600">{erroEmailConfirmacao}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="telefone" className="text-sm font-medium">
          Telefone
        </label>
        <input
          id="telefone"
          type="tel"
          inputMode="numeric"
          placeholder="(00) 00000-0000"
          value={telefone}
          onChange={(event) =>
            setTelefone(formatarTelefoneInput(event.target.value))
          }
          onBlur={() => marcarTocado("telefone")}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {erroTelefone && (
          <span className="text-sm text-red-600">{erroTelefone}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="dataNascimento" className="text-sm font-medium">
          Data de nascimento
        </label>
        <input
          id="dataNascimento"
          type="date"
          value={dataNascimento}
          onChange={(event) => setDataNascimento(event.target.value)}
          onBlur={() => marcarTocado("dataNascimento")}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {erroDataNascimento && (
          <span className="text-sm text-red-600">{erroDataNascimento}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="cep" className="text-sm font-medium">
          CEP
        </label>
        <input
          id="cep"
          type="text"
          inputMode="numeric"
          placeholder="00000-000"
          value={cep}
          onChange={(event) => setCep(event.target.value)}
          onBlur={() => marcarTocado("cep")}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {erroCep && <span className="text-sm text-red-600">{erroCep}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="rua" className="text-sm font-medium">
          Rua
        </label>
        <input
          id="rua"
          type="text"
          value={rua}
          onChange={(event) => setRua(event.target.value)}
          onBlur={() => marcarTocado("rua")}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {erroRua && <span className="text-sm text-red-600">{erroRua}</span>}
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="numero" className="text-sm font-medium">
            Número
          </label>
          <input
            id="numero"
            type="text"
            value={numero}
            onChange={(event) => setNumero(event.target.value)}
            onBlur={() => marcarTocado("numero")}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {erroNumero && (
            <span className="text-sm text-red-600">{erroNumero}</span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="complemento" className="text-sm font-medium">
            Complemento (opcional)
          </label>
          <input
            id="complemento"
            type="text"
            value={complemento}
            onChange={(event) => setComplemento(event.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="bairro" className="text-sm font-medium">
          Bairro
        </label>
        <input
          id="bairro"
          type="text"
          value={bairro}
          onChange={(event) => setBairro(event.target.value)}
          onBlur={() => marcarTocado("bairro")}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {erroBairro && (
          <span className="text-sm text-red-600">{erroBairro}</span>
        )}
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="cidade" className="text-sm font-medium">
            Cidade
          </label>
          <input
            id="cidade"
            type="text"
            value={cidade}
            onChange={(event) => setCidade(event.target.value)}
            onBlur={() => marcarTocado("cidade")}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {erroCidade && (
            <span className="text-sm text-red-600">{erroCidade}</span>
          )}
        </div>

        <div className="flex w-24 flex-col gap-1">
          <label htmlFor="uf" className="text-sm font-medium">
            UF
          </label>
          <input
            id="uf"
            type="text"
            maxLength={2}
            value={uf}
            onChange={(event) => setUf(event.target.value.toUpperCase())}
            onBlur={() => marcarTocado("uf")}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {erroUf && <span className="text-sm text-red-600">{erroUf}</span>}
        </div>
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

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Forma de pagamento</span>
        <div className="flex flex-col gap-2">
          {(
            [
              { valor: "pix", rotulo: "Pix" },
              { valor: "cartao_avista", rotulo: "Cartão à vista" },
              { valor: "cartao_parcelado", rotulo: "Cartão parcelado" },
            ] as const
          ).map((opcao) => (
            <label
              key={opcao.valor}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="formaPagamento"
                value={opcao.valor}
                checked={formaPagamento === opcao.valor}
                onChange={() => setFormaPagamento(opcao.valor)}
              />
              {opcao.rotulo}
            </label>
          ))}
        </div>

        {formaPagamento === "cartao_parcelado" && (
          <select
            value={parcelas}
            onChange={(event) => setParcelas(Number(event.target.value))}
            className="mt-1 w-fit rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            {[2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}x
              </option>
            ))}
          </select>
        )}
      </div>

      {ehCartao && (
        <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex flex-col gap-1">
            <label htmlFor="numeroCartao" className="text-sm font-medium">
              Número do cartão
            </label>
            <input
              id="numeroCartao"
              type="text"
              inputMode="numeric"
              value={numeroCartao}
              onChange={(event) => setNumeroCartao(event.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="nomeCartao" className="text-sm font-medium">
              Nome impresso no cartão
            </label>
            <input
              id="nomeCartao"
              type="text"
              value={nomeCartao}
              onChange={(event) => setNomeCartao(event.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="validade" className="text-sm font-medium">
                Validade (MM/AA)
              </label>
              <input
                id="validade"
                type="text"
                placeholder="MM/AA"
                value={validadeCartao}
                onChange={(event) => setValidadeCartao(event.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div className="flex w-24 flex-col gap-1">
              <label htmlFor="cvv" className="text-sm font-medium">
                CVV
              </label>
              <input
                id="cvv"
                type="text"
                inputMode="numeric"
                value={cvv}
                onChange={(event) => setCvv(event.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        {cupomValidoParaCpfAtual && (
          <span className="text-sm text-zinc-500 line-through">
            {formatarPreco(preco + (preco * TAXA_PLATAFORMA_PERCENTUAL) / 100)}
          </span>
        )}
        <span className="text-lg font-semibold">
          {formatarPreco(valorFinal)}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-500">
          Roteiro {formatarPreco(precoComDesconto)} + taxa (
          {TAXA_PLATAFORMA_PERCENTUAL}%) {formatarPreco(taxa)}
        </span>
      </div>

      <label className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <input
          type="checkbox"
          checked={consentimento}
          onChange={(event) => setConsentimento(event.target.checked)}
          className="mt-1"
        />
        <span>
          Ao continuar, você concorda com os{" "}
          {/* stopPropagation: um <a> dentro de <label> também aciona o
              checkbox ao clicar (comportamento nativo do HTML) - sem
              isso, abrir o link marcaria/desmarcaria o consentimento
              sem querer, no meio de uma compra em andamento. */}
          <Link
            href="/termos"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="underline"
          >
            Termos de compra
          </Link>{" "}
          e a{" "}
          <Link
            href="/politica-de-reembolso"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="underline"
          >
            Política de reembolso
          </Link>
          . Seus dados (CPF e nome) serão utilizados para contratação do
          seguro de viagem do passeio.
        </span>
      </label>

      {resultado?.tipo === "erro" && (
        <p className="text-sm text-red-600">{resultado.motivo}</p>
      )}

      <button
        type="submit"
        disabled={!formularioValido || processando}
        className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
      >
        {processando ? "Processando..." : "Continuar"}
      </button>
    </form>
  );
}
