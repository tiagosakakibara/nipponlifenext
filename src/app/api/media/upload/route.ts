import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
    try {
        // 1. Verify user is authenticated and is admin
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 2. Get form data
        const formData = await request.formData()
        const file = formData.get('file') as File
        const folder = formData.get('folder') as string || 'gallery'

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // 3. Process and Upload
        let fileBuffer = Buffer.from(await file.arrayBuffer())
        let mimeType = file.type
        let fileName = file.name
        let fileExt = fileName.split('.').pop()?.toLowerCase() || ''

        // Convert to WebP if it's an image and NOT a logo
        const isImage = file.type.startsWith('image/')
        const isLogo = folder.includes('logo') || folder === 'logos'
        const isSvgorGif = mimeType === 'image/svg+xml' || mimeType === 'image/gif'

        if (isImage && !isLogo && !isSvgorGif) {
            console.log('🖼️ Converting image to WebP:', fileName)
            fileBuffer = await sharp(fileBuffer)
                .webp({ quality: 80 })
                .toBuffer()

            // Adjust metadata for the new format
            mimeType = 'image/webp'
            fileExt = 'webp'
            const baseName = fileName.replace(/\.[^/.]+$/, "")
            fileName = `${baseName}_${Date.now()}.webp`
        } else {
            // Standard randomization for non-converted files
            const random = Math.random().toString(36).substring(2)
            fileName = `${random}_${Date.now()}.${fileExt}`
        }

        const filePath = `${folder}/${fileName}`
        const bucket = folder === 'gallery' ? 'gallery' : 'media'

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, fileBuffer as any, {
                contentType: mimeType,
                upsert: false
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return NextResponse.json({ error: uploadError.message }, { status: 500 })
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath)

        // 4. Record in DB
        const { data, error: dbError } = await supabase
            .from('media')
            .insert([{
                bucket: bucket,
                path: filePath,
                public_url: publicUrl,
                mime_type: mimeType,
                size_bytes: fileBuffer.length,
                created_by: user.id
            }])
            .select()
            .single()

        if (dbError) {
            console.error('Database error:', dbError)
            // Try to clean up the uploaded file
            await supabase.storage.from(bucket).remove([filePath])
            return NextResponse.json({ error: dbError.message }, { status: 500 })
        }

        return NextResponse.json({
            id: data.id,
            url: publicUrl,
            name: fileName,
            type: mimeType,
            size: fileBuffer.length,
            createdAt: data.created_at
        })

    } catch (error: any) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
