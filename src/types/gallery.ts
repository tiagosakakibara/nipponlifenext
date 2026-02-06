export interface GalleryAlbum {
    id: string;
    title: string;
    title_ja: string | null;
    title_en: string | null;
    description: string | null;
    description_ja: string | null;
    description_en: string | null;
    event_date: string | null;
    cover_photo_id: string | null;
    created_by: string;
    is_public: boolean;
    status: 'draft' | 'pending' | 'published';
    created_at: string;
    updated_at: string;
    view_count: number;
    custom_author_name: string | null;
}

export interface GalleryAlbumInsert {
    title: string;
    title_ja?: string;
    title_en?: string;
    description?: string;
    description_ja?: string;
    description_en?: string;
    event_date?: string;
    is_public?: boolean;
    status?: 'draft' | 'pending' | 'published';
    cover_photo_id?: string | null;
    custom_author_name?: string | null;
}

export interface GalleryAlbumWithStats extends GalleryAlbum {
    photo_count: number;
    last_photo_added: string | null;
    view_count: number;
    // Creator profile fields
    creator_name: string | null;
    creator_username: string | null;
    creator_avatar: string | null;
}

export interface GalleryPhoto {
    id: string;
    user_id: string;
    album_id: string | null;
    title: string;
    description: string | null;
    image_url: string;
    width: number;
    height: number;
    tags: string[];
    status: 'draft' | 'published';
    exif: {
        camera?: string;
        lens?: string;
        iso?: string;
        aperture?: string;
        shutter_speed?: string;
        focal_length?: string;
    };
    created_at: string;
    updated_at: string;
}

export interface GalleryPhotoInsert {
    title?: string;
    description?: string;
    image_url: string;
    width: number;
    height: number;
    album_id?: string;
    user_id?: string;
    tags?: string[];
    status?: 'draft' | 'published';
    exif?: GalleryPhoto['exif'];
}
