"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";

const FONTE_MENSAGEM = "roteiro-minas-admin-login";

export default function AdminLogin() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<number | null>(null);
  const resolvidoRef = useRef(false);

  function pararDeEsperarPopup() {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function tratarResultado(sucesso: boolean) {
    if (resolvidoRef.current) return;
    resolvidoRef.current = true;

    pararDeEsperarPopup();
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

  // Caminho rápido: mensagem da pop-up (via PopupCallbackNotifier), quando
  // window.opener sobrevive à navegação pela tela do Google.
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

    const popup = window.open(data.url, "google-login", "width=500,height=650");

    if (!popup) {
      // Pop-up bloqueado pelo navegador - cai automaticamente pro fluxo de
      // redirect de página inteira, mesma URL já obtida.
      window.location.href = data.url;
      return;
    }

    popupRef.current = popup;

    // Caminho robusto (não depende de window.opener/postMessage
    // funcionarem dentro da pop-up, que o Cross-Origin-Opener-Policy do
    // Google pode quebrar em alguns navegadores): confere a sessão
    // diretamente, e detecta fechamento manual sem login.
    pollRef.current = window.setInterval(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email && ADMIN_ALLOWLIST.includes(user.email)) {
        tratarResultado(true);
        return;
      }

      if (popup.closed) {
        pararDeEsperarPopup();
        popupRef.current = null;
        setCarregando(false);
      }
    }, 800);
  }

  useEffect(() => {
    return () => pararDeEsperarPopup();
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
