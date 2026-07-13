create table roteiros (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  tipo text not null check (tipo in ('fixo', 'personalizado')),
  pdf_url text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table vagas (
  id uuid primary key default gen_random_uuid(),
  roteiro_id uuid not null references roteiros(id),
  data date not null,
  preco numeric(10,2) not null,
  vagas_totais integer not null,
  vagas_disponiveis integer not null,
  status text not null default 'aberta' check (status in ('aberta', 'lotada', 'cancelada')),
  created_at timestamptz not null default now()
);

create table cupons (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  roteiro_id uuid not null references roteiros(id),
  percentual_desconto numeric(5,2) not null check (percentual_desconto > 0 and percentual_desconto <= 100),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table vendas (
  id uuid primary key default gen_random_uuid(),
  vaga_id uuid not null references vagas(id),
  comprador_nome text not null,
  comprador_cpf text not null,
  comprador_email text not null,
  forma_pagamento text not null check (forma_pagamento in ('pix', 'cartao_avista', 'cartao_parcelado')),
  parcelas integer not null default 1,
  valor_total numeric(10,2) not null,
  cupom_id uuid references cupons(id),
  venda_manual boolean not null default false,
  status text not null default 'confirmada' check (status in ('confirmada', 'cancelada')),
  created_at timestamptz not null default now()
);

create unique index vendas_cupom_cpf_unico
  on vendas (cupom_id, comprador_cpf)
  where cupom_id is not null and status = 'confirmada';

alter table roteiros enable row level security;
alter table vagas enable row level security;
alter table cupons enable row level security;
alter table vendas enable row level security;
