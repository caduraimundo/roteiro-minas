-- Card 6 do Kanban: fecha a lacuna documentada - o checkout online já
-- valida e envia data_nascimento/endereço pro Pagar.me (dentro do
-- metadata da order), mas confirmar_venda_pagarme (chamada pelo webhook
-- order.paid) não tinha parâmetros pra gravar esses 8 campos em vendas,
-- então ficavam NULL pra toda venda online.
--
-- Assinatura real conferida via pg_proc antes desta migration:
-- confirmar_venda_pagarme(p_vaga_id uuid, p_pagarme_order_id text,
-- p_comprador_nome text, p_comprador_cpf text, p_comprador_email text,
-- p_forma_pagamento text, p_parcelas integer, p_valor_total numeric,
-- p_cupom_id uuid, p_reserva_id uuid DEFAULT NULL::uuid) - sem os campos
-- novos. Sem dependências (pg_depend) de outra função/trigger/view.
--
-- Diferente de registrar_venda_manual: aqui NÃO há RAISE EXCEPTION pra
-- nenhum dos 8 campos novos, nem pra p_complemento nem pros outros 7.
-- Esta função confirma um pagamento JÁ aprovado e cobrado do cliente -
-- não pode falhar a confirmação por causa de metadata incompleto de um
-- pedido antigo (criado antes desta mudança, sem esses campos no
-- metadata da order). A obrigatoriedade desses campos já é garantida
-- rio acima, na validação de POST /api/checkout/pagar (pedidos novos) -
-- aqui eles só são aceitos como vierem, inclusive NULL, sem validação.
--
-- Assinatura muda (8 parâmetros novos) - CREATE OR REPLACE sozinho
-- criaria uma sobrecarga nova no Postgres em vez de substituir a
-- antiga. DROP explícito da versão de 10 parâmetros antes de criar a
-- de 18.
drop function if exists public.confirmar_venda_pagarme(
  uuid, text, text, text, text, text, integer, numeric, uuid, uuid
);

create or replace function confirmar_venda_pagarme(
  p_vaga_id uuid,
  p_pagarme_order_id text,
  p_comprador_nome text,
  p_comprador_cpf text,
  p_comprador_email text,
  p_forma_pagamento text,
  p_parcelas integer,
  p_valor_total numeric,
  p_cupom_id uuid,
  p_data_nascimento date,
  p_cep text,
  p_rua text,
  p_numero text,
  p_complemento text,
  p_bairro text,
  p_cidade text,
  p_uf text,
  p_reserva_id uuid default null::uuid
)
returns table(sucesso boolean, motivo text, venda_id uuid)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_venda_id uuid;
  v_ja_existente uuid;
  v_codigo text;
  v_alfabeto text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_tentativas int := 0;
  v_reserva_convertida uuid;
  v_vaga_ja_reservada boolean := false;
begin
  select id into v_ja_existente
  from vendas
  where pagarme_order_id = p_pagarme_order_id;

  if v_ja_existente is not null then
    return query select true, 'ja_processado'::text, v_ja_existente;
    return;
  end if;

  -- Caminho primário: identifica a reserva pelo reserva_id vindo do
  -- metadata do pedido - não depende de vincular_reserva_order ter
  -- terminado a tempo. Também grava o pagarme_order_id aqui (coalesce:
  -- não sobrescreve se vincular_reserva_order já rodou antes).
  if p_reserva_id is not null then
    update reservas_checkout
    set status = 'convertida',
        pagarme_order_id = coalesce(pagarme_order_id, p_pagarme_order_id)
    where id = p_reserva_id
      and vaga_id = p_vaga_id
      and status = 'reservada'
    returning vaga_id into v_reserva_convertida;
  end if;

  -- Caminho secundário (defesa extra): sem reserva_id ou não encontrada
  -- por id - tenta pelo pagarme_order_id, igual ao comportamento anterior.
  if v_reserva_convertida is null then
    update reservas_checkout
    set status = 'convertida'
    where pagarme_order_id = p_pagarme_order_id
      and status = 'reservada'
    returning vaga_id into v_reserva_convertida;
  end if;

  if v_reserva_convertida is not null then
    v_vaga_ja_reservada := true;
  else
    -- Rede de segurança final: sem reserva encontrada por nenhum dos dois
    -- caminhos (fluxo antigo ou reserva expirada antes da confirmação
    -- chegar). Tenta decremento direto, igual ao comportamento anterior a
    -- essa migração.
    update vagas
    set vagas_disponiveis = vagas_disponiveis - 1
    where id = p_vaga_id
      and vagas_disponiveis > 0;

    if not found then
      begin
        insert into vendas (
          vaga_id, comprador_nome, comprador_cpf, comprador_email,
          forma_pagamento, parcelas, valor_total, cupom_id, status, pagarme_order_id,
          data_nascimento, cep, rua, numero, complemento, bairro, cidade, uf
        ) values (
          p_vaga_id, p_comprador_nome, p_comprador_cpf, p_comprador_email,
          p_forma_pagamento, p_parcelas, p_valor_total, p_cupom_id,
          'pendencia_vaga_esgotada', p_pagarme_order_id,
          p_data_nascimento, p_cep, p_rua, p_numero, p_complemento, p_bairro, p_cidade, p_uf
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
        codigo_verificacao,
        data_nascimento, cep, rua, numero, complemento, bairro, cidade, uf
      ) values (
        p_vaga_id, p_comprador_nome, p_comprador_cpf, p_comprador_email,
        p_forma_pagamento, p_parcelas, p_valor_total, p_cupom_id, 'confirmada', p_pagarme_order_id,
        v_codigo,
        p_data_nascimento, p_cep, p_rua, p_numero, p_complemento, p_bairro, p_cidade, p_uf
      )
      returning id into v_venda_id;

      exit;
    exception
      when unique_violation then
        select id into v_ja_existente
        from vendas
        where pagarme_order_id = p_pagarme_order_id;

        if v_ja_existente is not null then
          if not v_vaga_ja_reservada then
            update vagas
            set vagas_disponiveis = vagas_disponiveis + 1
            where id = p_vaga_id;
          end if;

          return query select true, 'ja_processado'::text, v_ja_existente;
          return;
        end if;

        v_tentativas := v_tentativas + 1;
        if v_tentativas >= 5 then
          if not v_vaga_ja_reservada then
            update vagas
            set vagas_disponiveis = vagas_disponiveis + 1
            where id = p_vaga_id;
          end if;

          return query select false, 'erro_codigo_verificacao'::text, null::uuid;
          return;
        end if;
    end;
  end loop;

  return query select true, 'confirmado'::text, v_venda_id;
end;
$function$;

-- Função nova (assinatura diferente) nasce sem o grant da versão
-- antiga, que foi dropada. Diferente de registrar_venda_manual (só
-- service_role): aqui o webhook chama via createClient() (chave anon,
-- sem sessão/service role), então replica EXATAMENTE o grant real
-- conferido antes desta migration (anon, authenticated e service_role
-- todos com EXECUTE) - não restringe pra service_role só, o que
-- quebraria a confirmação de pagamento em produção.
grant execute on function confirmar_venda_pagarme(
  uuid, text, text, text, text, text, integer, numeric, uuid,
  date, text, text, text, text, text, text, text, uuid
) to anon, authenticated, service_role;
