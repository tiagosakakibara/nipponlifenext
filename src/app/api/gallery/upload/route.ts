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
        const albumId = formData.get('albumId') as string

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        if (!albumId) {
            return NextResponse.json({ error: 'Album ID required' }, { status: 400 })
        }

        // 3. Convert image to WebP using sharp
        const fileBuffer = await file.arrayBuffer()
        const inputBuffer = Buffer.from(fileBuffer)

        let outputBuffer: Buffer
        let contentType: string
        let fileExt: string
        let imageWidth = 0
        let imageHeight = 0

        try {
            // Convert to WebP with quality 80 (good balance between quality and size)
            const sharpInstance = sharp(inputBuffer)
            const metadata = await sharpInstance.metadata()
            imageWidth = metadata.width || 0
            imageHeight = metadata.height || 0

            outputBuffer = await sharpInstance
                .webp({ quality: 80 })
                .toBuffer()
            contentType = 'image/webp'
            fileExt = 'webp'
        } catch (conversionError) {
            console.warn('WebP conversion failed, uploading original:', conversionError)
            // Fallback: upload original if conversion fails
            outputBuffer = inputBuffer
            contentType = file.type
            fileExt = file.name.split('.').pop() || 'jpg'
        }

        // 4. Upload to storage
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `gallery/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('gallery')
            .upload(filePath, outputBuffer, {
                contentType,
                upsert: false
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return NextResponse.json({ error: uploadError.message }, { status: 500 })
        }

        const { data: { publicUrl } } = supabase.storage
            .from('gallery')
            .getPublicUrl(filePath)

        // 5. Record in DB (including dimensions for proper lightbox display)
        const originalName = file.name.split('.')[0]
        const insertData: any = {
            album_id: albumId,
            user_id: user.id,
            image_url: publicUrl,
            title: originalName,
            status: 'published'
        }
        if (imageWidth > 0) insertData.width = imageWidth
        if (imageHeight > 0) insertData.height = imageHeight

        const { data, error: dbError } = await supabase
            .from('gallery_photos')
            .insert([insertData])
            .select()
            .single()

        if (dbError) {
            console.error('Database error:', dbError)
            // Try to clean up the uploaded file
            await supabase.storage.from('gallery').remove([filePath])
            return NextResponse.json({ error: dbError.message }, { status: 500 })
        }

        return NextResponse.json({
            id: data.id,
            image_url: data.image_url,
            title: data.title,
            status: data.status,
            created_at: data.created_at
        })

    } catch (error: any) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
