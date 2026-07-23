-- Card "Roteiros receptivos vs. emissíveis" - só camada de banco, sem
-- API/frontend nesta migration.
--
-- 1) Renomeia o enum de tipo de roteiro (fixo/personalizado, nunca
-- usado de verdade em lógica nenhuma - confirmado antes desta
-- migration) para emissivel/receptivo:
-- - emissivel = modelo atual (data fixa por edição, vagas limitadas,
--   contador de vagas) - equivale ao antigo "fixo".
-- - receptivo = preço fixo por roteiro (roteiros.preco_receptivo),
--   sem contagem de vaga - cliente escolhe a data e o site checa
--   disponibilidade via roteiro_datas_indisponiveis - equivale ao
--   antigo "personalizado".
--
-- Ordem importa: dropar a constraint antiga antes de migrar o dado -
-- do contrário a constraint antiga rejeitaria 'emissivel'/'receptivo'
-- antes mesmo de existir a nova.
alter table roteiros drop constraint roteiros_tipo_check;

update roteiros set tipo = 'emissivel' where tipo = 'fixo';
update roteiros set tipo = 'receptivo' where tipo = 'personalizado';

alter table roteiros
  add constraint roteiros_tipo_check check (tipo in ('emissivel', 'receptivo'));

comment on column roteiros.tipo is
  'emissivel = roteiro com data fixa por edição, vagas limitadas, contador de vagas (tabela vagas). receptivo = preço fixo por roteiro (roteiros.preco_receptivo), sem contagem de vaga - cliente escolhe a data e a disponibilidade é checada contra roteiro_datas_indisponiveis.';

-- 2) Preço fixo pra roteiros receptivos. Roteiros emissíveis continuam
-- usando o preço por vaga (vagas.preco) - este campo fica NULL pra
-- eles. Sem precisão fixa (numeric puro), mesmo padrão já usado nas
-- outras colunas numéricas de roteiros (custo_fixo_execucao,
-- custo_variavel_pessoa) - diferente de vagas.preco, que é
-- numeric(10,2).
alter table roteiros add column preco_receptivo numeric;

comment on column roteiros.preco_receptivo is
  'Preço fixo usado só quando roteiros.tipo = ''receptivo''. Roteiros emissíveis continuam usando o preço por vaga (vagas.preco) e este campo fica NULL para eles.';

-- 3) Bloqueio manual de datas pra roteiros receptivos (sem tabela de
-- vagas - a disponibilidade é "todo dia disponível, exceto os
-- bloqueados aqui"). Nunca deletar, só desativar - mesmo padrão do
-- resto do projeto ("remover" uma data bloqueada é ativo = false).
create table roteiro_datas_indisponiveis (
  id uuid primary key default gen_random_uuid(),
  roteiro_id uuid not null references roteiros(id),
  data date not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (roteiro_id, data)
);

comment on table roteiro_datas_indisponiveis is
  'Controle manual de disponibilidade de roteiros receptivos (roteiros.tipo = ''receptivo''): cada linha bloqueia uma data específica pra um roteiro. Alimentado pelo admin por enquanto - desenhado pra futuramente ser alimentado por sync do Google Agenda sem mudar o contrato da tabela. Nunca deletar - "remover" um bloqueio é ativo = false, não DELETE.';

-- RLS/grants replicando exatamente o padrão já usado em roteiros/vagas
-- (policies_leitura_publica.sql / grant_select_leitura_publica.sql) -
-- select público condicionado a ativo = true e ao roteiro pai também
-- ativo = true, mesmo formato de vagas_select_publico.
alter table roteiro_datas_indisponiveis enable row level security;

create policy "roteiro_datas_indisponiveis_select_publico"
  on roteiro_datas_indisponiveis
  for select
  to anon, authenticated
  using (
    ativo = true
    and exists (
      select 1
      from roteiros
      where roteiros.id = roteiro_datas_indisponiveis.roteiro_id
        and roteiros.ativo = true
    )
  );

-- GRANT não é automático em tabela criada via SQL puro no Supabase -
-- mesmo bug estrutural já visto em todas as outras tabelas do
-- projeto. Sem DELETE pra ninguém, mesmo padrão das demais tabelas.
grant select on roteiro_datas_indisponiveis to anon, authenticated;
grant select, insert, update on roteiro_datas_indisponiveis to service_role;
