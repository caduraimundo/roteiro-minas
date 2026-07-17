-- Mesmo padrão já usado em cupom_ja_usado_por_cpf: função estreita em vez de
-- abrir grants amplos em `vendas` (que tem CPF/nome/e-mail de todo mundo).
-- Usada pelo webhook e pela rota de reenvio manual pra buscar só o que é
-- necessário pra gerar/enviar o ticket.
create or replace function buscar_dados_ticket(p_venda_id uuid)
returns table (
  comprador_nome text,
  comprador_email text,
  valor_total numeric,
  codigo_verificacao text,
  vaga_id uuid,
  status text,
  ticket_enviado_em timestamptz
)
language sql
security definer
set search_path = public
as $$
  select comprador_nome, comprador_email, valor_total, codigo_verificacao,
         vaga_id, status, ticket_enviado_em
  from vendas
  where id = p_venda_id;
$$;

grant execute on function buscar_dados_ticket(uuid) to anon, authenticated;

create or replace function marcar_ticket_enviado(p_venda_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update vendas set ticket_enviado_em = now() where id = p_venda_id;
$$;

grant execute on function marcar_ticket_enviado(uuid) to anon, authenticated;
