import Link from "next/link";

export default function AcessoNegado() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold">Acesso negado</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Essa conta não tem permissão para acessar o painel admin.
      </p>
      <Link href="/admin/login" className="text-sm font-medium underline">
        Voltar ao login
      </Link>
    </div>
  );
}
