"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { NOME_JANELA_POPUP } from "@/lib/admin-login-constants";

const CHAVE_RESULTADO = "roteiro-minas-admin-login-result";
const TIMEOUT_LOGIN_MS = 8000;
const INTERVALO_POLL_MS = 1000;

export default function AdminLogin() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const resolvidoRef = useRef(false);

  function pararDeEsperar() {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  // Único ponto de decisão de autorização: roda na janela principal, com
  // a sessão já criada (cookies compartilhados entre pop-up e janela
  // principal, mesma origem) - não depende de nada que a pop-up precise
  // saber sobre si mesma. window.opener, window.name e popup.closed já
  // se provaram frágeis nesta sessão por causa do Cross-Origin-Opener-
  // -Policy que o Google aplica durante o fluxo OAuth. Mesmo padrão do
  // Roleon: a pop-up nunca decide sucesso/negado, só sinaliza "terminei".
  async function verificarSessaoEDecidir() {
    if (resolvidoRef.current) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return; // login ainda não completou

    resolvidoRef.current = true;
    pararDeEsperar();
    popupRef.current?.close();
    popupRef.current = null;
    setCarregando(false);

    if (user.email && ADMIN_ALLOWLIST.includes(user.email)) {
      router.push("/admin");
      router.refresh();
      return;
    }

    // Segunda camada de defesa: e-mail fora da allowlist não fica com
    // sessão viva (proxy.ts e require-admin.ts também checam isso de
    // forma independente - essa checagem aqui é só pra decidir a
    // navegação da janela principal).
    await supabase.auth.signOut();
    router.push("/admin/acesso-negado");
  }

  // Detecta erro do Google devolvido como fragmento (#error=access_denied...)
  // - acontece quando a conta não tem permissão no consent screen em modo
  // Testing: o Google deixa completar e nega na troca do código, e o
  // GoTrue nunca chega a criar sessão. Caso raro, mitigado pelo botão
  // manual "Fechar janela" na pop-up se o auto-close falhar.
  useEffect(() => {
    if (!window.location.hash.includes("error=")) return;

    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );

    if (window.name === NOME_JANELA_POPUP) {
      window.close();
    } else {
      setErro(
        "Login negado pelo Google. Verifique se a conta usada tem permissão.",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mecanismo de wake-up: evento `storage`, disparado pela pop-up
  // (PopupCallbackNotifier) ao terminar - não carrega mais sucesso/negado,
  // só "terminei"; a decisão acontece em verificarSessaoEDecidir.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== CHAVE_RESULTADO || !event.newValue) return;

      try {
        localStorage.removeItem(CHAVE_RESULTADO);
      } catch {
        // ignora
      }

      verificarSessaoEDecidir();
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function handleLogin() {
    setErro(null);
    setCarregando(true);
    resolvidoRef.current = false;

    // Limpa resultado de uma tentativa anterior - evita disparo de evento
    // `storage` obsoleto nesta nova tentativa.
    try {
      localStorage.removeItem(CHAVE_RESULTADO);
    } catch {
      // localStorage indisponível - segue mesmo assim (sobra o polling de
      // sessão como mecanismo)
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data?.url) {
      setErro("Não foi possível iniciar o login. Tente novamente.");
      setCarregando(false);
      return;
    }

    const popup = window.open(
      data.url,
      NOME_JANELA_POPUP,
      "width=500,height=650",
    );

    if (!popup) {
      // Pop-up bloqueada pelo navegador - cai automaticamente pro fluxo de
      // redirect de página inteira, mesma URL já obtida.
      window.location.href = data.url;
      return;
    }

    popupRef.current = popup;

    // Segunda camada, além do storage: confere a sessão periodicamente.
    // Não usa popup.closed nem popup.location.href - ambos já se
    // provaram não confiáveis (há relatos documentados de popup.closed
    // retornar true falso por causa do COOP do Google no meio do fluxo).
    pollRef.current = window.setInterval(
      verificarSessaoEDecidir,
      INTERVALO_POLL_MS,
    );

    // Timeout de segurança: se nada resolver o login rápido, não deixa a
    // pessoa presa em "Aguardando login..." por muito tempo.
    timeoutRef.current = window.setTimeout(() => {
      if (resolvidoRef.current) return;
      resolvidoRef.current = true;

      pararDeEsperar();
      popupRef.current?.close();
      popupRef.current = null;
      setCarregando(false);
      setErro("Não foi possível confirmar o login. Tente novamente.");
    }, TIMEOUT_LOGIN_MS);
  }

  useEffect(() => {
    return () => pararDeEsperar();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-xl font-semibold">Painel Admin</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Acesso restrito. Entre com a conta Google autorizada.
      </p>

      <button
        type="button"
        onClick={handleLogin}
        disabled={carregando}
        className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background disabled:opacity-50"
      >
        {carregando ? "Aguardando login..." : "Entrar com Google"}
      </button>

      {erro && <p className="text-sm text-red-600">{erro}</p>}
    </div>
  );
}
