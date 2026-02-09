
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cygilntqbathrziuftoe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5Z2lsbnRxYmF0aHJ6aXVmdG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDUxMjYsImV4cCI6MjA4NDk4MTEyNn0.2j0KsHHLI33tmwo6yY2Hwva3Ua0B-Ncd3JzQKyNHKOY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllUsers() {
    console.log('--- Listing ALL Profiles ---');

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, role, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    profiles.forEach(p => {
        console.log(`[${p.created_at.substring(0, 10)}] Name: ${p.full_name?.padEnd(20)} | User: @${(p.username || 'null').padEnd(15)} | Role: ${p.role?.padEnd(6)} | ID: ${p.id}`);
    });
}

listAllUsers();
