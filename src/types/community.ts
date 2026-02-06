// ===== COMMUNITY TYPES =====

export interface CommunityQuestion {
    id: string;
    author_id: string;
    title: string;
    body: string;
    category: string | null;
    slug: string;
    status: 'active' | 'hidden' | 'deleted';
    created_at: string;
    updated_at: string;
    like_count?: number;
    share_count?: number;
    view_count?: number;
    // Joined data
    author?: {
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    };
    answers_count?: number;
}

export interface CommunityAnswer {
    id: string;
    question_id: string;
    author_id: string;
    body: string;
    status: 'active' | 'hidden' | 'deleted';
    created_at: string;
    updated_at: string;
    like_count?: number;
    share_count?: number;
    // Joined data
    author?: {
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    };
}

export interface CommunityPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    cover_image_url: string | null;
    category_id: string | null;
    author_id: string;
    status: 'draft' | 'published' | 'scheduled' | 'archived';
    published_at: string | null;
    scheduled_for: string | null;
    like_count: number;
    comment_count: number;
    view_count: number;
    share_count?: number;
    created_at: string;
    updated_at: string;
    // Joined data
    category_name?: string | null;
    author?: {
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    };
    tags?: string[];
}

export interface CommunityPostComment {
    id: string;
    post_id: string;
    author_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    like_count: number;
    // Joined data
    author?: {
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    };
}

export interface CommunityStats {
    members_count: number;
    questions_count: number;
    answers_count: number;
}

// Category colors for display
export const QUESTION_CATEGORY_COLORS: Record<string, string> = {
    'Visto e imigração': 'bg-[#003768]',
    'Saúde e seguros': 'bg-[#5593C3]',
    'Trabalho': 'bg-[#D70F24]',
    'Moradia': 'bg-[#2E7D32]',
    'Documentos e registros': 'bg-[#6B5B95]',
    'Convivência e cultura': 'bg-[#E65100]',
    'Outros': 'bg-gray-500',
};

export const QUESTION_CATEGORIES = [
    'Visto e imigração',
    'Saúde e seguros',
    'Trabalho',
    'Moradia',
    'Documentos e registros',
    'Convivência e cultura',
    'Outros',
] as const;

export type QuestionCategory = typeof QUESTION_CATEGORIES[number];

export interface CostOfLivingEntry {
    id: string;
    created_at: string;
    user_id: string;
    month_key: string;
    prefecture_code: string;
    city: string | null;
    job_category: string;
    employment_type: string | null;
    household_size: number;
    hourly_wage: number;
    monthly_net_income: number | null;
    rent: number;
    utilities: number;
    internet_phone: number;
    food: number;
    transport: number;
    health_insurance: number;
    pension: number;
    other_essentials: number;
    currency: string;
    notes: string | null;
    status: 'pending' | 'approved' | 'rejected';
    approved_at: string | null;
    approved_by: string | null;
}

export type CostOfLivingPayload = Omit<CostOfLivingEntry, 'id' | 'created_at' | 'approved_at' | 'approved_by'>;
