-- Backfill: aplicada diretamente no banco fora do fluxo de push do git.
-- Reconstruída a partir do schema real em produção pra manter o histórico
-- de migrations consistente com o que já está rodando.
alter table vendas
  add column codigo_verificacao text unique,
  add column ticket_enviado_em timestamptz;
