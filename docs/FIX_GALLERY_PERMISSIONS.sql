/*
 * SCRIPT DE CORREÇÃO DE PERMISSÕES PARA GALERIA (RLS)
 * 
 * PROBLEMA: Admins ou Editores recebem erro "new row violates row-level security policy" (código 42501)
 * ao tentar salvar edições ou excluir álbuns que não foram criados por eles.
 * 
 * SOLUÇÃO: Execute este script no SQL Editor do Supabase para conceder as permissões necessárias.
 */

-- 1. Permissões para ÁLBUNS
DROP POLICY IF EXISTS "Admins can update any gallery album" ON public.gallery_albums;
CREATE POLICY "Admins can update any gallery album" 
ON public.gallery_albums 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);

DROP POLICY IF EXISTS "Admins can delete any gallery album" ON public.gallery_albums;
CREATE POLICY "Admins can delete any gallery album" 
ON public.gallery_albums 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);

-- 2. Permissões para FOTOS
DROP POLICY IF EXISTS "Admins can update any gallery photo" ON public.gallery_photos;
CREATE POLICY "Admins can update any gallery photo" 
ON public.gallery_photos 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);

DROP POLICY IF EXISTS "Admins can delete any gallery photo" ON public.gallery_photos;
CREATE POLICY "Admins can delete any gallery photo" 
ON public.gallery_photos 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);
