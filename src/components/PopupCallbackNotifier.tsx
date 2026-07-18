"use client";

import { useEffect } from "react";
import { NOME_JANELA_POPUP } from "@/lib/admin-login-constants";

const CHAVE_RESULTADO = "roteiro-minas-admin-login-result";

/**
 * Renderizado em /admin e /admin/acesso-negado. Só avisa "terminei" pra
 * janela principal (via localStorage) e se fecha - não decide mais
 * sucesso/negado (padrão do Roleon: a pop-up nunca decide nada, a
 * autorização é checada na janela principal, com a sessão já criada).
 *
 * Detecta se é a pop-up via `window.name` (setado em window.open na
 * página de login) - não via `window.opener`, que o
 * Cross-Origin-Opener-Policy do Google pode cortar durante a navegação.
 *
 * Importante: /admin e /admin/acesso-negado também são alcançadas fora da
 * pop-up (decisão da janela principal, fallback de pop-up bloqueada,
 * acesso direto) - por isso a checagem de window.name continua
 * necessária, não dá pra sempre fechar a janela incondicionalmente.
 */
export function PopupCallbackNotifier() {
  const ehPopup =
    typeof window !== "undefined" && window.name === NOME_JANELA_POPUP;

  useEffect(() => {
    if (!ehPopup) return;

    try {
      localStorage.setItem(CHAVE_RESULTADO, String(Date.now()));
    } catch {
      // localStorage indisponível (raro) - segue só com close.
    }

    window.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ehPopup) return null;

  return (
    <p className="text-sm text-zinc-500 dark:text-zinc-500">
      Você pode fechar esta janela.{" "}
      <button
        type="button"
        onClick={() => window.close()}
        className="font-medium underline"
      >
        Fechar janela
      </button>
    </p>
  );
}
