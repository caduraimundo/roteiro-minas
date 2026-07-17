-- Tabelas criadas via SQL puro (não pelo provisionamento padrão do
-- Supabase) nunca receberam os grants automáticos - nem service_role tem
-- SELECT, só REFERENCES/TRIGGER/TRUNCATE (mesmo problema já visto e
-- corrigido antes pra anon/authenticated em roteiros/vagas/cupons).
--
-- As rotas de leitura do painel admin (/api/admin/*) usam o client
-- service_role pra ler essas tabelas (não têm SELECT público via RLS, de
-- propósito - vendas tem CPF/e-mail). Só SELECT por enquanto - escrita
-- (INSERT/UPDATE/DELETE) fica pros prompts de CRUD do admin, fora do
-- escopo desta migration.
grant select on roteiros to service_role;
grant select on vagas to service_role;
grant select on cupons to service_role;
grant select on vendas to service_role;
