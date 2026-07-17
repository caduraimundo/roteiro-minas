import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Necessário pro login em pop-up do admin (Google OAuth): sem
        // isso, o navegador corta a relação window.opener entre a pop-up
        // e a janela principal ao navegar pela tela do Google, e o
        // postMessage de volta (PopupCallbackNotifier) falha
        // silenciosamente - a janela principal fica esperando pra sempre.
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
