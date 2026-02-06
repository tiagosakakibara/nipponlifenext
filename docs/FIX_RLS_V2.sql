/*
 * CORREÇÃO DEFINITIVA DE PERMISSÕES (V2)
 * 
 * Se a correção anterior não funcionou, é porque a tabela de perfis ('profiles') também tem restrições de segurança
 * que impedem o banco de ler sua função de admin dentro da política.
 * 
 * SOLUÇÃO: Criar uma "Função de Segurança" que ignora as restrições para verificar seu cargo.
 * 
 * 1. Copie este código e rode no SQL Editor do Supabase.
 */

-- 1. Cria função segura para checar admin/editor (Ignora RLS da tabela profiles)
CREATE OR REPLACE FUNCTION public.check_gallery_admin_role()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Roda com permissões de dono do banco
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor')
  );
END;
$$;

-- 2. Atualiza Políticas de ÁLBUNS
DROP POLICY IF EXISTS "Admins can update any gallery album" ON public.gallery_albums;
CREATE POLICY "Admins can update any gallery album" ON public.gallery_albums
FOR UPDATE TO authenticated
USING (check_gallery_admin_role());

DROP POLICY IF EXISTS "Admins can delete any gallery album" ON public.gallery_albums;
CREATE POLICY "Admins can delete any gallery album" ON public.gallery_albums
FOR DELETE TO authenticated
USING (check_gallery_admin_role());

-- 3. Atualiza Políticas de FOTOS (Botão Hide/Publish)
DROP POLICY IF EXISTS "Admins can update any gallery photo" ON public.gallery_photos;
CREATE POLICY "Admins can update any gallery photo" ON public.gallery_photos
FOR UPDATE TO authenticated
USING (check_gallery_admin_role());

DROP POLICY IF EXISTS "Admins can delete any gallery photo" ON public.gallery_photos;
CREATE POLICY "Admins can delete any gallery photo" ON public.gallery_photos
FOR DELETE TO authenticated
USING (check_gallery_admin_role());

-- 4. Garante permissões básicas
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.gallery_albums TO authenticated;
GRANT ALL ON public.gallery_photos TO authenticated;
