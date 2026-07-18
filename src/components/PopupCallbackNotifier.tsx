"use client";

import { useEffect } from "react";
import { NOME_JANELA_POPUP } from "@/lib/admin-login-constants";

const CHAVE_RESULTADO = "roteiro-minas-admin-login-result";
const FONTE_MENSAGEM = "roteiro-minas-admin-login";

/**
 * Renderizado em /admin e /admin/acesso-negado. Detecta se é a pop-up de
 * login via `window.name` (setado em window.open na página de login) -
 * NÃO via `window.opener`, que o Cross-Origin-Opener-Policy do Google
 * pode cortar durante a navegação (diferente de window.opener,
 * window.name sobrevive a navegação cross-origin e não é afetado por
 * COOP).
 *
 * Importante: /admin e /admin/acesso-negado também são alcançadas fora da
 * pop-up (sucesso via polling na janela principal, fallback de pop-up
 * bloqueada, acesso direto) - por isso a checagem de window.name continua
 * necessária, não dá pra sempre fechar a janela incondicionalmente.
 */
export function PopupCallbackNotifier({
  tipo,
}: {
  tipo: "sucesso" | "negado";
}) {
  const ehPopup = typeof window !== "undefined" && window.name === NOME_JANELA_POPUP;

  useEffect(() => {
    if (!ehPopup) return;

    // Mecanismo principal: localStorage + evento `storage`, não depende
    // de window.opener.
    try {
      localStorage.setItem(
        CHAVE_RESULTADO,
        JSON.stringify({ tipo, ts: Date.now() }),
      );
    } catch {
      // localStorage indisponível (raro) - segue só com postMessage/close.
    }

    // Tentativa extra sem custo, caso window.opener tenha sobrevivido.
    if (window.opener) {
      try {
        window.opener.postMessage(
          { fonte: FONTE_MENSAGEM, tipo },
          window.location.origin,
        );
      } catch {
        // ignora - localStorage já é o mecanismo principal
      }
    }

    window.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

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
