'use server';

import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

function generateSlug(title: string, company: string): string {
    return `${title}-${company}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export async function uploadJobFile(formData: FormData): Promise<{ url: string } | { error: string }> {
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'businesses';

    if (!file || file.size === 0) return { error: 'Arquivo inválido' };
    if (file.size > 10 * 1024 * 1024) return { error: 'Arquivo muito grande (máximo 10MB)' };

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) return { error: 'Tipo de arquivo não permitido' };

    try {
        const admin = getAdminClient();
        const ext = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`;
        const filePath = `${folder}/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await admin.storage
            .from('media')
            .upload(filePath, buffer, { contentType: file.type });

        if (uploadError) return { error: uploadError.message };

        const { data: { publicUrl } } = admin.storage.from('media').getPublicUrl(filePath);
        return { url: publicUrl };
    } catch (e: any) {
        console.error('Upload Error:', e);
        return { error: `Erro ao fazer upload: ${e.message || JSON.stringify(e)}` };
    }
}

export async function submitJobForm(formData: FormData): Promise<{ success: true; id: string } | { error: string }> {
    try {
        const admin = getAdminClient();

        const title = formData.get('title') as string;
        const company_name = formData.get('company_name') as string;
        const prefecture = formData.get('prefecture') as string;
        const city = formData.get('city') as string;
        const job_type = formData.get('job_type') as string;
        const description = formData.get('description') as string;

        if (!title || !company_name || !prefecture || !description) {
            return { error: 'Preencha todos os campos obrigatórios.' };
        }

        // Slug único
        let slug = generateSlug(title, company_name);
        let uniqueSlug = slug;
        let counter = 1;
        while (true) {
            const { data: existing } = await admin.from('jobs').select('id').eq('slug', uniqueSlug).single();
            if (!existing) break;
            counter++;
            uniqueSlug = `${slug}-${counter}`;
        }

        // requirements: linhas separadas por \n
        const requirements_raw = formData.get('requirements') as string;
        const requirements = requirements_raw
            ? requirements_raw.split('\n').map(s => s.trim()).filter(Boolean)
            : [];

        // tags: vírgula separada
        const tags_raw = formData.get('tags') as string;
        const tags = tags_raw
            ? tags_raw.split(',').map(s => s.trim()).filter(Boolean)
            : [];

        // pay_rate_yen
        const pay_rate_raw = formData.get('pay_rate_yen') as string;
        const pay_rate_yen = pay_rate_raw ? parseInt(pay_rate_raw, 10) : null;

        const expires_at_raw = formData.get('expires_at') as string;

        const record = {
            slug: uniqueSlug,
            status: 'draft' as const,
            featured: false,

            title,
            company_name,
            prefecture,
            city: city || null,
            job_type: job_type || 'full-time',
            description,
            requirements,
            benefits: [],
            tags,

            salary_text: (formData.get('salary_text') as string) || null,
            bonus_text: (formData.get('bonus_text') as string) || null,
            pay_rate_yen: pay_rate_yen || null,
            pay_unit: (formData.get('pay_unit') as string) || 'hour',
            pay_text: (formData.get('pay_text') as string) || null,

            application_mode: 'internal_form' as const,
            application_url: (formData.get('application_url') as string) || null,
            application_whatsapp: (formData.get('application_whatsapp') as string) || null,
            // contact = email da empreiteira para receber candidaturas
            contact: (formData.get('contact_email') as string) || null,

            cover_image_url: (formData.get('cover_image_url') as string) || null,
            expires_at: expires_at_raw || null,
        };

        const { data, error } = await admin.from('jobs').insert([record]).select().single();
        if (error) return { error: error.message };

        return { success: true, id: data.id };
    } catch (e: any) {
        return { error: e?.message || 'Erro inesperado' };
    }
}
