# Sistema de Galeria - Supabase Storage (Atualizado)

## 📸 Visão Geral

O sistema de galeria do NipponLife utiliza agora o **Supabase Storage** como padrão para armazenamento de fotos e mídia, substituindo a antiga arquitetura baseada no servidor ColorfulBox (que foi desativado).

## 🏗️ Arquitetura Atual

### **Armazenamento de Arquivos**

- **Serviço**: Supabase Storage
- **Buckets**:
  - `gallery`: Para fotos de álbuns de galeria.
  - `media`: Para posts, logos de empresas, vagas, etc.
- **Acesso**: Via API do Supabase (`storage-api`).

### **Banco de Dados (Supabase)**

O banco de dados armazena os metadados e as URLs das imagens.

- `gallery_albums`: Dados dos álbuns.
- `gallery_photos`: Metadados das fotos. A `image_url` pode ser uma URL completa do Supabase ou uma URL legada do ColorfulBox (que é reescrita automaticamente pelo frontend).

## 🔄 Fluxo de Upload

```
Frontend (React)
    ↓
galleryService.uploadPhoto(file)
    ↓
storageService.uploadFile(file, 'gallery')
    ↓
uploadToSupabase()
    ↓
Salva no Bucket 'gallery' do Supabase
    ↓
Retorna URL pública do Supabase
    ↓
galleryService.createPhoto()
    ↓
Salva URL + metadados no Banco de Dados
```

## ⚠️ Compatibilidade Legada (ColorfulBox)

Antigamente, as imagens eram salvas em `https://nippon-life.com/uploads/...`.
Como o servidor ColorfulBox foi desativado, o sistema agora possui um mecanismo de **Recuperação de URL** no `storageService.ts`:

1. Se a URL no banco de dados for `nippon-life.com/uploads/media/gallery/...`, o frontend detecta isso.
2. O sistema reescreve a URL para buscar o arquivo no Supabase Storage: `[supabase_url]/storage/v1/object/public/gallery/...`.
3. **Pré-requisito**: Os arquivos devem ter sido migrados para o bucket do Supabase mantendo a estrutura de nomes de arquivo.

## 🗄️ Estrutura no Supabase Storage

- **Bucket `gallery`**:
  - `user_abc123/album_xyz789/foto1.jpg`

- **Bucket `media`**:
  - `posts/foto_post.jpg`
  - `businesses/logo_empresa.png`

## 💻 Código de Exemplo (Atualizado)

### Upload de Foto

```typescript
import { galleryService } from '../services/galleryService';

// 1. Upload direto para Supabase
const imageUrl = await galleryService.uploadPhoto(file, userId, albumId);

// 2. Salvar no banco
await galleryService.createPhoto({
    image_url: imageUrl, // URL do Supabase
    ...
});
```

## 🚀 Migração

Se você ainda tem arquivos apontando para o servidor antigo e eles não aparecem:
1. Verifique se os arquivos foram copiados para o bucket `gallery` ou `media` no Supabase.
2. O `storageService` cuidará da reescrita da URL automaticamente.

## 🔧 Manutenção

Não é mais necessário gerenciar permissões de pasta ou PHP, pois tudo é gerenciado pelo Supabase.
Certifique-se de que os buckets `gallery` e `media` estejam configurados como **Public**.
