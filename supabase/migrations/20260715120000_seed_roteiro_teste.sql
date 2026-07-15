insert into roteiros (id, nome, slug, descricao, tipo, pdf_url, ativo)
values (
  'a1000000-0000-0000-0000-000000000001',
  'Cachoeira do Tabuleiro - Bate-volta',
  'cachoeira-do-tabuleiro-bate-volta',
  'Bate-volta até a Cachoeira do Tabuleiro, uma das mais altas de Minas Gerais, com trilha de dificuldade moderada e parada para banho.',
  'fixo',
  null,
  true
);

insert into vagas (roteiro_id, data, preco, vagas_totais, vagas_disponiveis, status)
values (
  'a1000000-0000-0000-0000-000000000001',
  '2026-08-16',
  180.00,
  10,
  10,
  'aberta'
);
