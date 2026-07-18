-- Mesmo bug estrutural de sempre: grant_select_service_role_admin deu só
-- SELECT pro service_role em cupons (junto com roteiros/vagas/vendas), e
-- a migration de INSERT/UPDATE que veio depois (CRUD de roteiros/vagas)
-- só cobriu roteiros e vagas, não cupons. Sem isso, o CRUD de cupons bate
-- em "permission denied" igual aconteceu antes.
grant insert, update on cupons to service_role;
