# Sistema de Galeria - ColorFlux Box Storage

## 📸 Visão Geral

O sistema de galeria do NipponLife foi implementado para armazenar **todas as fotos no servidor ColorfulBox** (Japão), aproveitando os **683.59 GB de espaço em disco** disponível, enquanto mantém apenas os metadados e URLs no banco de dados Supabase.

## 🏗️ Arquitetura

### **Armazenamento de Arquivos**

- **Servidor**: ColorfulBox (Tóquio, Japão)
- **Localização**: `public_html/uploads/media/gallery/`
- **Acesso**: Via PHP API (`/api/upload.php`)

### **Banco de Dados (Supabase)**

Armazena apenas metadados:

- `gallery_albums` - Informações dos álbuns
- `gallery_photos` - Metadados das fotos + URL do ColorfulBox
- `gallery_album_stats` - View com estatísticas

## 🔄 Fluxo de Upload

```
Frontend (React)
    ↓
galleryService.uploadPhoto(file)
    ↓
storageService.uploadFile(file, 'gallery')
    ↓
[Detecta Ambiente]
    ↓
┌─────────────────────────────────────┐
│ PRODUÇÃO (nippon-life.com)          │
│ → uploadToLocalAPI()                │
│ → POST /api/upload.php              │
│ → Salva em /uploads/media/gallery/  │
│ → Retorna URL do ColorfulBox        │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ DESENVOLVIMENTO (localhost)         │
│ → uploadToSupabase() [Fallback]    │
│ → Supabase Storage temporário       │
└─────────────────────────────────────┘
    ↓
galleryService.createPhoto()
    ↓
Salva URL + metadados no Supabase
```

## 📁 Estrutura de Pastas no ColorfulBox

```text
public_html/
├── uploads/
│   └── media/
│       ├── gallery/                    ← FOTOS DA GALERIA
│       │   ├── user_abc123/            ← Fotógrafo 1
│       │   │   ├── album_xyz789/       ← Álbum: Hanami 2026
│       │   │   │   ├── foto1.jpg
│       │   │   │   ├── foto2.jpg
│       │   │   │   └── foto3.jpg
│       │   │   └── album_def456/       ← Álbum: Festival de Verão
│       │   │       ├── foto1.jpg
│       │   │       └── foto2.jpg
│       │   ├── user_ghi789/            ← Fotógrafo 2
│       │   │   └── album_abc123/       ← Álbum: Casamento
│       │   │       ├── foto1.jpg
│       │   │       └── foto2.jpg
│       │   └── user_jkl012/            ← Fotógrafo 3
│       │       └── album_mno345/       ← Álbum: Matsuri
│       │           └── foto1.jpg
│       ├── posts/                      ← Imagens de posts
│       ├── businesses/                 ← Fotos de negócios
│       ├── community/                  ← Fotos da comunidade
│       └── ...
```

**Benefícios da Organização por Usuário:**

- ✅ Fácil identificação de fotos por fotógrafo
- ✅ Gerenciamento individual de espaço
- ✅ Backup seletivo por usuário
- ✅ Controle de quota por fotógrafo
- ✅ Migração/remoção simplificada
- ✅ Organização por álbum dentro de cada usuário

## 🗄️ Estrutura do Banco de Dados

### `gallery_albums`

```sql
CREATE TABLE gallery_albums (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE,
    cover_photo_id UUID REFERENCES gallery_photos(id),
    created_by UUID REFERENCES auth.users(id),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### `gallery_photos`

```sql
CREATE TABLE gallery_photos (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    album_id UUID REFERENCES gallery_albums(id),
    title TEXT,
    description TEXT,
    image_url TEXT NOT NULL,  -- URL do ColorfulBox!
    width INTEGER,
    height INTEGER,
    tags TEXT[],
    status TEXT CHECK (status IN ('draft', 'published')),
    exif JSONB,  -- Metadados da câmera
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Exemplo de `image_url`:**

```text
https://nippon-life.com/uploads/media/gallery/user_abc123/album_xyz789/foto1.jpg
```

## 💻 Código de Exemplo

### Upload de Foto

```typescript
import { galleryService } from '../services/galleryService';
import { supabase } from '../lib/supabaseClient';

// Obter o ID do usuário logado
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id;

// ID do álbum (obtido ao criar/selecionar álbum)
const albumId = 'uuid-do-album';

// 1. Upload do arquivo com organização por usuário e álbum
const file = event.target.files[0];
const imageUrl = await galleryService.uploadPhoto(file, userId, albumId);
// Retorna: "https://nippon-life.com/uploads/media/gallery/user_abc123/album_xyz789/foto1.jpg"

// 2. Criar registro no banco
const photo = await galleryService.createPhoto({
    image_url: imageUrl,
    user_id: userId,
    album_id: albumId,
    title: 'Evento Hanami 2026',
    width: 1920,
    height: 1080,
    status: 'published'
});
```

### Buscar Álbuns

```typescript
// Busca álbuns públicos com estatísticas
const albums = await galleryService.getAlbums();
// Retorna: Array de GalleryAlbumWithStats

// Cada álbum contém:
// - Dados do álbum
// - photo_count (número de fotos)
// - last_photo_added (data da última foto)
```

## 🎨 Componentes Frontend

### `GalleryAlbumCard`

- Exibe card animado do álbum
- Busca foto de capa via `cover_photo_id`
- Mostra contagem de fotos e data do evento
- Efeitos: parallax, hover, glassmorphism

### `HomePage` - Seção de Galeria

- Carrossel horizontal
- Limite de 6 álbuns
- Filtro de álbuns públicos
- Loading skeleton
- Estado vazio

## 🚀 Deploy

### Quando fazer deploy

1. Build do projeto: `npm run build`
2. Compactar pasta `dist` em ZIP
3. Upload via cPanel File Manager
4. Extrair no `public_html`

### Arquivos importantes

- ✅ `api/upload.php` - Handler de upload
- ✅ `uploads/` - Pasta de mídia (criar se não existir)

### Permissões necessárias

```bash
chmod 755 /uploads
chmod 755 /uploads/media
chmod 755 /uploads/media/gallery
```

## 🔒 Segurança

### Upload.php

- ✅ CORS configurado
- ✅ Validação de extensões permitidas
- ✅ Sanitização de nomes de pasta
- ✅ Geração de nomes únicos
- ⚠️ TODO: Adicionar autenticação via secret key

### Extensões Permitidas

```php
$allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'pdf', 'mp3', 'wav', 'svg'];
```

## 📊 Benefícios

1. **Custo**: Aproveita os 683GB do ColorfulBox (já pago)
2. **Performance**: Servidor no Japão = baixa latência
3. **Escalabilidade**: Muito espaço para crescimento
4. **Simplicidade**: PHP nativo, sem dependências
5. **Backup**: Controle total dos arquivos

## 🔧 Manutenção

### Verificar espaço em disco

- Acessar cPanel → File Manager
- Ver uso de disco no dashboard

### Limpar fotos antigas

```sql
-- Buscar fotos não publicadas há mais de 30 dias
SELECT * FROM gallery_photos 
WHERE status = 'draft' 
AND created_at < NOW() - INTERVAL '30 days';
```

### Migrar fotos do Supabase (se necessário)

```typescript
// Script de migração (executar uma vez)
const photos = await supabase.from('gallery_photos').select('*');
for (const photo of photos) {
    if (photo.image_url.includes('supabase')) {
        // Download da foto do Supabase
        // Upload para ColorfulBox
        // Atualizar URL no banco
    }
}
```

## 📝 Notas Importantes

1. **Desenvolvimento Local**:
   - Usa Supabase Storage como fallback
   - Fotos não ficam no ColorfulBox durante dev

2. **Produção**:
   - Todas as fotos vão para ColorfulBox
   - URLs sempre apontam para `nippon-life.com`

3. **DNS**:
   - Apenas `.com` tem DNS configurado
   - URLs `.net` são convertidas para `.com`

4. **Compatibilidade**:
   - Sistema funciona com ou sem Supabase Storage
   - Fallback automático em caso de erro

## 🎯 Próximos Passos

- [ ] Implementar autenticação no upload.php
- [ ] Adicionar compressão de imagens
- [ ] Criar sistema de thumbnails
- [ ] Implementar CDN (opcional)
- [ ] Adicionar watermark automático
- [ ] Sistema de backup automático
