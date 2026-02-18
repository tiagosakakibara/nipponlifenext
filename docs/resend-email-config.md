# Configuração do Resend — Envio de Emails Transacionais

## Visão Geral

O NipponLife usa o [Resend](https://resend.com) para enviar emails transacionais automáticos.
O principal caso de uso é o **sistema de candidaturas**: quando um candidato se inscreve em uma vaga,
o Resend envia automaticamente os dados do candidato para o email da empreiteira.

---

## Variáveis de Ambiente

### `.env.local` (desenvolvimento local)

```env
RESEND_API_KEY=re_MT1MUimF_6LK6u8Uzqyyfc1rxgPiNsDwv
RESEND_FROM_EMAIL=candidaturas@nippon-life.com
```

### Vercel (produção)

As mesmas variáveis devem estar configuradas em:
**Vercel → Settings → Environment Variables → All Environments**

| Variável            | Valor                                   |
|---------------------|-----------------------------------------|
| `RESEND_API_KEY`    | `re_MT1MUimF_6LK6u8Uzqyyfc1rxgPiNsDwv` |
| `RESEND_FROM_EMAIL` | `candidaturas@nippon-life.com`          |

> ⚠️ Após alterar variáveis no Vercel, é necessário fazer **Redeploy** para as mudanças entrarem em vigor.

---

## Domínio Verificado

**Domínio:** `nippon-life.com`
**Região:** Tóquio (`ap-northeast-1`)
**Registrado em:** Resend → Domains

### Registros DNS adicionados (Colorfux DNS Manager)

| Nome                | Tipo | Valor                                                                                                                                                                                                                                      | Status        |
|---------------------|------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `resend._domainkey` | TXT  | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDIVTLJ9+xePsuRaD+MV5zDMBl8DpKcullJxwiA18ecQuV26PJe4uHV4ohrq32TLyiUTBGt5GYDfqqEgtMFaga94ws9wnGEoc0LoS7rKTaEt4uHx4ecjlSHEKGIzgSBQO03I9gI5bhcM6UeOkgEJdd8WA6oM+dxBlmIPikD8TakFwIDAQAB` | ✅ Verified    |
| `send`              | MX   | `10 feedback-smtp.ap-northeast-1.amazonses.com`                                                                                                                                                                                            | ✅ Verified    |
| `send`              | TXT  | `v=spf1 include:amazonses.com ~all`                                                                                                                                                                                                        | ✅ Verified    |
| `_dmarc`            | TXT  | `v=DMARC1; p=none;`                                                                                                                                                                                                                        | ✅ Adicionado  |

> **Provedor DNS:** Colorfux (`ns1.cbsv.jp` / `ns2.cbsv.jp`)
> **Domínio comprado em:** Stakeload (Brasil) — DNS transferido para Colorfux (Japão)

---

## Histórico de Alterações

| Data       | Alteração                                                          |
|------------|--------------------------------------------------------------------|
| 2025-02-18 | Instalação do pacote `resend@^6.9.2`                               |
| 2025-02-18 | Criação da Server Action `submitApplication.ts`                    |
| 2025-02-18 | `RESEND_API_KEY` configurada com chave real                        |
| 2025-02-18 | `RESEND_FROM_EMAIL` inicial: `onboarding@resend.dev` (temporário)  |
| 2025-02-18 | Registros DNS adicionados no Colorfux para `nippon-life.com`       |
| 2025-02-18 | Variáveis adicionadas no Vercel (All Environments)                 |
| 2025-02-18 | `RESEND_FROM_EMAIL` atualizado para `candidaturas@nippon-life.com` |
| 2025-02-18 | `replyTo` atualizado para `tiagosakakibara@gmail.com`              |
| 2025-02-18 | ✅ Todos os registros DNS verificados — domínio totalmente ativo    |

---

## Arquivos Relacionados

| Arquivo                                                          | Descrição                                                                       |
|------------------------------------------------------------------|---------------------------------------------------------------------------------|
| `src/app/actions/submitApplication.ts`                           | Server Action principal — busca email da vaga no Supabase e envia via Resend    |
| `src/app/[locale]/jobs/components/ApplyForm.tsx`                 | Formulário de candidatura — chama `submitApplication`                           |
| `src/app/[locale]/jobs/[id]/JobDetailsClient.tsx`                | Passa `jobId` para o `ApplyForm`                                                |
| `.env.local`                                                     | Variáveis de ambiente locais                                                    |

---

## Como Funciona o Fluxo

```
Candidato preenche ApplyForm
        ↓
submitApplication(jobId, data)  [Server Action]
        ↓
Busca job.contact (email da empreiteira) no Supabase
        ↓
Resend.emails.send()
  from:    candidaturas@nippon-life.com
  to:      [email da empreiteira]
  replyTo: tiagosakakibara@gmail.com
        ↓
Empreiteira recebe email com dados do candidato
(nome, WhatsApp, cidade, mensagem + botão "Abrir no WhatsApp")
```

---

## Renovação / Troca de Chave

Caso precise trocar a API Key do Resend:
1. Acesse [resend.com](https://resend.com) → **API Keys** → criar nova chave
2. Atualizar `RESEND_API_KEY` no `.env.local`
3. Atualizar `RESEND_API_KEY` no Vercel → **Redeploy**
4. Revogar a chave antiga no painel do Resend
