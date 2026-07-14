create policy "roteiros_select_publico"
  on roteiros
  for select
  to anon, authenticated
  using (ativo = true);

create policy "vagas_select_publico"
  on vagas
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from roteiros
      where roteiros.id = vagas.roteiro_id
        and roteiros.ativo = true
    )
  );
