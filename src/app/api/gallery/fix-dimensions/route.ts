import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import sharp from 'sharp'

/**
 * API Route to fix missing width/height on existing gallery photos.
 * Fetches each image that lacks dimensions, detects real size via sharp,
 * and updates the database.
 * 
 * Only accessible by admin users.
 * 
 * Usage: POST /api/gallery/fix-dimensions
 */
export async function POST() {
    try {
        const supabase = await createClient()

        // 1. Verify admin
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

        // 2. Get all photos with missing or zero dimensions
        const { data: photos, error: fetchError } = await supabase
            .from('gallery_photos')
            .select('id, image_url, width, height')
            .or('width.is.null,width.eq.0,height.is.null,height.eq.0')

        if (fetchError) throw fetchError

        if (!photos || photos.length === 0) {
            return NextResponse.json({
                message: 'All photos already have dimensions',
                updated: 0,
                total: 0
            })
        }

        let updated = 0
        let errors = 0

        // 3. Process each photo
        for (const photo of photos) {
            try {
                // Fetch the image
                const response = await fetch(photo.image_url)
                if (!response.ok) {
                    console.warn(`Failed to fetch image ${photo.id}: ${response.status}`)
                    errors++
                    continue
                }

                const buffer = Buffer.from(await response.arrayBuffer())

                // Get real dimensions using sharp
                const metadata = await sharp(buffer).metadata()
                const width = metadata.width || 0
                const height = metadata.height || 0

                if (width > 0 && height > 0) {
                    // Update the database
                    const { error: updateError } = await supabase
                        .from('gallery_photos')
                        .update({ width, height })
                        .eq('id', photo.id)

                    if (updateError) {
                        console.error(`Failed to update photo ${photo.id}:`, updateError)
                        errors++
                    } else {
                        updated++
                        console.log(`Updated photo ${photo.id}: ${width}x${height}`)
                    }
                }
            } catch (err) {
                console.error(`Error processing photo ${photo.id}:`, err)
                errors++
            }
        }

        return NextResponse.json({
            message: `Dimension fix complete`,
            total: photos.length,
            updated,
            errors
        })

    } catch (error: any) {
        console.error('Fix dimensions error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
