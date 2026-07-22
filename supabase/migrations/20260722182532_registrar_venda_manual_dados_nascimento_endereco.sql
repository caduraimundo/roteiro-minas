-- Card 6 do Kanban: venda manual (WhatsApp/presencial) também passa a
-- coletar data de nascimento e endereço, mesma lógica já aplicada ao
-- checkout online - dado usado pro seguro do passeio, vale pra qualquer
-- canal de venda.
--
-- Assinatura real conferida via pg_proc antes desta migration:
-- registrar_venda_manual(p_vaga_id uuid, p_comprador_nome text,
-- p_comprador_cpf text, p_comprador_email text) - sem os campos novos.
--
-- Adicionar parâmetros muda a identidade da função no Postgres (nome +
-- tipos dos argumentos) - um CREATE OR REPLACE aqui criaria uma função
-- nova/sobrecarregada e deixaria a antiga (4 parâmetros) intacta e
-- ainda chamável, sem os campos exigidos. Por isso: DROP explícito da
-- versão antiga antes de criar a nova com os 8 parâmetros extras.
drop function if exists public.registrar_venda_manual(uuid, text, text, text);

create or replace function registrar_venda_manual(
  p_vaga_id uuid,
  p_comprador_nome text,
  p_comprador_cpf text,
  p_comprador_email text,
  p_data_nascimento date,
  p_cep text,
  p_rua text,
  p_numero text,
  p_complemento text,
  p_bairro text,
  p_cidade text,
  p_uf text
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
  -- p_complemento é o único campo de endereço sempre opcional (pode ser
  -- NULL). Os demais são exigidos aqui, na função - as colunas em
  -- vendas continuam nullable no schema só pra não quebrar vendas
  -- antigas, não pra permitir cadastro incompleto daqui pra frente.
  if p_data_nascimento is null then
    raise exception 'data_nascimento é obrigatória';
  end if;

  if p_cep is null or length(trim(p_cep)) = 0 then
    raise exception 'cep é obrigatório';
  end if;

  if p_rua is null or length(trim(p_rua)) = 0 then
    raise exception 'rua é obrigatória';
  end if;

  if p_numero is null or length(trim(p_numero)) = 0 then
    raise exception 'numero é obrigatório';
  end if;

  if p_bairro is null or length(trim(p_bairro)) = 0 then
    raise exception 'bairro é obrigatório';
  end if;

  if p_cidade is null or length(trim(p_cidade)) = 0 then
    raise exception 'cidade é obrigatória';
  end if;

  if p_uf is null or length(trim(p_uf)) = 0 then
    raise exception 'uf é obrigatória';
  end if;

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
        codigo_verificacao, taxa_devida_valor,
        data_nascimento, cep, rua, numero, complemento, bairro, cidade, uf
      ) values (
        p_vaga_id, p_comprador_nome, p_comprador_cpf, p_comprador_email,
        'manual', 1, v_preco, null, true, 'confirmada',
        v_codigo, v_taxa_devida,
        p_data_nascimento, p_cep, p_rua, p_numero, p_complemento, p_bairro, p_cidade, p_uf
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

-- Função nova (assinatura diferente) nasce com o default do Postgres pra
-- funções recém-criadas (EXECUTE liberado pra PUBLIC, não herda o grant
-- da versão antiga que foi dropada) - revoga/concede de novo explicito,
-- mesmo padrão já usado quando esta função foi criada originalmente
-- (venda_manual_taxa_devida_reembolso.sql).
revoke execute on function registrar_venda_manual(
  uuid, text, text, text, date, text, text, text, text, text, text, text
) from anon, authenticated, public;

grant execute on function registrar_venda_manual(
  uuid, text, text, text, date, text, text, text, text, text, text, text
) to service_role;
