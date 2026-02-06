# Quill Editor Implementation Guide

## 📝 Overview

O projeto NipponLife agora utiliza o **React Quill** como editor WYSIWYG principal para criação e edição de posts. Esta mudança foi implementada para fornecer uma experiência de edição mais robusta e confiável.

## 🎯 Por que React Quill?

- **Score de 91/100** no benchmark (melhor que TipTap: 82.7)
- **Muito estável e maduro** - biblioteca amplamente testada
- **Fácil de usar** - interface intuitiva
- **Boa documentação** - 29 code snippets disponíveis
- **Suporte completo a HTML** - aceita e renderiza HTML corretamente

## 📦 Instalação

```bash
npm install react-quill quill
```

## 🔧 Componente QuillEditor

### Localização

`src/components/QuillEditor.tsx`

### Props

```typescript
interface QuillEditorProps {
    content: string;           // Conteúdo HTML
    onChange: (html: string) => void;  // Callback quando o conteúdo muda
    placeholder?: string;      // Texto placeholder
    className?: string;        // Classes CSS adicionais
}
```

### Uso Básico

```tsx
import { QuillEditor } from '../components';

function MyComponent() {
    const [content, setContent] = useState('');

    return (
        <QuillEditor
            content={content}
            onChange={setContent}
            placeholder="Digite aqui..."
            className="min-h-[500px]"
        />
    );
}
```

### 🔧 Modo Fonte HTML

O QuillEditor agora inclui um **botão de alternância HTML** que permite editar o código HTML diretamente!

#### Como usar

1. **Clique no botão "HTML"** no canto superior direito do editor
2. **Cole ou edite o HTML** diretamente no editor de código
3. **Clique em "Visual"** para voltar ao modo WYSIWYG

#### Benefícios

- ✅ **Cole HTML complexo** sem quebrar a formatação
- ✅ **Edite tags HTML** diretamente quando necessário
- ✅ **Corrija problemas** de formatação manualmente
- ✅ **Copie HTML** de outras fontes facilmente
- ✅ **Syntax highlighting** com fonte monoespaçada

#### Exemplo de uso

```html
<!-- Cole HTML como este diretamente no modo HTML -->
<article>
  <header>
    <h1>Título da Notícia</h1>
    <strong>Categoria / Data</strong>
  </header>
  <p>Conteúdo do artigo...</p>
</article>
```

## 🎨 Recursos do Editor

### Toolbar Completa

O editor inclui uma toolbar com os seguintes recursos:

#### Formatação de Texto

- **Headers**: H1, H2, H3, H4, H5, H6
- **Fonte**: Seleção de família de fonte
- **Tamanho**: Small, Normal, Large, Huge
- **Estilos**: Bold, Italic, Underline, Strike
- **Cores**: Cor do texto e cor de fundo
- **Script**: Subscript e Superscript

#### Estrutura

- **Listas**: Ordenadas e não ordenadas
- **Indentação**: Aumentar/diminuir
- **Alinhamento**: Esquerda, Centro, Direita, Justificado
- **Blockquote**: Citações
- **Code Block**: Blocos de código

#### Mídia

- **Link**: Inserir/editar links
- **Imagem**: Inserir imagens (URL)
- **Vídeo**: Inserir vídeos (URL)

#### Utilitários

- **Limpar Formatação**: Remove toda formatação

## 🎨 Estilos Customizados

O componente QuillEditor inclui estilos customizados que:

- ✅ Seguem o design system do NipponLife
- ✅ Suportam dark mode
- ✅ São responsivos (mobile-first)
- ✅ Integram com as variáveis CSS do projeto

### Variáveis CSS Utilizadas

```css
--nl-bg          /* Background principal */
--nl-surface     /* Background secundário */
--nl-border      /* Cor das bordas */
--nl-text        /* Texto primário */
--nl-text-2      /* Texto secundário */
--nl-text-3      /* Texto terciário */
--nl-accent      /* Cor de destaque (vermelho) */
```

## 📍 Onde está implementado

O QuillEditor está sendo usado em:

1. **AdminPostNew.tsx** - Criação de novos posts
   - Editor principal (português)
   - Editor de tradução (japonês)
   - Editor de tradução (inglês)

2. **AdminPostEdit.tsx** - Edição de posts existentes
   - Editor principal (português)
   - Editor de tradução (japonês)
   - Editor de tradução (inglês)

## 🔄 Migração do TipTap

### Mudanças Principais

**Antes (TipTap):**

```tsx
import { RichTextEditor } from '../../components';

<RichTextEditor
    content={formData.content || ''}
    onChange={(html) => setFormData({ ...formData, content: html })}
    placeholder="Start writing..."
    className="min-h-[500px]"
/>
```

**Depois (Quill):**

```tsx
import { QuillEditor } from '../../components';

<QuillEditor
    content={formData.content || ''}
    onChange={(html: string) => setFormData({ ...formData, content: html })}
    placeholder="Start writing..."
    className="min-h-[500px]"
/>
```

### Diferenças Importantes

1. **Type Safety**: O callback `onChange` agora tem tipo explícito `(html: string)`
2. **HTML Puro**: Quill trabalha diretamente com HTML (não usa JSON como TipTap)
3. **Estilos Inline**: Quill inclui seus próprios estilos CSS que precisam ser importados

## 🎯 Renderização no Frontend

O conteúdo HTML gerado pelo Quill é renderizado nas páginas públicas usando `dangerouslySetInnerHTML`:

```tsx
<div
    className="prose dark:prose-invert prose-lg max-w-none"
    dangerouslySetInnerHTML={{ __html: content }}
/>
```

### Classes Prose

O projeto usa Tailwind Typography (`prose`) para estilizar o HTML renderizado:

- `prose`: Estilos base
- `dark:prose-invert`: Estilos para dark mode
- `prose-lg`: Tamanho de fonte maior
- `max-w-none`: Remove limite de largura

## 🔒 Segurança

⚠️ **IMPORTANTE**: O uso de `dangerouslySetInnerHTML` requer cuidados:

1. **Sanitização**: Todo HTML deve ser sanitizado antes de ser salvo
2. **Validação**: Apenas administradores autenticados podem criar/editar posts
3. **RLS**: Row Level Security no Supabase protege contra edições não autorizadas

## 🐛 Troubleshooting

### Editor não aparece

- Verifique se `react-quill/dist/quill.snow.css` está importado em `main.tsx`
- Verifique se há erros no console do navegador

### Estilos quebrados

- Certifique-se de que as variáveis CSS do NipponLife estão definidas
- Verifique se não há conflitos com outros estilos globais

### Conteúdo não salva

- Verifique se o callback `onChange` está sendo chamado
- Verifique se o estado está sendo atualizado corretamente
- Verifique os logs do Supabase para erros de banco de dados

## 📚 Recursos Adicionais

- [React Quill Documentation](https://github.com/zenoamaro/react-quill)
- [Quill.js Documentation](https://quilljs.com/docs/)
- [Quill Formats](https://quilljs.com/docs/formats/)
- [Quill Modules](https://quilljs.com/docs/modules/)

## 🚀 Próximos Passos

Possíveis melhorias futuras:

1. **Upload de Imagens**: Integrar com Supabase Storage para upload direto
2. **Autosave**: Implementar salvamento automático
3. **Colaboração**: Adicionar edição colaborativa em tempo real
4. **Templates**: Criar templates de conteúdo pré-formatados
5. **Sanitização**: Adicionar biblioteca de sanitização HTML (DOMPurify)

---

**Última atualização**: 2026-01-29
**Versão do React Quill**: 2.x
**Versão do Quill**: 1.x
