// E-mails autorizados a acessar /admin. Segunda camada de defesa - a
// primeira já é a restrição do Google OAuth consent screen (modo Testing)
// + Supabase Auth com cadastro público desligado. Mesmo que alguém
// consiga completar o login pelo Google, sem estar aqui a sessão é
// encerrada imediatamente.
export const ADMIN_ALLOWLIST = [
  "minasroteiro@gmail.com",
  "roteirominasgerais@gmail.com",
];
