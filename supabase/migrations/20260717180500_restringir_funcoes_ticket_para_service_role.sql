-- Backfill: aplicada diretamente no banco via Supabase MCP fora do fluxo de
-- push do git. Reconstruída a partir dos grants reais em produção pra manter
-- o histórico de migrations consistente com o que já está rodando (mesmo
-- padrão já usado em vendas_codigo_verificacao_e_ticket_enviado).
--
-- Achado de auditoria: buscar_dados_ticket e marcar_ticket_enviado tinham
-- EXECUTE liberado pra anon/authenticated/PUBLIC - qualquer pessoa com a
-- chave pública do Supabase podia chamar essas funções via REST direto,
-- passando qualquer venda_id, e obter nome/e-mail/valor pago/código de
-- verificação de qualquer venda. Revoga o acesso público e concede EXECUTE
-- só pra service_role - a partir de agora essas duas funções só podem ser
-- chamadas por código server-side usando a service role key.

revoke execute on function buscar_dados_ticket(uuid) from anon, authenticated, public;
revoke execute on function marcar_ticket_enviado(uuid) from anon, authenticated, public;

grant execute on function buscar_dados_ticket(uuid) to service_role;
grant execute on function marcar_ticket_enviado(uuid) to service_role;
