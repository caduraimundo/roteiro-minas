"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";
import { NOME_JANELA_POPUP } from "@/lib/admin-login-constants";

const FONTE_MENSAGEM = "roteiro-minas-admin-login";
const CHAVE_RESULTADO = "roteiro-minas-admin-login-result";
const TIMEOUT_LOGIN_MS = 60000;

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

  function tratarResultado(sucesso: boolean) {
    if (resolvidoRef.current) return;
    resolvidoRef.current = true;

    pararDeEsperar();
    // Fechar a partir da janela principal (que abriu a pop-up) funciona
    // mesmo quando window.opener/postMessage de dentro da pop-up falham
    // por causa de Cross-Origin-Opener-Policy nas páginas do Google.
    popupRef.current?.close();
    popupRef.current = null;
    setCarregando(false);

    if (sucesso) {
      router.push("/admin");
      router.refresh();
    } else {
      router.push("/admin/acesso-negado");
    }
  }

  // Detecta erro do Google devolvido como fragmento (#error=access_denied...)
  // - acontece quando a conta não tem permissão no consent screen em modo
  // Testing: o Google deixa completar e nega na troca do código, o GoTrue
  // redireciona pro nosso /auth/callback com o erro só no fragmento (nunca
  // chega no servidor), nosso route.ts cai no fallback e redireciona pra cá
  // sem fragmento próprio - mas o navegador preserva o fragmento original,
  // então esta página carrega com #error=... Ninguém chega aqui com esse
  // fragmento por acaso, então a simples presença dele já identifica o
  // cenário, sem precisar inspecionar o valor exato do erro.
  useEffect(() => {
    if (!window.location.hash.includes("error=")) return;

    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );

    try {
      localStorage.setItem(
        CHAVE_RESULTADO,
        JSON.stringify({ tipo: "negado", ts: Date.now() }),
      );
    } catch {
      // localStorage indisponível - segue mesmo assim (o listener de
      // storage nesta mesma aba, se for o caso, não vai disparar, mas o
      // branch abaixo ainda trata o caso sem pop-up)
    }

    if (window.name === NOME_JANELA_POPUP) {
      window.close();
    } else {
      setErro(
        "Login negado pelo Google. Verifique se a conta usada tem permissão.",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mecanismo principal: evento `storage`, disparado pela pop-up gravando
  // o resultado em localStorage (PopupCallbackNotifier). Não depende de
  // window.opener - funciona mesmo quando o COOP do Google corta essa
  // relação durante a navegação.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== CHAVE_RESULTADO || !event.newValue) return;

      try {
        const resultado = JSON.parse(event.newValue) as { tipo?: string };
        tratarResultado(resultado.tipo === "sucesso");
      } catch {
        // valor inesperado - ignora
      } finally {
        try {
          localStorage.removeItem(CHAVE_RESULTADO);
        } catch {
          // ignora
        }
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Caminho extra sem custo: mensagem direta da pop-up, quando
  // window.opener sobrevive à navegação. Não é o mecanismo principal.
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.fonte !== FONTE_MENSAGEM) return;

      tratarResultado(event.data.tipo === "sucesso");
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
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
      // sessão como mecanismo de sucesso)
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

    // Segunda camada, além do storage: confere a sessão diretamente, e
    // detecta fechamento manual da pop-up sem completar o login.
    pollRef.current = window.setInterval(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email && ADMIN_ALLOWLIST.includes(user.email)) {
        tratarResultado(true);
        return;
      }

      if (popup.closed) {
        resolvidoRef.current = true;
        pararDeEsperar();
        popupRef.current = null;
        setCarregando(false);
      }
    }, 800);

    // Timeout de segurança: se nada resolver o login em 60s (nem storage,
    // nem sessão detectada, nem pop-up fechada), não deixa a pessoa presa
    // em "Aguardando login..." pra sempre.
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
