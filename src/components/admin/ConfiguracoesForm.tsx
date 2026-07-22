"use client";

import { useEffect, useState } from "react";

type Configuracoes = {
  cadastur_numero: string | null;
  stats_seguidores_instagram: string | null;
  stats_roteiros_realizados: string | null;
  stats_avaliacao_media: string | null;
  cancelamento_texto: string | null;
};

const campoClasse =
  "rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700";

export function ConfiguracoesForm() {
  const [cadasturNumero, setCadasturNumero] = useState("");
  const [statsSeguidoresInstagram, setStatsSeguidoresInstagram] =
    useState("");
  const [statsRoteirosRealizados, setStatsRoteirosRealizados] = useState("");
  const [statsAvaliacaoMedia, setStatsAvaliacaoMedia] = useState("");
  const [cancelamentoTexto, setCancelamentoTexto] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Mesmo padrão já usado em outras telas do admin: troca de estado só
  // dentro do .then/.finally, nunca direto no corpo síncrono do effect.
  useEffect(() => {
    let cancelado = false;

    fetch("/api/configuracoes")
      .then(async (resposta) => {
        const corpo = await resposta.json().catch(() => null);
        if (cancelado) return;

        if (!resposta.ok || !corpo?.configuracoes) {
          setErro(corpo?.erro ?? "Erro ao carregar configurações.");
          return;
        }

        const dados = corpo.configuracoes as Configuracoes;
        setCadasturNumero(dados.cadastur_numero ?? "");
        setStatsSeguidoresInstagram(dados.stats_seguidores_instagram ?? "");
        setStatsRoteirosRealizados(dados.stats_roteiros_realizados ?? "");
        setStatsAvaliacaoMedia(dados.stats_avaliacao_media ?? "");
        setCancelamentoTexto(dados.cancelamento_texto ?? "");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSucesso(false);
    setEnviando(true);

    const resposta = await fetch("/api/admin/configuracoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cadastur_numero: cadasturNumero || null,
        stats_seguidores_instagram: statsSeguidoresInstagram || null,
        stats_roteiros_realizados: statsRoteirosRealizados || null,
        stats_avaliacao_media: statsAvaliacaoMedia || null,
        cancelamento_texto: cancelamentoTexto || null,
      }),
    });

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      setErro(corpo?.erro ?? "Erro ao salvar configurações.");
      setEnviando(false);
      return;
    }

    setEnviando(false);
    setSucesso(true);
  }

  if (carregando) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400">Carregando...</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Número do Cadastur
        <input
          type="text"
          value={cadasturNumero}
          onChange={(evento) => setCadasturNumero(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Seguidores no Instagram
        <input
          type="text"
          value={statsSeguidoresInstagram}
          onChange={(evento) =>
            setStatsSeguidoresInstagram(evento.target.value)
          }
          className={campoClasse}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Roteiros realizados
        <input
          type="text"
          value={statsRoteirosRealizados}
          onChange={(evento) =>
            setStatsRoteirosRealizados(evento.target.value)
          }
          className={campoClasse}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Avaliação média
        <input
          type="text"
          value={statsAvaliacaoMedia}
          onChange={(evento) => setStatsAvaliacaoMedia(evento.target.value)}
          className={campoClasse}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Texto de política de cancelamento
        <textarea
          value={cancelamentoTexto}
          onChange={(evento) => setCancelamentoTexto(evento.target.value)}
          rows={4}
          className={campoClasse}
        />
      </label>

      {erro && <p className="text-sm text-red-600">{erro}</p>}
      {sucesso && (
        <p className="text-sm text-green-700 dark:text-green-500">
          Configurações salvas.
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {enviando ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
