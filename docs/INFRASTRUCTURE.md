# Infraestrutura e Servidores

## Servidor Web e Hospedagem
- **Provedor:** ColorfulBox (Japão)
- **Painel de Controle:** cPanel
- **URL de Gerenciamento:** [https://secure.colorfulbox.jp/clientarea.php](https://secure.colorfulbox.jp/clientarea.php)
- **Localização:** Tóquio, Japão
- **Espaço em Disco:** ~683.59 GB (Plano com benefício de armazenamento estendido)

## Fluxo de Deploy (Build Manual)
Como o servidor é uma hospedagem compartilhada (cPanel), o deploy não é automático via Git. Siga estes passos:

1. **Gerar a Build localmente:**
   ```bash
   npm run build
   ```
2. **Preparar os arquivos:**
   A pasta `dist` será gerada. Você deve subir o conteúdo desta pasta para a raiz do seu site no cPanel (geralmente `public_html`).

## 🚀 Como subir a Build mais rápido?

Para evitar subir arquivo por arquivo via Gerenciador de Arquivos do cPanel (que é muito lento), utilize um destes métodos:

### 1. Método ZIP (Recomendado para cPanel)
1. Após o `npm run build`, compacte todo o conteúdo da pasta `dist` em um arquivo `.zip`.
2. No cPanel, use o **Gerenciador de Arquivos** para fazer o upload do único arquivo `dist.zip`.
3. Clique com o botão direito no arquivo e selecione **Extract**.
4. *Dica:* Isso é muito mais rápido que subir 500 arquivos pequenos individualmente.

### 2. Método FTP/SFTP (Profissional)
Subir via cliente de FTP (como **FileZilla** ou **WinSCP**) com múltiplas conexões simultâneas:
1. **Host:** `seu-servidor.colorfulbox.jp` (ou seu IP)
2. **Usuário/Senha:** Os mesmos do cPanel.
3. No FileZilla, vá em `Configurações > Transferências` e aumente "Transferências simultâneas máximas" para **10**. Isso acelera o processo consideravelmente.

### 3. Deploy via GitHub Actions (Automatizado)
Podemos configurar um script que, ao fazer `git push`, faz a build e envia via FTP automaticamente para a ColorfulBox. Se desejar, me peça para criar o arquivo `.github/workflows/deploy.yml`.

## Estratégia de Armazenamento de Mídia
Para aproveitar o custo-benefício e o grande espaço em disco do servidor ColorfulBox, decidimos centralizar arquivos pesados no servidor local em vez de utilizar o Supabase Storage:
- **Imagens/Áudios/Vídeos:** Armazenados localmente no servidor.

## Banco de Dados e Autenticação
- **Provedor:** Supabase
- **Região:** Tóquio (ap-northeast-1)
- **Finalidade:** Gestão de dados estruturados e autenticação.

## Notas de Implementação
- Os serviços de upload no frontend (React) devem ser adaptados para enviar arquivos diretamente para o servidor ColorfulBox via PHP em vez de utilizar a `supabase.storage`.
- As URLs de mídia devem apontar para o domínio principal (e.g., `https://nippon-life.com/uploads/...`).
