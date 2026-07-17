-- Backfill: aplicada diretamente no banco fora do fluxo de push do git.
-- Reconstruída a partir do schema/função reais em produção pra manter o
-- histórico de migrations consistente com o que já está rodando.
--
-- Muda o tratamento do cenário "pagamento confirmado, vaga esgotada" (antes
-- só logado) pra também persistir uma linha em vendas com status
-- 'pendencia_vaga_esgotada' - fica rastreável na própria tabela, não só em log.
-- Também passa a gerar codigo_verificacao (8 caracteres, alfabeto sem
-- caracteres ambíguos: sem I/O/0/1) em toda venda confirmada, com retry em
-- caso de colisão (até 5 tentativas, desfazendo o débito da vaga se falhar).

alter table vendas
  drop constraint vendas_status_check;

alter table vendas
  add constraint vendas_status_check
  check (status = ANY (ARRAY['confirmada'::text, 'cancelada'::text, 'pendencia_vaga_esgotada'::text]));

create or replace function confirmar_venda_pagarme(
  p_vaga_id uuid,
  p_pagarme_order_id text,
  p_comprador_nome text,
  p_comprador_cpf text,
  p_comprador_email text,
  p_forma_pagamento text,
  p_parcelas integer,
  p_valor_total numeric,
  p_cupom_id uuid
)
returns table (sucesso boolean, motivo text, venda_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_venda_id uuid;
  v_ja_existente uuid;
  v_codigo text;
  v_alfabeto text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_tentativas int := 0;
begin
  select id into v_ja_existente
  from vendas
  where pagarme_order_id = p_pagarme_order_id;

  if v_ja_existente is not null then
    return query select true, 'ja_processado'::text, v_ja_existente;
    return;
  end if;

  update vagas
  set vagas_disponiveis = vagas_disponiveis - 1
  where id = p_vaga_id
    and vagas_disponiveis > 0;

  if not found then
    -- Pagamento real, sem vaga. Grava mesmo assim pra não depender só de log.
    begin
      insert into vendas (
        vaga_id, comprador_nome, comprador_cpf, comprador_email,
        forma_pagamento, parcelas, valor_total, cupom_id, status, pagarme_order_id
      ) values (
        p_vaga_id, p_comprador_nome, p_comprador_cpf, p_comprador_email,
        p_forma_pagamento, p_parcelas, p_valor_total, p_cupom_id,
        'pendencia_vaga_esgotada', p_pagarme_order_id
      )
      returning id into v_venda_id;
    exception when unique_violation then
      select id into v_ja_existente
      from vendas
      where pagarme_order_id = p_pagarme_order_id;

      return query select true, 'ja_processado'::text, v_ja_existente;
      return;
    end;

    return query select false, 'vaga_esgotada'::text, v_venda_id;
    return;
  end if;

  loop
    v_codigo := (
      select string_agg(substr(v_alfabeto, (floor(random() * length(v_alfabeto)) + 1)::int, 1), '')
      from generate_series(1, 8)
    );

    begin
      insert into vendas (
        vaga_id, comprador_nome, comprador_cpf, comprador_email,
        forma_pagamento, parcelas, valor_total, cupom_id, status, pagarme_order_id,
        codigo_verificacao
      ) values (
        p_vaga_id, p_comprador_nome, p_comprador_cpf, p_comprador_email,
        p_forma_pagamento, p_parcelas, p_valor_total, p_cupom_id, 'confirmada', p_pagarme_order_id,
        v_codigo
      )
      returning id into v_venda_id;

      exit;
    exception
      when unique_violation then
        select id into v_ja_existente
        from vendas
        where pagarme_order_id = p_pagarme_order_id;

        if v_ja_existente is not null then
          update vagas
          set vagas_disponiveis = vagas_disponiveis + 1
          where id = p_vaga_id;

          return query select true, 'ja_processado'::text, v_ja_existente;
          return;
        end if;

        v_tentativas := v_tentativas + 1;
        if v_tentativas >= 5 then
          update vagas
          set vagas_disponiveis = vagas_disponiveis + 1
          where id = p_vaga_id;

          return query select false, 'erro_codigo_verificacao'::text, null::uuid;
          return;
        end if;
    end;
  end loop;

  return query select true, 'confirmado'::text, v_venda_id;
end;
$$;
