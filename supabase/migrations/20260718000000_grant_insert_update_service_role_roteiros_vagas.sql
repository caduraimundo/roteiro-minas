-- Sequência de grant_select_service_role_admin: aquela migration deu só
-- SELECT pro service_role de propósito, deixando escrita pro prompt de
-- CRUD do admin. Agora que as rotas POST/PATCH de /api/admin/roteiros e
-- /api/admin/vagas existem, faltam os grants de INSERT/UPDATE - mesmo
-- bug estrutural de sempre (tabela criada via SQL puro não recebe grant
-- automático). Sem isso, o service_role bate em "permission denied" mesmo
-- sendo o client usado pelas rotas.
grant insert, update on roteiros to service_role;
grant insert, update on vagas to service_role;
