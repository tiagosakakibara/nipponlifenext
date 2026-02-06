# 🔄 Guia de Migração de Dados - NipponLife

## ✅ Status da Estrutura do Banco

Todas as tabelas foram criadas com sucesso no **NipponLife-Japan** (Tóquio)!

## 📋 Próximo Passo: Migração de Dados

### Opção 1: Via Painel do Supabase (Recomendado)

1. **Acesse o projeto ANTIGO** (NipponLife - Singapura):
   - URL: <https://supabase.com/dashboard/project/sprkrjirfabsffrghdpo>

2. **Vá em Table Editor** e para cada tabela com dados:
   - Selecione todos os registros
   - Clique em "Export" → "Export as CSV"
   - Salve o arquivo

3. **Acesse o projeto NOVO** (NipponLife-Japan - Tóquio):
   - URL: <https://supabase.com/dashboard/project/cygilntqbathrziuftoe>

4. **Importe os dados**:
   - Vá em Table Editor
   - Selecione a tabela correspondente
   - Clique em "Insert" → "Import from CSV"
   - Faça upload do arquivo exportado

### Opção 2: Via Script (Requer Service Role Keys)

1. **Obtenha as Service Role Keys**:
   - Projeto Antigo: Settings → API → service_role (secret)
   - Projeto Novo: Settings → API → service_role (secret)

2. **Atualize o arquivo** `scripts/migrate.js`:
   - Substitua as chaves anon pelas service_role keys
   - Execute: `cd scripts && npm run migrate`

### Opção 3: Via SQL Editor (Mais Técnico)

1. No projeto ANTIGO, vá em SQL Editor e execute:

```sql
COPY (SELECT * FROM public.posts) TO STDOUT WITH CSV HEADER;
```

1. Copie o resultado

2. No projeto NOVO, vá em SQL Editor e execute:

```sql
COPY public.posts FROM STDIN WITH CSV HEADER;
-- Cole os dados aqui
```

## 📊 Tabelas Principais para Migrar

### Prioridade Alta (Conteúdo Visível)

- ✅ `categories` (já migrada - 9 registros)
- ⏳ `posts` (5 registros)
- ⏳ `jobs`
- ⏳ `calendar_events`
- ⏳ `businesses`

### Prioridade Média

- ⏳ `guides_categories`
- ⏳ `guides`
- ⏳ `community_posts`
- ⏳ `community_questions`

### Prioridade Baixa (Dados Auxiliares)

- ⏳ `gallery_albums`
- ⏳ `gallery_photos`
- ⏳ `media`
- ⏳ `site_settings`

## 🎯 Resultado Esperado

Após a migração, o site em produção (nippon-life.com) mostrará:

- ✅ Todas as notícias publicadas
- ✅ Todas as vagas de emprego
- ✅ Todos os eventos
- ✅ Todos os negócios cadastrados
- ✅ Todos os guias
- ✅ Todas as publicações da comunidade

## ⚠️ Importante

- **Não delete o projeto antigo** até confirmar que tudo está funcionando
- **Teste o site** após a migração para garantir que os dados estão corretos
- **Faça backup** dos dados antes de qualquer operação
