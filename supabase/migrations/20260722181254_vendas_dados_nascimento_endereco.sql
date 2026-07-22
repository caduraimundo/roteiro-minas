-- Card 6 do Kanban (Checkout): campos de comprador pra igualar ao que o
-- Markys já coleta manualmente por WhatsApp (data de nascimento e
-- endereço completo). Todos nullable no banco - vendas antigas não têm
-- esse dado, e a obrigatoriedade de preenchimento (exceto complemento,
-- sempre opcional) é responsabilidade da camada de API/formulário, não
-- do schema. Colunas conferidas via information_schema antes desta
-- migration - nenhuma delas existia em vendas, sem conflito de nome.
alter table vendas
  add column data_nascimento date null,
  add column cep text null,
  add column rua text null,
  add column numero text null,
  add column complemento text null,
  add column bairro text null,
  add column cidade text null,
  add column uf char(2) null;

comment on column vendas.numero is
  'Texto, não integer - endereço pode ter "123A", "s/n" etc.';
comment on column vendas.complemento is
  'Sempre opcional, mesmo quando os demais campos de endereço forem obrigatórios na camada de API/formulário.';

-- Nome do constraint conferido via pg_constraint antes desta migration -
-- vendas_uf_check não existia, seguindo o mesmo padrão de
-- vendas_status_check / vendas_forma_pagamento_check.
alter table vendas
  add constraint vendas_uf_check
  check (uf is null or length(uf) = 2);
