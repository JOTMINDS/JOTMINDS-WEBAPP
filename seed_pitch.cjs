const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://femvnconxoefpctiptkj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createDummyData() {
  console.log('Creating Admin/Headmaster account...');
  const { data: adminAuth, error: adminErr } = await supabase.auth.signUp({
    email: 'headmaster@stpeter.edu',
    password: 'StPeterJotminds2026!',
    options: {
      data: {
        name: 'Dr. Mensah',
        role: 'teacher' // headmaster counts as teacher in the app's user table
      }
    }
  });

  let adminUser;
  if (adminErr) {
    if (adminErr.message.includes('already registered')) {
        console.log('Admin already exists. Signing in...');
        const { data } = await supabase.auth.signInWithPassword({ email: 'headmaster@stpeter.edu', password: 'StPeterJotminds2026!' });
        adminUser = data.user;
    } else {
        console.error('Error creating admin:', adminErr);
        return;
    }
  } else {
    adminUser = adminAuth.user;
  }

  console.log('Admin User ID:', adminUser.id);

  console.log('Creating Teacher account...');
  const { data: teacherAuth, error: teacherErr } = await supabase.auth.signUp({
    email: 'teacher@stpeter.edu',
    password: 'StPeterJotminds2026!',
    options: {
      data: {
        name: 'Mr. Osei',
        role: 'teacher'
      }
    }
  });

  let teacherUser;
  if (teacherErr && teacherErr.message.includes('already registered')) {
    console.log('Teacher already exists. Signing in...');
    const { data } = await supabase.auth.signInWithPassword({ email: 'teacher@stpeter.edu', password: 'StPeterJotminds2026!' });
    teacherUser = data.user;
  } else if (teacherErr) {
    console.error('Error creating teacher:', teacherErr);
    return;
  } else {
    teacherUser = teacherAuth.user;
  }

  // To create the institution, we need to be logged in as the admin
  await supabase.auth.signInWithPassword({ email: 'headmaster@stpeter.edu', password: 'StPeterJotminds2026!' });

  const institutionId = require('crypto').randomUUID();
  const code = 'JOTM-PITCH';

  console.log('Inserting Institution...');
  const { error: instErr } = await supabase
    .from('institutions')
    .insert({
      id: institutionId,
      name: 'St. Peter\'s International School',
      type: 'SHS',
      address: '123 Education Lane',
      region: 'Greater Accra',
      district: 'Accra Metropolis',
      email: 'contact@stpeter.edu',
      phone: '0241234567',
      website: 'www.stpeter.edu',
      tagline: 'Excellence in Education',
      teacher_size: '51-200',
      student_size: '1001-5000',
      admin_id: adminUser.id,
      admin_name: 'Dr. Mensah',
      admin_email: 'headmaster@stpeter.edu',
      admin_phone: '0241234567',
      code: code,
      code_generated_at: new Date().toISOString(),
      code_expiry_days: null,
      is_active: true,
      email_verified: true,
      phone_verified: true,

      updated_at: new Date().toISOString()
    });

  if (instErr) {
    if (instErr.code === '23505') { // unique violation
      console.log('Institution already exists or code is taken.');
    } else {
      console.error('Error inserting institution:', instErr);
    }
  }

  console.log('Inserting Admin into institution_members...');
  await supabase.from('institution_members').insert({
    institution_id: institutionId,
    user_id: adminUser.id,
    user_name: 'Dr. Mensah',
    user_email: 'headmaster@stpeter.edu',
    user_phone: '0241234567',
    role: 'admin',
    joined_via_code: code,
    status: 'approved',
    joined_at: new Date().toISOString()
  });

  // Now login as teacher to join the school
  await supabase.auth.signInWithPassword({ email: 'teacher@stpeter.edu', password: 'StPeterJotminds2026!' });
  teacherUser = (await supabase.auth.getUser()).data.user;

  console.log('Inserting Teacher into institution_members...');
  await supabase.from('institution_members').insert({
    institution_id: institutionId,
    user_id: teacherUser.id,
    user_name: 'Mr. Osei',
    user_email: 'teacher@stpeter.edu',
    user_phone: '0209876543',
    role: 'teacher',
    joined_via_code: code,
    status: 'approved',
    joined_at: new Date().toISOString()
  });

  console.log('Seed completed successfully!');
}

createDummyData();
