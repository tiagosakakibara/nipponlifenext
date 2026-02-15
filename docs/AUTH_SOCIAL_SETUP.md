# Configuração de Login Social (Google)

Este guia descreve como configurar a autenticação social com Google no Supabase e no projeto NipponLife.

> [!IMPORTANT]
> A URL de callback para redirecionamento é: `https://<SEU-PROJETO>.supabase.co/auth/v1/callback`

## 1. Configuração no Supabase

1. Acesse o **Dashboard do Supabase** > **Authentication** > **Providers**.
2. Habilite **Google**.
3. Em cada provedor, desative a opção "Skip nonce checks" se estiver habilitada (padrão é desativado).
4. Adicione a URL de redirecionamento do Site no Supabase:
   - Vá em **Authentication** > **URL Configuration**.
   - Em **Site URL**, coloque a URL de produção (ex: `https://nippon-life.com`).
   - Em **Redirect URLs**, adicione:
     - `http://localhost:3000/auth/callback` (Desenvolvimento — porta padrão do Next.js)
     - `https://nippon-life.com/auth/callback` (Produção)

## 2. Configuração do Google Cloud Platform

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um novo projeto ou selecione um existente.
3. Configure a **Tela de consentimento OAuth** (OAuth consent screen):
   - Tipo de usuário: **Externo**.
   - Preencha os dados obrigatórios (nome do app, email, etc).
4. Crie as credenciais:
   - Vá em **Credenciais** > **Criar credenciais** > **ID do cliente OAuth**.
   - Tipo de aplicativo: **Aplicação da Web**.
   - **Origens JavaScript autorizadas**:
     - `https://<SEU-PROJETO>.supabase.co`
   - **URIs de redirecionamento autorizados**:
     - `https://<SEU-PROJETO>.supabase.co/auth/v1/callback`
5. Copie o **ID do cliente** e a **Chave secreta do cliente** e cole no painel do Supabase (Provider Google).

## 3. Variáveis de Ambiente

Nenhuma variável de ambiente adicional é necessária no frontend (`.env`), pois o client do Supabase já utiliza a URL e Anon Key existentes para comunicar com os provedores configurados no backend.

## Troubleshooting

- **Erro "Redirect URL mismatch" ou "redirect_uri_mismatch"**:
  - Verifique se `http://localhost:3000/auth/callback` está EXATAMENTE assim na lista de Redirect URLs do Supabase.
  - Verifique se a URL de callback do Supabase está correta no console do Google.

- **Login social não retorna para a página certa**:
  - Verifique o valor de `redirectTo` no arquivo `src/contexts/AuthContext.tsx`. Ele deve apontar para `/auth/callback`.

- **Botão não aparece ou não faz nada**:
  - Verifique o console do navegador. Se houver erro de "Provider not enabled", habilite o provider no Supabase.

- **Erro "Não é possível acessar esse site" (localhost recusado) após deploy**:
  - Isso acontece porque o Supabase está redirecionando para a URL padrão (Site URL) que provavelmente está configurada como `localhost:3000`.
  - **Solução**: Adicione a URL de produção (**`https://nippon-life.com/auth/callback`**) na lista de **Redirect URLs** no **Dashboard do Supabase** > **Authentication** > **URL Configuration**.
