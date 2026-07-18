-- Camada de banco pra venda manual (Markys cadastra venda feita fora do
-- checkout online) + rastreio de taxa devida + reembolso. Sem rota de API
-- nem tela ainda - só migration + funções, mesmo padrão de
-- confirmar_venda_pagarme (SECURITY DEFINER, geração de
-- codigo_verificacao, débito atômico de vaga).

-- 1. Colunas novas em vendas
alter table vendas
  add column taxa_devida_valor numeric null,
  add column taxa_devida_acertada_em timestamptz null;

comment on column vendas.taxa_devida_valor is
  'Valor da taxa de 6% que o Markys deve ao Cadu - preenchido só quando venda_manual = true (venda online já desconta a taxa no próprio pagamento via Pagar.me).';
comment on column vendas.taxa_devida_acertada_em is
  'Preenchido quando Cadu marcar que recebeu esse valor por fora. NULL = ainda não acertado.';

-- 2. CHECK constraints: adicionar 'reembolsada' (status) e 'manual'
-- (forma_pagamento) aos valores aceitos. Nomes confirmados via
-- information_schema antes de escrever esta migration (vendas_status_check,
-- vendas_forma_pagamento_check) - não assumidos.
alter table vendas
  drop constraint vendas_status_check;

alter table vendas
  add constraint vendas_status_check
  check (status = any (array['confirmada'::text, 'cancelada'::text, 'pendencia_vaga_esgotada'::text, 'reembolsada'::text]));

alter table vendas
  drop constraint vendas_forma_pagamento_check;

alter table vendas
  add constraint vendas_forma_pagamento_check
  check (forma_pagamento = any (array['pix'::text, 'cartao_avista'::text, 'cartao_parcelado'::text, 'manual'::text]));

-- 3. registrar_venda_manual
--
-- Nota pro Claude Code (e pra quem mexer nisso depois): a taxa de 6% está
-- hardcoded aqui como 0.06 porque SQL não importa a constante TypeScript
-- TAXA_PLATAFORMA_PERCENTUAL, que existe duplicada em
-- src/lib/pagarme.ts:2 e src/components/CheckoutForm.tsx:17 (ambas com o
-- valor 6, aplicado como percentual). São três fontes da mesma taxa agora
-- - se a taxa mudar um dia, precisa atualizar as três manualmente, senão
-- fica dessincronizado sem nenhum erro em tempo de execução.
create or replace function registrar_venda_manual(
  p_vaga_id uuid,
  p_comprador_nome text,
  p_comprador_cpf text,
  p_comprador_email text
)
returns table(sucesso boolean, motivo text, venda_id uuid, taxa_devida numeric)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_preco numeric;
  v_taxa_devida numeric;
  v_venda_id uuid;
  v_codigo text;
  v_alfabeto text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_tentativas int := 0;
begin
  -- Débito atômico idêntico ao de confirmar_venda_pagarme - o RETURNING
  -- pega o preço no mesmo statement que debita, sem SELECT separado (evita
  -- ler um preço que não corresponde à vaga efetivamente debitada).
  update vagas
  set vagas_disponiveis = vagas_disponiveis - 1
  where id = p_vaga_id
    and vagas_disponiveis > 0
  returning preco into v_preco;

  if not found then
    return query select false, 'vaga_esgotada'::text, null::uuid, null::numeric;
    return;
  end if;

  v_taxa_devida := round(v_preco * 0.06, 2);

  loop
    v_codigo := (
      select string_agg(substr(v_alfabeto, (floor(random() * length(v_alfabeto)) + 1)::int, 1), '')
      from generate_series(1, 8)
    );

    begin
      insert into vendas (
        vaga_id, comprador_nome, comprador_cpf, comprador_email,
        forma_pagamento, parcelas, valor_total, cupom_id, venda_manual, status,
        codigo_verificacao, taxa_devida_valor
      ) values (
        p_vaga_id, p_comprador_nome, p_comprador_cpf, p_comprador_email,
        'manual', 1, v_preco, null, true, 'confirmada',
        v_codigo, v_taxa_devida
      )
      returning id into v_venda_id;

      exit;
    exception
      when unique_violation then
        v_tentativas := v_tentativas + 1;
        if v_tentativas >= 5 then
          update vagas
          set vagas_disponiveis = vagas_disponiveis + 1
          where id = p_vaga_id;

          return query select false, 'erro_codigo_verificacao'::text, null::uuid, null::numeric;
          return;
        end if;
    end;
  end loop;

  return query select true, 'confirmado'::text, v_venda_id, v_taxa_devida;
end;
$function$;

-- 4. marcar_venda_reembolsada
--
-- O UPDATE ... WHERE status = 'confirmada' funciona como check-and-set
-- atômico: só transiciona (e só devolve a vaga) se a venda ainda estava
-- confirmada no momento exato do update, sem a janela de corrida que um
-- SELECT de status separado, seguido de UPDATE, teria sob clique duplo
-- concorrente.
create or replace function marcar_venda_reembolsada(p_venda_id uuid)
returns table(sucesso boolean, motivo text)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_vaga_id uuid;
begin
  update vendas
  set status = 'reembolsada'
  where id = p_venda_id
    and status = 'confirmada'
  returning vaga_id into v_vaga_id;

  if not found then
    return query select false, 'status_invalido'::text;
    return;
  end if;

  update vagas
  set vagas_disponiveis = vagas_disponiveis + 1
  where id = v_vaga_id;

  return query select true, 'reembolsado'::text;
end;
$function$;

-- 5. Grants
--
-- Funções SECURITY DEFINER criadas via SQL puro não herdam grant
-- automático de EXECUTE pro service_role (mesmo bug estrutural já visto
-- em várias tabelas deste projeto) - concede explicitamente. Além disso,
-- diferente de confirmar_venda_pagarme (chamada a partir do checkout
-- público, precisa de EXECUTE pra anon/authenticated), estas duas são
-- só de uso administrativo - uma auditoria anterior neste projeto achou
-- funções admin-only com EXECUTE aberto pro público por padrão do
-- Postgres (ver restringir_funcoes_ticket_para_service_role.sql), então
-- revoga de anon/authenticated/public de propósito aqui, pra não
-- reproduzir o mesmo problema.
revoke execute on function registrar_venda_manual(uuid, text, text, text) from anon, authenticated, public;
revoke execute on function marcar_venda_reembolsada(uuid) from anon, authenticated, public;

grant execute on function registrar_venda_manual(uuid, text, text, text) to service_role;
grant execute on function marcar_venda_reembolsada(uuid) to service_role;
