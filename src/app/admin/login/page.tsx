"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const FONTE_MENSAGEM = "roteiro-minas-admin-login";

export default function AdminLogin() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<number | null>(null);

  function pararDeEsperarPopup() {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    popupRef.current = null;
  }

  // Escuta a mensagem do pop-up (via PopupCallbackNotifier em /admin ou
  // /admin/acesso-negado) - roda em toda a vida da página de login, não só
  // durante um login em andamento, pra não perder a mensagem por causa de
  // timing entre efeitos.
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.fonte !== FONTE_MENSAGEM) return;

      pararDeEsperarPopup();
      setCarregando(false);

      if (event.data.tipo === "sucesso") {
        router.push("/admin");
        router.refresh();
      } else {
        router.push("/admin/acesso-negado");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  async function handleLogin() {
    setErro(null);
    setCarregando(true);

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

    pollRef.current = window.setInterval(() => {
      if (popup.closed) {
        // Fechado manualmente sem completar o login (nenhuma mensagem
        // chegou) - volta a página ao estado normal.
        pararDeEsperarPopup();
        setCarregando(false);
      }
    }, 500);
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
