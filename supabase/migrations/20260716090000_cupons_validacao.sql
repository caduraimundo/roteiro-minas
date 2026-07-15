create policy "cupons_select_publico"
  on cupons
  for select
  to anon, authenticated
  using (ativo = true);

grant select on cupons to anon, authenticated;

-- Checa uso prévio de um cupom por CPF sem expor a tabela `vendas`
-- (que contém CPF/nome/e-mail de clientes) para leitura pública.
create or replace function cupom_ja_usado_por_cpf(p_cupom_id uuid, p_cpf text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from vendas
    where cupom_id = p_cupom_id
      and comprador_cpf = p_cpf
      and status = 'confirmada'
  );
$$;

grant execute on function cupom_ja_usado_por_cpf(uuid, text) to anon, authenticated;
