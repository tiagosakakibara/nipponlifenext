/*
 * FIX: Add MISSING SELECT policies for Gallery Albums and Photos
 * 
 * Issue: 
 * When setting an album to "Private", or marking a photo as "Draft", 
 * the database update succeeds, but the subsequent SELECT (to return the new data) fails 
 * because there are no policies allowing Admins/Owners to view Private/Draft items.
 * Only 'Public' items were viewable.
 */

-- 1. Policies for ALBUMS (SELECT)

-- Allow Admins/Editors to view ALL albums (including Private)
DROP POLICY IF EXISTS "Admins can view any gallery album" ON public.gallery_albums;
CREATE POLICY "Admins can view any gallery album" 
ON public.gallery_albums 
FOR SELECT 
TO authenticated 
USING (
  check_gallery_admin_role()
);

-- Allow Users (Creators) to view THEIR OWN albums (including Private)
DROP POLICY IF EXISTS "Users can view their own albums" ON public.gallery_albums;
CREATE POLICY "Users can view their own albums" 
ON public.gallery_albums 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = created_by
);

-- 2. Policies for PHOTOS (SELECT)

-- Allow Admins/Editors to view ALL photos (including Drafts)
DROP POLICY IF EXISTS "Admins can view any gallery photo" ON public.gallery_photos;
CREATE POLICY "Admins can view any gallery photo" 
ON public.gallery_photos 
FOR SELECT 
TO authenticated 
USING (
  check_gallery_admin_role()
);

-- Allow Users to view THEIR OWN photos (including Drafts)
DROP POLICY IF EXISTS "Users can view their own photos" ON public.gallery_photos;
CREATE POLICY "Users can view their own photos" 
ON public.gallery_photos 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = user_id
);
