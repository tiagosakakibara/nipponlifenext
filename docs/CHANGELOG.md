# Changelog

Todos as alterações notáveis no projeto NipponLife serão documentadas neste arquivo.

## [Não Lançado] - 2026-02-04

### Adicionado
- **Sistema de Banimento de Usuários**:
  - Nova coluna `status` na tabela `profiles` (valores: `active`, `suspended`, `banned`).
  - Funcionalidade no Admin para Suspender (temporário) e Banir (definitivo) usuários.
  - Indicadores visuais de status na listagem de usuários do Admin.
- **Hook de Gerenciamento de Status**: Nova função `updateUserStatus` no hook `useAdminData`.
- **SEO**:
  - Arquivo `robots.txt` criado na raiz pública.
  - Componente `SEO` integrado em páginas chave (`BusinessProfilePage`, `NewsPage`, `AlbumViewPage`).

### Alterado
- **Tema Escuro (Dark Mode)**:
  - Ajuste nas cores do Gráfico de Atividades (`DashboardCharts.tsx`) para suportar tema escuro dinamicamente.
  - Substituição de fundos com opacidade (`bg-app/50`) por cores sólidas (`bg-app`) em inputs do Admin para corrigir renderização no modo escuro.
  - Correção de cores de texto e ícones na tabela de Negócios (`AdminBusinessList.tsx`).
- **Interface Admin**:
  - Restauração do logotipo original (`logo.svg`) na Sidebar.
  - Melhoria na legibilidade de textos em tabelas e formulários.

### Corrigido
- **Bug de Renderização em Inputs**: Correção de inputs que ficavam brancos no modo escuro devido a limitações do Tailwind com variáveis CSS e opacidade.
