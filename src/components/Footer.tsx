import Image from "next/image";
import Link from "next/link";
import { getConfiguracoesSite } from "@/data/configuracoes";
import { LINKS } from "@/lib/nav-links";

// Mesmo número usado em WhatsAppFloatButton.tsx, RoteiroCard.tsx e
// page.tsx - se mudar, atualizar nos 4 lugares.
const NUMERO_WHATSAPP = "553184743523";
// Confirmado com o Cadu - não existe campo de e-mail em
// configuracoes_site hoje, então fica fixo aqui até esse dado passar a
// vir do banco (mesmo caso do WhatsApp acima).
const EMAIL_CONTATO = "roteirominasgerais@gmail.com";

// Usado na Home, Termos e Política de reembolso. Só a Home tem o
// WhatsAppFloatButton, mas ele já se esconde sozinho quando o rodapé
// entra na tela (IntersectionObserver em WhatsAppFloatButton.tsx) - não
// depende de padding-bottom extra aqui pra não sobrepor.
export async function Footer() {
  const configuracoes = await getConfiguracoesSite();

  return (
    <footer className="bg-verde-mata">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-10 px-8 py-12 sm:grid-cols-3">
        <div className="flex flex-col gap-3 sm:col-span-1">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.webp"
              alt="Roteiro Minas"
              width={40}
              height={40}
              className="rounded-full border border-pedra-sabao/50"
            />
            <span className="font-wordmark text-pedra-sabao text-lg uppercase tracking-wide">
              Roteiro Minas
            </span>
          </Link>
          {/* Texto reaproveitado do badge + parágrafo do hero
              (HeroCarousel.tsx) - mesma descrição real usada lá, sem
              inventar copy nova. */}
          <p className="font-body text-pedra-sabao/70 max-w-xs text-sm leading-relaxed">
            Ecoturismo em Minas Gerais. Passeios guiados em Ouro Preto e
            Mariana, com reserva online e ingresso na hora.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-body text-pedra-sabao/50 text-xs font-bold tracking-[0.14em] uppercase">
            Navegação
          </span>
          <nav className="flex flex-col gap-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-pedra-sabao/80 hover:text-pedra-sabao text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-body text-pedra-sabao/50 text-xs font-bold tracking-[0.14em] uppercase">
            Fale com a gente
          </span>
          <div className="flex flex-col gap-2">
            <a
              href={`https://wa.me/${NUMERO_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-pedra-sabao/80 hover:text-pedra-sabao text-sm transition-colors"
            >
              Falar no WhatsApp
            </a>
            <a
              href={`mailto:${EMAIL_CONTATO}`}
              className="font-body text-pedra-sabao/80 hover:text-pedra-sabao text-sm transition-colors"
            >
              {EMAIL_CONTATO}
            </a>
          </div>
        </div>
      </div>

      <div className="border-pedra-sabao/15 border-t">
        <div className="mx-auto flex w-full max-w-5xl justify-center px-8 py-5">
          <p className="font-body text-pedra-sabao/60 text-xs">
            Cadastur {configuracoes?.cadastur_numero ?? "—"}
          </p>
        </div>
      </div>
    </footer>
  );
}
