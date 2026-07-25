"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatarPreco } from "@/lib/format";

const campoClasse =
  "font-body text-terracota rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-verde-mata";
const labelClasse =
  "font-body text-terracota flex flex-col gap-1 text-sm font-medium";

type Resultado = {
  vendaId: string;
  taxaDevida: number | null;
  ticketEnviado: boolean;
};

export function VendaManualForm({
  vagaId,
  vagasDisponiveis,
}: {
  vagaId: string;
  vagasDisponiveis: number;
}) {
  const router = useRouter();
  const [compradorNome, setCompradorNome] = useState("");
  const [compradorCpf, setCompradorCpf] = useState("");
  const [compradorEmail, setCompradorEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const esgotada = vagasDisponiveis === 0;

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setResultado(null);
    setEnviando(true);

    const resposta = await fetch("/api/admin/vendas/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vaga_id: vagaId,
        comprador_nome: compradorNome,
        comprador_cpf: compradorCpf,
        comprador_email: compradorEmail,
        data_nascimento: dataNascimento,
        cep,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
      }),
    });

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      setErro(corpo?.erro ?? "Erro ao registrar venda manual.");
      setEnviando(false);
      return;
    }

    setResultado({
      vendaId: corpo.venda_id,
      taxaDevida: corpo.taxa_devida,
      ticketEnviado: corpo.ticket_enviado,
    });
    setCompradorNome("");
    setCompradorCpf("");
    setCompradorEmail("");
    setDataNascimento("");
    setCep("");
    setRua("");
    setNumero("");
    setComplemento("");
    setBairro("");
    setCidade("");
    setUf("");
    setEnviando(false);
    router.refresh();
  }

  if (esgotada) {
    return (
      <div className="bg-pedra-sabao flex flex-col gap-2 rounded-2xl p-6">
        <h2 className="font-display text-terracota text-lg font-bold">
          Venda manual
        </h2>
        <p className="font-body text-terracota/60 text-sm">Vaga esgotada.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-pedra-sabao flex flex-col gap-4 rounded-2xl p-6"
    >
      <h2 className="font-display text-terracota text-lg font-bold">
        Venda manual
      </h2>

      <label className={labelClasse}>
        Nome do comprador
        <input
          type="text"
          required
          value={compradorNome}
          onChange={(evento) => setCompradorNome(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <label className={labelClasse}>
        CPF do comprador
        <input
          type="text"
          required
          value={compradorCpf}
          onChange={(evento) => setCompradorCpf(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <label className={labelClasse}>
        E-mail do comprador
        <input
          type="text"
          required
          value={compradorEmail}
          onChange={(evento) => setCompradorEmail(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <label className={labelClasse}>
        Data de nascimento
        <input
          type="date"
          required
          value={dataNascimento}
          onChange={(evento) => setDataNascimento(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <label className={labelClasse}>
        CEP
        <input
          type="text"
          required
          value={cep}
          onChange={(evento) => setCep(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <label className={labelClasse}>
        Rua
        <input
          type="text"
          required
          value={rua}
          onChange={(evento) => setRua(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <div className="flex gap-3">
        <label className={`flex-1 ${labelClasse}`}>
          Número
          <input
            type="text"
            required
            value={numero}
            onChange={(evento) => setNumero(evento.target.value)}
            className={campoClasse}
          />
        </label>

        <label className={`flex-1 ${labelClasse}`}>
          Complemento (opcional)
          <input
            type="text"
            value={complemento}
            onChange={(evento) => setComplemento(evento.target.value)}
            className={campoClasse}
          />
        </label>
      </div>

      <label className={labelClasse}>
        Bairro
        <input
          type="text"
          required
          value={bairro}
          onChange={(evento) => setBairro(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <div className="flex gap-3">
        <label className={`flex-1 ${labelClasse}`}>
          Cidade
          <input
            type="text"
            required
            value={cidade}
            onChange={(evento) => setCidade(evento.target.value)}
            className={campoClasse}
          />
        </label>

        <label className={`w-24 ${labelClasse}`}>
          UF
          <input
            type="text"
            required
            maxLength={2}
            value={uf}
            onChange={(evento) => setUf(evento.target.value.toUpperCase())}
            className={campoClasse}
          />
        </label>
      </div>

      {erro && <p className="font-body text-sm text-red-600">{erro}</p>}

      {resultado && (
        <div className="bg-verde-mata/10 flex flex-col gap-1 rounded-xl p-4 text-sm">
          <p className="font-body text-verde-mata font-semibold">
            Venda registrada (id: {resultado.vendaId}).
          </p>
          {resultado.taxaDevida !== null && (
            <p className="font-body text-terracota/70">
              Taxa devida: {formatarPreco(resultado.taxaDevida)}
            </p>
          )}
          {resultado.ticketEnviado ? (
            <p className="font-body text-terracota/70">
              Ticket enviado por e-mail.
            </p>
          ) : (
            <p className="font-body text-terracota/70">
              Ticket não pôde ser enviado por e-mail automaticamente -
              reenvie manualmente depois.
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="font-body bg-verde-mata text-pedra-sabao self-start rounded-2xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {enviando ? "Registrando..." : "Registrar venda"}
      </button>
    </form>
  );
}
