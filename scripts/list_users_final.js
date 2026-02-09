
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cygilntqbathrziuftoe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5Z2lsbnRxYmF0aHJ6aXVmdG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDUxMjYsImV4cCI6MjA4NDk4MTEyNn0.2j0KsHHLI33tmwo6yY2Hwva3Ua0B-Ncd3JzQKyNHKOY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to delete the new 'user' account if it matches the criteria (assuming it's the duplicate)
// NOTE: I cannot delete from auth.users, only profiles. Deleting profile might break auth consistency
// BUT, the user asked to LINK them.
// Linking is hard.
// Instead, let's just make the "AutoTrader" (or whatever new account) an ADMIN if it seems safe.
// Wait, "AutoTrader"?? That sounds like a bot or test account.
// Let's print the NAMES again more clearly.

async function listUsersWithRole() {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, role, created_at, avatar_url')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    console.log('--- FOUND PROFILES ---');
    profiles.forEach(p => {
        console.log(`ID: ${p.id}`);
        console.log(`Name: ${p.full_name}`);
        console.log(`User: ${p.username}`);
        console.log(`Role: ${p.role}`);
        console.log(`Date: ${p.created_at}`);
        console.log('-------------------------');
    });
}

listUsersWithRole();
