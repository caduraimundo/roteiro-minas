"use client";

import { useEffect, useState } from "react";

const FONTE_MENSAGEM = "roteiro-minas-admin-login";

/**
 * Renderizado em /admin e /admin/acesso-negado. Só age quando a página
 * está dentro do pop-up de login (window.opener não nulo) - avisa a
 * janela principal do resultado e se fecha sozinho. Acesso direto (sem
 * pop-up) não é afetado, não renderiza nada.
 */
export function PopupCallbackNotifier({
  tipo,
}: {
  tipo: "sucesso" | "negado";
}) {
  const [ehPopup, setEhPopup] = useState(false);

  useEffect(() => {
    if (!window.opener) return;

    setEhPopup(true);

    window.opener.postMessage(
      { fonte: FONTE_MENSAGEM, tipo },
      window.location.origin,
    );

    window.close();
  }, [tipo]);

  if (!ehPopup) return null;

  return (
    <p className="text-sm text-zinc-500 dark:text-zinc-500">
      Você pode fechar esta janela.
    </p>
  );
}
