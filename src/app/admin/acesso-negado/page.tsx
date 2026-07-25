import Link from "next/link";
import { PopupCallbackNotifier } from "@/components/PopupCallbackNotifier";

export default function AcessoNegado() {
  return (
    <div className="bg-pedra-sabao flex min-h-dvh w-full items-center justify-center p-4">
      <div className="bg-ocre mx-auto flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl p-8 text-center">
        <PopupCallbackNotifier />
        <h1 className="font-display text-terracota text-2xl font-extrabold tracking-tight">
          Acesso negado
        </h1>
        <p className="font-body text-terracota/60 text-sm">
          Essa conta não tem permissão para acessar o painel admin.
        </p>
        <Link
          href="/admin/login"
          className="font-body text-verde-mata text-sm font-semibold underline"
        >
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
