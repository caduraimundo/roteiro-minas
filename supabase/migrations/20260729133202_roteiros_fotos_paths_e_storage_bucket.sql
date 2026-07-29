-- Camada 1/3 da feature "upload de imagem do roteiro, com crop" (Kanban,
-- Status Doing) - só banco: colunas de path na tabela roteiros + bucket
-- de Storage com as policies. Rota de API (grava o path depois do
-- upload) e componente de upload/crop no admin ficam pras próximas duas
-- camadas, geradas/executadas separadamente.

-- 1) Colunas de path na tabela roteiros ----------------------------------
-- text NULL: nenhum roteiro tem foto ainda, fica NULL até o Markys subir
-- as fotos reais - mesmo padrão de categoria/nivel_dificuldade
-- (20260724120000), campo opcional que nasce vazio nos roteiros já
-- existentes.
ALTER TABLE roteiros
  ADD COLUMN foto_principal_path text,
  ADD COLUMN foto_secundaria_1_path text,
  ADD COLUMN foto_secundaria_2_path text,
  ADD COLUMN foto_secundaria_3_path text;

COMMENT ON COLUMN roteiros.foto_principal_path IS
  'Path do arquivo da foto principal dentro do bucket roteiro-fotos do Supabase Storage - não é uma URL completa, precisa ser combinado com a URL pública do bucket pra exibir a imagem. NULL nos roteiros sem foto cadastrada ainda.';
COMMENT ON COLUMN roteiros.foto_secundaria_1_path IS
  'Path do arquivo da 1ª foto secundária (galeria) dentro do bucket roteiro-fotos do Supabase Storage - não é uma URL completa. NULL nos roteiros sem foto cadastrada ainda.';
COMMENT ON COLUMN roteiros.foto_secundaria_2_path IS
  'Path do arquivo da 2ª foto secundária (galeria) dentro do bucket roteiro-fotos do Supabase Storage - não é uma URL completa. NULL nos roteiros sem foto cadastrada ainda.';
COMMENT ON COLUMN roteiros.foto_secundaria_3_path IS
  'Path do arquivo da 3ª foto secundária (galeria) dentro do bucket roteiro-fotos do Supabase Storage - não é uma URL completa. NULL nos roteiros sem foto cadastrada ainda.';

-- 2) Bucket de Storage ----------------------------------------------------
-- public = true: o site público (Home, Detalhe do roteiro) precisa
-- exibir as fotos sem autenticação, direto pela URL pública do bucket.
-- file_size_limit em bytes (8MB) - fotos em alta resolução, mas sem
-- deixar passar arquivo absurdamente grande. allowed_mime_types
-- restrito a formato de imagem comum (sem SVG - risco de conteúdo ativo
-- se servido inline num bucket público; sem GIF - não se aplica a foto
-- de roteiro).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'roteiro-fotos',
  'roteiro-fotos',
  true,
  8388608, -- 8MB em bytes
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- 3) Policies em storage.objects -------------------------------------------
-- Leitura pública explícita: mesmo com bucket public = true, RLS de
-- storage.objects ainda é avaliada nas chamadas feitas via API/SDK (não
-- só na URL pública direta do CDN) - sem essa policy, list/download via
-- supabase-js com a chave anon falharia mesmo o bucket sendo público.
create policy "roteiro-fotos: leitura publica"
  on storage.objects for select
  to public
  using (bucket_id = 'roteiro-fotos');

-- Escrita só por service_role - upload/crop/exclusão de foto é sempre
-- feito pela rota de API do admin (próxima camada), nunca direto do
-- client com a chave anon. Sem policy pra anon/authenticated aqui de
-- propósito, mesmo padrão já usado nas tabelas do projeto (só
-- service_role grava - ver 20260718000000 e as migrations seguintes de
-- grant_insert_update_service_role_*).
create policy "roteiro-fotos: insert so service_role"
  on storage.objects for insert
  to service_role
  with check (bucket_id = 'roteiro-fotos');

create policy "roteiro-fotos: update so service_role"
  on storage.objects for update
  to service_role
  using (bucket_id = 'roteiro-fotos')
  with check (bucket_id = 'roteiro-fotos');

create policy "roteiro-fotos: delete so service_role"
  on storage.objects for delete
  to service_role
  using (bucket_id = 'roteiro-fotos');
