
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cygilntqbathrziuftoe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5Z2lsbnRxYmF0aHJ6aXVmdG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDUxMjYsImV4cCI6MjA4NDk4MTEyNn0.2j0KsHHLI33tmwo6yY2Hwva3Ua0B-Ncd3JzQKyNHKOY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsersWithRole() {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    // Print JSON of each item separately to avoid large buffer issues
    console.log('[');
    for (let i = 0; i < profiles.length; i++) {
        const p = profiles[i];
        console.log(JSON.stringify(p, null, 2) + (i < profiles.length - 1 ? ',' : ''));
    }
    console.log(']');
}

listUsersWithRole();
