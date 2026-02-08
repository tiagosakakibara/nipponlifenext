
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllSettings() {
    const { data, error } = await supabase.from('site_settings').select('key');
    if (error) {
        console.error('Error:', error);
    } else {
        // Log unique keys to understand the structure
        console.log('Available Keys:', data.map(d => d.key));
    }
}

checkAllSettings();
