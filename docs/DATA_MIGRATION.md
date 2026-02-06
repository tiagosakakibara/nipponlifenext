-- ============================================================
-- SCRIPT DE MIGRAÇÃO DE DADOS
-- Copiar dados do projeto antigo (Singapura) para o novo (Tóquio)
-- ============================================================

-- IMPORTANTE: Este script deve ser executado MANUALMENTE
-- pois requer acesso aos dois bancos de dados simultaneamente.

-- Instruções:
-- 1. Conecte-se ao projeto ANTIGO (sprkrjirfabsffrghdpo) via psql ou pgAdmin
-- 2. Execute os comandos COPY TO para exportar os dados
-- 3. Conecte-se ao projeto NOVO (cygilntqbathrziuftoe)
-- 4. Execute os comandos COPY FROM para importar os dados

-- ============================================================
-- ALTERNATIVA: Usar pg_dump e pg_restore
-- ============================================================

-- No terminal, execute:

-- 1. Exportar dados do projeto antigo:
-- pg_dump -h db.sprkrjirfabsffrghdpo.supabase.co \
--   -U postgres \
--   -d postgres \
--   --data-only \
--   --no-owner \
--   --no-privileges \
--   -t public.categories \
--   -t public.posts \
--   -t public.jobs \
--   -t public.calendar_events \
--   -t public.businesses \
--   -t public.guides_categories \
--   -t public.guides \
--   -t public.community_*\
--   -t public.gallery_* \
--   -t public.statistics_* \
--   -t public.media \
--   -t public.site_settings \
--   > nipponlife_data_export.sql

-- 2. Importar para o projeto novo:
-- psql -h db.cygilntqbathrziuftoe.supabase.co \
--   -U postgres \
--   -d postgres \
--   < nipponlife_data_export.sql

-- ============================================================
-- ALTERNATIVA 2: Usar a API do Supabase via curl
-- ============================================================

-- Para cada tabela, você pode usar:
-- 1. GET do projeto antigo
-- 2. POST para o projeto novo

-- Exemplo para a tabela 'categories':
-- curl "<https://sprkrjirfabsffrghdpo.supabase.co/rest/v1/categories>" \
--   -H "apikey: [SERVICE_ROLE_KEY_ANTIGO]" \
--   -H "Authorization: Bearer [SERVICE_ROLE_KEY_ANTIGO]" \
--   > categories.json

-- curl -X POST "<https://cygilntqbathrziuftoe.supabase.co/rest/v1/categories>" \
--   -H "apikey: [SERVICE_ROLE_KEY_NOVO]" \
--   -H "Authorization: Bearer [SERVICE_ROLE_KEY_NOVO]" \
--   -H "Content-Type: application/json" \
--   -H "Prefer: resolution=merge-duplicates" \
--   -d @categories.json
