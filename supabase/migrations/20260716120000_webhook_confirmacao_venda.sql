alter table vendas
  add column pagarme_order_id text unique;

-- Confirma uma venda de forma atômica: debita a vaga (se ainda houver estoque)
-- e insere a venda, sob a mesma transação. Idempotente por pagarme_order_id:
-- reenvios do mesmo webhook não duplicam a venda nem debitam a vaga de novo.
-- SECURITY DEFINER porque nem anon/authenticated têm INSERT em vendas ou
-- UPDATE em vagas (mesmo padrão já usado pra cupons: função estreita em vez
-- de abrir grants amplos nessas tabelas).
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
    return query select false, 'vaga_esgotada'::text, null::uuid;
    return;
  end if;

  begin
    insert into vendas (
      vaga_id, comprador_nome, comprador_cpf, comprador_email,
      forma_pagamento, parcelas, valor_total, cupom_id, status, pagarme_order_id
    ) values (
      p_vaga_id, p_comprador_nome, p_comprador_cpf, p_comprador_email,
      p_forma_pagamento, p_parcelas, p_valor_total, p_cupom_id, 'confirmada', p_pagarme_order_id
    )
    returning id into v_venda_id;
  exception when unique_violation then
    -- Corrida rara: outra chamada concorrente processou esse order_id
    -- entre o SELECT de idempotência e este INSERT. Desfaz o débito que
    -- acabamos de fazer pra não contar a vaga duas vezes.
    update vagas
    set vagas_disponiveis = vagas_disponiveis + 1
    where id = p_vaga_id;

    select id into v_ja_existente
    from vendas
    where pagarme_order_id = p_pagarme_order_id;

    return query select true, 'ja_processado'::text, v_ja_existente;
    return;
  end;

  return query select true, 'confirmado'::text, v_venda_id;
end;
$$;

grant execute on function confirmar_venda_pagarme(
  uuid, text, text, text, text, text, integer, numeric, uuid
) to anon, authenticated;
