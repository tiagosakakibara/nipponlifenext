export interface JobBenefit {
    icon: string;
    label: string;
}

export type JobStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string[];
    requirements: string[];
    benefits: JobBenefit[];
    salary?: string;
    bonus?: string;
    tags: string[];
    type: 'full-time' | 'part-time' | 'contract' | 'temporary' | 'Full-time' | 'Part-time' | 'Contract' | 'Temporary';
    featured?: boolean;
    logo?: string;
    slug?: string;
    status: JobStatus;
    expires_at?: string;
    position_order?: number;

    // Technical fields
    created_at?: string;
    updated_at?: string;

    // Mapping from/to DB
    pay_rate_yen?: number;
    pay_unit?: 'hour' | 'day' | 'month';
    pay_text?: string;
    salary_text?: string;
    bonus_text?: string;
    prefecture?: string;
    city?: string;
    company_name?: string;
    cover_image_url?: string;
    categoryId?: string;
    application_mode?: 'internal_form' | 'external_url' | 'whatsapp';
    application_url?: string;
    application_whatsapp?: string;
    contact_phone1?: string;
    contact_phone2?: string;

    // Translation fields
    title_ja?: string;
    title_en?: string;
    description_ja?: string[];
    description_en?: string[];
    requirements_ja?: string[];
    requirements_en?: string[];
    salary_ja?: string;
    salary_en?: string;
    bonus_ja?: string;
    bonus_en?: string;
    location_ja?: string;
    location_en?: string;
    benefits_ja?: JobBenefit[];
    benefits_en?: JobBenefit[];
    view_count?: number;

    // For legacy/compatibility
    db_fields?: any;
}

export type JobFormData = Omit<Job, 'id' | 'created_at' | 'updated_at' | 'slug'> & {
    slug?: string;
};

export interface ApplyFormData {
    name: string;
    whatsapp: string;
    city?: string;
    message?: string;
}

export const JOB_LOCATIONS = [
    'Todas as regiões',
    'Aichi',
    'Tokyo',
    'Osaka',
    'Kanagawa',
    'Shizuoka',
    'Gunma',
    'Saitama',
];

export const JOB_TYPES = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'full-time', label: 'Tempo integral' },
    { value: 'part-time', label: 'Meio período' },
    { value: 'contract', label: 'Contrato' },
    { value: 'temporary', label: 'Temporário' },
];

export interface JobComment {
    id: string;
    job_id: string;
    author_id: string;
    content: string;
    created_at: string;
    author: {
        full_name?: string;
        username?: string;
        avatar_url?: string;
    };
}
