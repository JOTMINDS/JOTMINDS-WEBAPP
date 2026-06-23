const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = 'https://femvnconxoefpctiptkj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA';
const supabase = createClient(supabaseUrl, supabaseKey);

const STUDENTS = [
  { name: 'Kofi Annan', email: 'kofi@stpeter.edu', phone: '0201111111' },
  { name: 'Ama Serwaa', email: 'ama@stpeter.edu', phone: '0202222222' },
  { name: 'Kwame Nkrumah', email: 'kwame@stpeter.edu', phone: '0203333333' },
  { name: 'Yaa Asantewaa', email: 'yaa@stpeter.edu', phone: '0204444444' },
  { name: 'Abena Osei', email: 'abena@stpeter.edu', phone: '0205555555' }
];

async function seedStudents() {
  console.log('Signing in as Headmaster...');
  const { data: { user: adminUser }, error: adminErr } = await supabase.auth.signInWithPassword({
    email: 'headmaster@stpeter.edu',
    password: 'StPeterJotminds2026!'
  });

  if (adminErr) {
    console.error('Error signing in admin:', adminErr);
    return;
  }

  const { data: inst } = await supabase
    .from('institutions')
    .select('id, code')
    .eq('admin_id', adminUser.id)
    .single();

  if (!inst) {
    console.error('Institution not found');
    return;
  }

  const studentIds = [];

  for (const s of STUDENTS) {
    console.log(`Creating auth user for ${s.name}...`);
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: s.email,
      password: 'StPeterJotminds2026!',
      options: { data: { name: s.name, role: 'student' } }
    });

    let userId;
    if (authErr && authErr.message.includes('already registered')) {
        const { data: loginData } = await supabase.auth.signInWithPassword({ email: s.email, password: 'StPeterJotminds2026!' });
        userId = loginData?.user?.id;
    } else if (!authErr) {
        userId = authData?.user?.id;
    }

    if (userId) studentIds.push({ ...s, id: userId });
  }

  // Login as admin again to insert members
  await supabase.auth.signInWithPassword({
    email: 'headmaster@stpeter.edu',
    password: 'StPeterJotminds2026!'
  });

  console.log('Inserting students into institution_members...');
  for (const s of studentIds) {
    const { error: insertErr } = await supabase.from('institution_members').upsert({
      institution_id: inst.id,
      user_id: s.id,
      user_name: s.name,
      user_email: s.email,
      user_phone: s.phone,
      role: 'student',
      joined_via_code: inst.code,
      status: 'approved',
      joined_at: new Date().toISOString()
    }, { onConflict: 'user_id, institution_id' });

    if (insertErr) {
      console.error(`Failed to insert ${s.name}:`, insertErr);
    } else {
      console.log(`Successfully added ${s.name} to institution!`);
    }
  }

  console.log('Dummy students seeded successfully!');
}

seedStudents();
