import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ALLOWLIST } from "@/lib/admin-allowlist";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const email = data.user.email;

      if (email && ADMIN_ALLOWLIST.includes(email)) {
        return NextResponse.redirect(`${origin}/admin`);
      }

      // Segunda camada de defesa: sessão criada, mas o e-mail não está na
      // allowlist - encerra imediatamente, não deixa viva.
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/admin/acesso-negado`);
    }
  }

  return NextResponse.redirect(`${origin}/admin/login`);
}
