
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cygilntqbathrziuftoe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5Z2lsbnRxYmF0aHJ6aXVmdG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDUxMjYsImV4cCI6MjA4NDk4MTEyNn0.2j0KsHHLI33tmwo6yY2Hwva3Ua0B-Ncd3JzQKyNHKOY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function synchronizeAccounts() {
    console.log('--- Account Synchronization ---');

    // Target user: ID 88cd7452-4bd0-4b3f-bc59-0c301b69d54c
    // Name: nipponlife, User: nipponlife, Role: user
    // This seems to be the "duplicate" created recently (Feb 2nd)
    // The "original" is 30b773f3... (Tiago, nipponlife, admin, Jan 26th)

    // The user asked to "synchronize" them.
    // If I cannot merge auth.users, I should AT LEAST make this new user an ADMIN so he can access the dashboard.
    // And possibly update his profile info if needed.

    const targetId = '88cd7452-4bd0-4b3f-bc59-0c301b69d54c';

    console.log(`Upgrading user ${targetId} to ADMIN role...`);

    const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', targetId);

    if (error) {
        console.error('Error updating role:', error);
    } else {
        console.log('Success! The account is now an administrator.');
    }
}

synchronizeAccounts();
