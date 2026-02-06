# 📌 Decisões Arquiteturais — NipponLife

Este documento consolida **decisões técnicas e estratégicas já tomadas** no projeto NipponLife.  
Todas as implementações futuras **devem respeitar estas diretrizes**, salvo nova decisão formal registrada aqui.

## Índice de Decisões
- [DS-001] Congelamento da Identidade Visual
- [AUTH-002] Supabase como Fonte Única de Verdade


---

## 🎨 1. Congelamento da Identidade Visual (Design System)

### Tipografia (Obrigatória)
- **DM Sans** → Corpo de texto
- **Montserrat** → Títulos e destaques
- **Shippori Mincho** → Conteúdo japonês e cultural

> ❗ Não é permitido introduzir novas fontes sem decisão explícita registrada.

### Paleta de Cores Oficial
- **Primary Red:** `#D70F24`
- **Primary Blue:** `#003768`
- **Accent Blue:** `#5593C3`

> ❗ Nenhuma cor aproximada, variação ou alternativa deve ser utilizada sem autorização explícita.

---

## 🔐 2. Padrão de Autenticação e Segurança

### Chaves de API
- Decisão técnica: **utilizar chaves Legacy JWT (`anon`)**
- Motivo: incompatibilidade das novas chaves *publishable* com o método  
  `signInWithPassword` do SDK de autenticação do Supabase.

### Single Source of Truth
- O **Supabase** é a **autoridade única de dados**.
- **Row Level Security (RLS)** deve:
  - Estar sempre **ativo**
  - **Nunca** ser contornado via lógica de frontend ou backend externo.

---

## 🌍 3. Estratégia de Internacionalização (i18n)

### Tradução em Nível de Banco de Dados
- Todas as tabelas principais devem suportar campos de tradução explícitos, exemplo:
  - `title_en`, `title_pt`, `title_ja`
  - `content_en`, `content_pt`, `content_ja`

Aplicável a:
- Eventos
- Postagens
- Negócios
- Conteúdos institucionais

### Idiomas Suportados
- Português (Brasil)
- Japonês
- Inglês

---

## 👥 4. Controle de Acesso Administrativo

### RBAC — Role-Based Access Control
- Migração do modelo de **whitelist via variáveis de ambiente** para:
  - Sistema de **funções (`role`)** na tabela `profiles`.

### Funções previstas
- `admin`
- `editor`

> Permissões devem ser **granulares** e sempre validadas no banco via RLS.

---

## 📊 5. Módulo de Estatísticas e Dados

### Dashboards Institucionais
- Implementação de um módulo dedicado para:
  - KPIs de turismo
  - Dados demográficos
  - Estatísticas de residentes estrangeiros

### Agregações
- Utilizar **Views do PostgreSQL** para:
  - Residentes estrangeiros por **nacionalidade**
  - Residentes estrangeiros por **província**

> O frontend apenas consome dados agregados; lógica estatística pertence ao banco.

---

## 🏗️ 6. Fluxo de Desenvolvimento e Migrações

### Migrações Obrigatórias
- **Toda alteração de schema ou policy deve ser feita via SQL migrations**.
- Migrações devem ser:
  - Versionadas
  - Documentadas
  - Reprodutíveis

### Objetivo
- Garantir **sincronização total** entre:
  - Ambiente de desenvolvimento
  - Ambiente de produção

> ❌ Alterações manuais em produção são proibidas.

---


---

## 🎨 7. Estratégia de Temas (Dark Mode)

### Implementação Híbrida
- Utilização de **Classes Utilitárias do Tailwind** (`dark:`) combinadas com **Variáveis CSS** (`--nl-bg`, `--nl-text`).
- **Hook `useTheme`**: Responsável por alternar a classe `.dark` no elemento `<html>` e persistir a preferência no `localStorage`.

### Restrições de Estilo
- **Fundos Sólidos**: Evitar o uso de opacidade em cores de fundo definidas por variáveis (ex: `bg-app/50`) em elementos interativos como inputs. Utilizar cores sólidas (`bg-app`, `bg-surface`) para garantir consistência visual.
- **Gráficos Dinâmicos**: Componentes de visualização (ex: Recharts) devem consumir o contexto do tema para renderizar cores apropriadas em tempo real.

---

## 👥 8. Gestão de Status de Usuário

### Moderação Flexível
- Implementação de coluna `status` na tabela `profiles` com enumeração explícita:
  - `active`: Usuário normal.
  - `suspended`: Bloqueio temporário (ex: "até segundas ordens").
  - `banned`: Bloqueio definitivo.

> A exclusão física de registros de usuários (`DELETE`) deve ser evitada para manter histórico, preferindo-se o "Soft Ban" via status.

---

## 🧠 Regra Final
Qualquer exceção, ajuste ou mudança **deve gerar uma nova entrada neste documento**, mantendo o NipponLife consistente, auditável e escalável.
