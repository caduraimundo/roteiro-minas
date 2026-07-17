import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";

export async function proxy(request: NextRequest) {
  const { box, user, supabase } = await updateSession(request);

  const { pathname } = request.nextUrl;
  const rotaProtegida =
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    pathname !== "/admin/acesso-negado";

  if (rotaProtegida) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (!user.email || !ADMIN_ALLOWLIST.includes(user.email)) {
      // Segunda camada de defesa: mesmo que o Google/Supabase tenham
      // deixado passar, o e-mail não está na allowlist - encerra a sessão
      // imediatamente, não deixa viva.
      await supabase.auth.signOut();

      const redirecionamento = NextResponse.redirect(
        new URL("/admin/acesso-negado", request.url),
      );
      box.response.cookies
        .getAll()
        .forEach((cookie) => redirecionamento.cookies.set(cookie));

      return redirecionamento;
    }
  }

  return box.response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
