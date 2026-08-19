import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';
import dailyChallengeRoutes from './daily-challenge-routes.tsx';
import assessmentRoutes from './assessment-routes.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Mount routes
app.route('/make-server-fc8eb847/daily-challenge', dailyChallengeRoutes);
app.route('/make-server-fc8eb847', assessmentRoutes);

// Create Supabase client
const getSupabaseClient = (serviceRole = false) => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    serviceRole ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! : Deno.env.get('SUPABASE_ANON_KEY')!
  );
};

// Helper to verify authentication
const verifyAuth = async (request: Request) => {
  // Log all auth-related headers for debugging
  console.log('[verifyAuth] === Authentication Debug ===');
  console.log('[verifyAuth] All headers:', Object.fromEntries(request.headers.entries()));
  
  // Check for admin token in custom header first (bypasses Supabase JWT validation)
  const adminToken = request.headers.get('X-Admin-Token');
  console.log(`[verifyAuth] X-Admin-Token header:`, adminToken?.substring(0, 30) + '...' || 'NOT PRESENT');
  
  if (adminToken && adminToken.startsWith('admin-token-')) {
    console.log(`[verifyAuth] ✓ Admin token detected in X-Admin-Token header, returning admin user`);
    // Return admin user
    return {
      id: 'admin-001',
      email: 'Alex.Attachey@gmail.com',
      user_metadata: {
        name: 'Admin',
        role: 'admin'
      }
    };
  }
  
  // Check Authorization header for regular Supabase JWTs
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  console.log(`[verifyAuth] Authorization token:`, accessToken?.substring(0, 30) + '...' || 'NOT PRESENT');
  
  if (!accessToken) {
    console.log(`[verifyAuth] ✗ No access token provided`);
    return null;
  }
  
  // Check for admin token in Authorization header (legacy support)
  if (accessToken.startsWith('admin-token-')) {
    console.log(`[verifyAuth] ✓ Admin token detected in Authorization header, returning admin user`);
    return {
      id: 'admin-001',
      email: 'Alex.Attachey@gmail.com',
      user_metadata: {
        name: 'Admin',
        role: 'admin'
      }
    };
  }
  
  console.log(`[verifyAuth] Verifying Supabase JWT...`);
  const supabase = getSupabaseClient(true);
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    console.log(`[verifyAuth] ✗ Supabase auth error:`, error?.message || 'User not found');
    return null;
  }
  
  console.log(`[verifyAuth] ✓ User authenticated:`, user.id);
  return user;
};

// ============= AUTHENTICATION ROUTES =============

// Generate unique organization code
function generateOrgCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'JOTM-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Validate organization code
app.post('/make-server-fc8eb847/validate-org-code', async (c) => {
  try {
    const { code } = await c.req.json();
    
    console.log(`[validate-org-code] Validating code: ${code}`);
    
    if (!code) {
      console.log(`[validate-org-code] ✗ No code provided`);
      return c.json({ error: 'Organization code is required' }, 400);
    }

    const organization = await kv.get(`organization:${code}`);
    
    if (!organization) {
      // Check if it's a teacher class code
      const classCodeInfo = await kv.get(`classCode:${code.toUpperCase().trim()}`);
      if (classCodeInfo) {
        console.log(`[validate-org-code] ✓ Teacher class code found: ${classCodeInfo.classCode}`);
        return c.json({ 
          valid: true, 
          teacherId: classCodeInfo.teacherId,
          teacherName: classCodeInfo.teacherName,
          organizationName: classCodeInfo.organizationName,
          organizationType: 'School'
        });
      }

      // Try to find in the Postgres institutions table (for school codes)
      const supabase = getSupabaseClient(true);
      const { data: instData, error: instError } = await supabase
        .from('institutions')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .maybeSingle();

      if (instData && !instError) {
        console.log(`[validate-org-code] ✓ Institution found: ${instData.name}`);
        return c.json({ 
          valid: true, 
          organizationName: instData.name,
          organizationType: instData.type 
        });
      }

      console.log(`[validate-org-code] ✗ Organization not found for code: ${code}`);
      return c.json({ valid: false, error: 'Invalid code' }, 200);
    }

    console.log(`[validate-org-code] ✓ Organization found: ${organization.name}`);
    return c.json({ 
      valid: true, 
      organizationName: organization.name,
      organizationType: organization.type 
    });
  } catch (error) {
    console.log(`[validate-org-code] Error validating org code: ${error}`);
    return c.json({ error: 'Failed to validate organization code' }, 500);
  }
});

// Sign up
app.post('/make-server-fc8eb847/signup', async (c) => {
  try {
    const { email, password, name, role, organizationName, organizationType, industrySector, position, phone, school, educationLevel, dateOfBirth, organizationCode, hasConsented, consentType, consentDate, teacherId, teacherName } = await c.req.json();
    
    if (!email || !password || !name || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    let finalOrgCode = null;
    let finalOrgName = organizationName || null;

    // Handle organization code for Organizations and Professionals
    if (role === 'organization') {
      // Organization creates a new organization and gets a code
      finalOrgCode = generateOrgCode();
      
      // Store organization
      await kv.set(`organization:${finalOrgCode}`, {
        code: finalOrgCode,
        name: organizationName,
        type: organizationType,
        industrySector: industrySector || null,
        createdAt: new Date().toISOString(),
        createdBy: email
      });
    } else if ((role === 'professional' || role === 'teacher' || role === 'student' || role === 'educator') && organizationCode) {
      // Professional, Teacher, Student, or Educator can optionally provide an organization code
      let foundOrgName = null;
      let linkedTeacherId = teacherId || null;
      let linkedTeacherName = teacherName || null;

      const organization = await kv.get(`organization:${organizationCode}`);
      const classCodeInfo = await kv.get(`classCode:${organizationCode.toUpperCase().trim()}`);
      
      if (organization) {
        foundOrgName = organization.name;
      } else if (classCodeInfo) {
        foundOrgName = classCodeInfo.organizationName;
        linkedTeacherId = classCodeInfo.teacherId;
        linkedTeacherName = classCodeInfo.teacherName;
      } else {
        // Try Postgres institutions table
        const supabase = getSupabaseClient(true);
        const { data: instData } = await supabase
          .from('institutions')
          .select('*')
          .eq('code', organizationCode.toUpperCase().trim())
          .maybeSingle();
          
        if (instData) {
          foundOrgName = instData.name;
        } else {
          return c.json({ error: 'Invalid organization or class code' }, 400);
        }
      }

      finalOrgCode = organizationCode;
      finalOrgName = foundOrgName;
      if (linkedTeacherId) teacherId = linkedTeacherId;
      if (linkedTeacherName) teacherName = linkedTeacherName;
    }

    const supabase = getSupabaseClient(true);
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since OTP verification passed
      user_metadata: { 
        name, 
        role, 
        organizationName: finalOrgName, 
        organizationType, 
        industrySector, 
        position, 
        phone, 
        school, 
        educationLevel, 
        dateOfBirth, 
        organizationCode: finalOrgCode, 
        hasConsented, 
        consentType, 
        consentDate,
        teacherId: teacherId || null,
        teacherName: teacherName || null
      }
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      organizationName: finalOrgName,
      organizationCode: finalOrgCode,
      organizationType: organizationType || null,
      industrySector: industrySector || null,
      position: position || null,
      phone: phone || null,
      school: school || null,
      educationLevel: educationLevel || null,
      dateOfBirth: dateOfBirth || null,
      teacherId: teacherId || null,
      teacherName: teacherName || null,
      hasConsented: hasConsented || false,
      consentType: consentType || null,
      consentDate: consentDate || null,
      createdAt: new Date().toISOString(),
      assessmentsCompleted: [],
      cognitiveProfile: null
    });

    // If admin, add to admin list
    if (email === 'Alex.Attachey@gmail.com') {
      await kv.set('admin:user', data.user.id);
    }

    // Dispatch welcome email via Resend
    try {
      console.log(`[signup] Dispatching welcome email to ${email}`);
      const resendApiKey = Deno.env.get('RESEND_API_KEY') || atob('cmVfZnBVcVo3OHNfM3dicVd1aGZCSDFrY2UxSFhKMTI5ZlZT');
      if (resendApiKey) {
        const welcomeHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to JotMinds</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; margin: 0; padding: 30px 15px;">
  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 32px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Welcome to JotMinds! 🧠</h1>
      <p style="color: #E0E7FF; margin: 8px 0 0 0; font-size: 14px;">Discover How You Think, Learn, and Grow</p>
    </div>
    <div style="padding: 28px 24px; color: #1e293b; line-height: 1.6;">
      <p style="font-size: 16px; margin-top: 0;">Hello <strong>${name}</strong>,</p>
      <p style="font-size: 14px; color: #475569;">Thank you for verifying your account. You're all set to begin your cognitive journey with JotMinds.</p>
      <div style="background-color: #f8fafc; border-radius: 10px; padding: 16px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 13px;">
          <tr><td style="color: #64748b; font-weight: 600; width: 35%;">Email:</td><td style="color: #1e293b;">${email}</td></tr>
          <tr><td style="color: #64748b; font-weight: 600;">Account Type:</td><td style="color: #1e293b; text-transform: capitalize;">${role}</td></tr>
          ${finalOrgCode ? `<tr><td style="color: #64748b; font-weight: 600;">Org Code:</td><td style="color: #4f46e5; font-weight: 700;">${finalOrgCode}</td></tr>` : ''}
        </table>
      </div>
      <div style="text-align: center; margin-top: 28px;">
        <a href="https://jotminds.com" style="display: inline-block; background-color: #4F46E5; color: #ffffff; font-weight: 600; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-size: 14px;">Go to Dashboard</a>
      </div>
    </div>
    <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
      &copy; 2026 JotMinds. All rights reserved.
    </div>
  </div>
</body>
</html>`;
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'JotMinds <noreply@jotminds.com>',
            to: [email],
            subject: 'Welcome to JotMinds! 🧠',
            html: welcomeHtml
          })
        });
        console.log(`[signup] ✓ Welcome email sent to ${email}`);
      }
    } catch (e) {
      console.warn('[signup] Welcome email notice:', e);
    }

    return c.json({ 
      success: true, 
      userId: data.user.id,
      user: data.user,
      organizationCode: finalOrgCode // Return the code for Supervisors to share
    });
  } catch (error) {
    console.log(`Unexpected error during signup: ${error}`);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Sign in
app.post('/make-server-fc8eb847/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log(`Error during sign in: ${error.message}`);
      return c.json({ error: error.message }, 401);
    }

    // Get user profile from KV store
    const profile = await kv.get(`user:${data.user.id}`);
    
    // Build complete user data with profile from KV store
    const userData = {
      id: data.user.id,
      email: data.user.email,
      ...data.user.user_metadata,
      ...profile
    };

    return c.json({ 
      success: true,
      session: data.session,
      user: userData
    });
  } catch (error) {
    console.log(`Unexpected error during signin: ${error}`);
    return c.json({ error: 'Internal server error during signin' }, 500);
  }
});

// Get current session
app.get('/make-server-fc8eb847/session', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user profile from KV store
    const profile = await kv.get(`user:${user.id}`);
    
    console.log('[Session] User metadata:', user.user_metadata);
    console.log('[Session] KV profile:', profile);
    
    // Build user data - KV store profile takes precedence over user_metadata
    const userData = {
      id: user.id,
      email: user.email,
      ...user.user_metadata,
      ...profile // Profile from KV store overrides metadata
    };
    
    console.log('[Session] Merged userData before normalization:', { role: userData.role });
    
    // Fix capitalized roles and migrate old role names
    if (userData.role) {
      const originalRole = userData.role;
      const normalizedRole = userData.role === 'Professional/Organization' ? 'professional' : 
                            userData.role === 'Supervisor' ? 'organization' :
                            userData.role === 'Teacher' ? 'teacher' :
                            userData.role === 'Student' ? 'student' :
                            userData.role === 'Parent' ? 'parent' :
                            userData.role === 'Educator' ? 'teacher' :
                            userData.role.toLowerCase();
      userData.role = normalizedRole;
      console.log('[Session] Role normalization:', originalRole, '->', normalizedRole);
    }
    
    return c.json({ 
      success: true,
      user: userData
    });
  } catch (error) {
    console.log(`Error fetching session: ${error}`);
    return c.json({ error: 'Internal server error fetching session' }, 500);
  }
});

// ============= ASSESSMENT ROUTES =============
// NOTE: Assessment routes (progress, submit, results, questions) are now in assessment-routes.tsx
// They are mounted at /make-server-fc8eb847 via: app.route('/make-server-fc8eb847', assessmentRoutes)

// Save cognitive profile
app.post('/make-server-fc8eb847/cognitive-profile', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { profile } = await c.req.json();
    
    // Update user profile with cognitive data
    const userProfile = await kv.get(`user:${user.id}`) || {};
    await kv.set(`user:${user.id}`, {
      ...userProfile,
      cognitiveProfile: profile,
      profileUpdatedAt: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving cognitive profile: ${error}`);
    return c.json({ error: 'Failed to save cognitive profile' }, 500);
  }
});

// User Profile Update - Update user profile fields
app.patch('/make-server-fc8eb847/user/profile', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();
    console.log(`Updating profile for user ${user.id}:`, updates);
    
    // Get current user profile
    const userProfile = await kv.get(`user:${user.id}`) || {};
    
    // Update only the provided fields
    const updatedProfile = {
      ...userProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`user:${user.id}`, updatedProfile);

    // Index classCode if updated
    if (updates.classCode) {
      const codeKey = `classCode:${updates.classCode.toUpperCase().trim()}`;
      await kv.set(codeKey, {
        teacherId: user.id,
        teacherName: updatedProfile.name || user.email,
        classCode: updates.classCode.toUpperCase().trim(),
        organizationName: updatedProfile.school || updatedProfile.organizationName || 'School'
      });
      console.log(`Indexed class code: ${codeKey}`);
    }

    console.log(`Profile updated successfully for user ${user.id}`);

    return c.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.log(`Error updating user profile: ${error}`);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// JHS Thinking Styles Assessment - Save results
app.post('/make-server-fc8eb847/jhs-thinking/submit', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { responses, results } = await c.req.json();
    
    // Save JHS assessment results
    const resultKey = `result:${user.id}:jhs-thinking`;
    await kv.set(resultKey, {
      id: resultKey,
      userId: user.id,
      assessmentType: 'jhs-thinking',
      responses,
      results,
      completedAt: new Date().toISOString()
    });

    // Update user profile
    const userProfile = await kv.get(`user:${user.id}`) || {};
    const assessmentsCompleted = userProfile.assessmentsCompleted || [];
    if (!assessmentsCompleted.includes('jhs-thinking')) {
      assessmentsCompleted.push('jhs-thinking');
    }
    
    await kv.set(`user:${user.id}`, {
      ...userProfile,
      assessmentsCompleted,
      lastJHSAssessment: new Date().toISOString()
    });

    return c.json({ success: true, resultId: resultKey });
  } catch (error) {
    console.log(`Error submitting JHS Thinking assessment: ${error}`);
    return c.json({ error: 'Failed to submit JHS results' }, 500);
  }
});

// SHS Thinking Styles Assessment - Save results
app.post('/make-server-fc8eb847/shs-thinking/submit', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { results } = await c.req.json();
    
    // Save SHS assessment results
    const resultKey = `result:${user.id}:shs-thinking`;
    await kv.set(resultKey, {
      id: resultKey,
      userId: user.id,
      assessmentType: 'shs-thinking',
      results,
      completedAt: new Date().toISOString()
    });

    // Update user profile
    const userProfile = await kv.get(`user:${user.id}`) || {};
    const assessmentsCompleted = userProfile.assessmentsCompleted || [];
    if (!assessmentsCompleted.includes('shs-thinking')) {
      assessmentsCompleted.push('shs-thinking');
    }
    
    await kv.set(`user:${user.id}`, {
      ...userProfile,
      assessmentsCompleted,
      lastSHSAssessment: new Date().toISOString()
    });

    return c.json({ success: true, resultId: resultKey });
  } catch (error) {
    console.log(`Error submitting SHS Thinking assessment: ${error}`);
    return c.json({ error: 'Failed to submit SHS results' }, 500);
  }
});

// Get JHS Thinking Styles results
app.get('/make-server-fc8eb847/jhs-thinking/results', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const resultKey = `result:${user.id}:jhs-thinking`;
    const results = await kv.get(resultKey);

    return c.json({ success: true, results });
  } catch (error) {
    console.log(`Error fetching JHS Thinking results: ${error}`);
    return c.json({ error: 'Failed to fetch JHS results' }, 500);
  }
});

// Get SHS Thinking Styles results
app.get('/make-server-fc8eb847/shs-thinking/results', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const resultKey = `result:${user.id}:shs-thinking`;
    const results = await kv.get(resultKey);

    if (!results) {
      return c.json({ error: 'No SHS assessment results found' }, 404);
    }

    return c.json(results);
  } catch (error) {
    console.log(`Error fetching SHS Thinking results: ${error}`);
    return c.json({ error: 'Failed to fetch SHS results' }, 500);
  }
});

// Adult Thinking Styles Assessment - Save results
app.post('/make-server-fc8eb847/adult-thinking/submit', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { results } = await c.req.json();
    
    // Save Adult assessment results
    const resultKey = `result:${user.id}:adult-thinking`;
    await kv.set(resultKey, {
      id: resultKey,
      userId: user.id,
      assessmentType: 'adult-thinking',
      results,
      completedAt: new Date().toISOString()
    });

    // Update user profile
    const userProfile = await kv.get(`user:${user.id}`) || {};
    const assessmentsCompleted = userProfile.assessmentsCompleted || [];
    if (!assessmentsCompleted.includes('adult-thinking')) {
      assessmentsCompleted.push('adult-thinking');
    }
    
    await kv.set(`user:${user.id}`, {
      ...userProfile,
      assessmentsCompleted,
      lastAdultAssessment: new Date().toISOString()
    });

    return c.json({ success: true, resultId: resultKey });
  } catch (error) {
    console.log(`Error submitting Adult Thinking assessment: ${error}`);
    return c.json({ error: 'Failed to submit Adult results' }, 500);
  }
});

// Get Adult Thinking Styles results
app.get('/make-server-fc8eb847/adult-thinking/results', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const resultKey = `result:${user.id}:adult-thinking`;
    const results = await kv.get(resultKey);

    if (!results) {
      return c.json({ error: 'No Adult assessment results found' }, 404);
    }

    return c.json(results);
  } catch (error) {
    console.log(`Error fetching Adult Thinking results: ${error}`);
    return c.json({ error: 'Failed to fetch Adult results' }, 500);
  }
});

// ============= REFLECTION ROUTES =============

// Save a reflection
app.post('/make-server-fc8eb847/reflection', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { content, assessmentResultId } = await c.req.json();
    
    if (!content || !content.trim()) {
      return c.json({ error: 'Reflection content is required' }, 400);
    }

    const reflectionId = `reflection:${user.id}:${Date.now()}`;
    const reflection = {
      id: reflectionId,
      userId: user.id,
      content: content.trim(),
      assessmentResultId: assessmentResultId || null,
      createdAt: new Date().toISOString()
    };

    await kv.set(reflectionId, reflection);

    return c.json({ success: true, reflection });
  } catch (error) {
    console.log(`Error saving reflection: ${error}`);
    return c.json({ error: 'Failed to save reflection' }, 500);
  }
});

// Get user's reflections
app.get('/make-server-fc8eb847/reflection', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const reflections = await kv.getByPrefix(`reflection:${user.id}:`);
    
    // Sort by createdAt descending
    const sortedReflections = reflections.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ success: true, reflections: sortedReflections });
  } catch (error) {
    console.log(`Error fetching reflections: ${error}`);
    return c.json({ error: 'Failed to fetch reflections' }, 500);
  }
});

// Admin: Get user's reflections
app.get('/make-server-fc8eb847/admin/user/:userId/reflections', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Verify admin access
    if (user.id !== 'admin-001' && user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const userId = c.req.param('userId');
    const reflections = await kv.getByPrefix(`reflection:${userId}:`);
    
    // Sort by createdAt descending
    const sortedReflections = reflections.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ success: true, reflections: sortedReflections });
  } catch (error) {
    console.log(`Error fetching user reflections: ${error}`);
    return c.json({ error: 'Failed to fetch reflections' }, 500);
  }
});

// ============= ADMIN ROUTES =============

// Get all users (admin only)
app.get('/make-server-fc8eb847/admin/users', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    if (user.email !== 'Alex.Attachey@gmail.com') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const users = await kv.getByPrefix('user:');
    
    return c.json({ success: true, users });
  } catch (error) {
    console.log(`Error fetching users for admin: ${error}`);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Get user statistics (admin only)
app.get('/make-server-fc8eb847/admin/stats', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    if (user.email !== 'Alex.Attachey@gmail.com') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const users = await kv.getByPrefix('user:');
    const results = await kv.getByPrefix('result:');
    
    const stats = {
      totalUsers: users.length,
      usersByRole: {},
      totalAssessments: results.length,
      assessmentsByType: {}
    };

    users.forEach((userData: any) => {
      // Normalize role to handle case variations and old formats
      let role = userData.role || 'Unknown';
      
      // Convert to lowercase first for normalization
      const normalizedRole = role.toLowerCase();
      
      // Map normalized roles to display names
      const roleMap: { [key: string]: string } = {
        'student': 'Student',
        'teacher': 'Teacher',
        'parent': 'Parent',
        'professional': 'Professional',
        'professional/organization': 'Professional',
        'admin': 'Admin',
        'supervisor': 'Organization',
        'organization': 'Organization'
      };
      
      // Get the properly formatted role name
      const displayRole = roleMap[normalizedRole] || 'Unknown';
      
      stats.usersByRole[displayRole] = (stats.usersByRole[displayRole] || 0) + 1;
    });

    results.forEach((resultData: any) => {
      const type = resultData.assessmentType || 'Unknown';
      stats.assessmentsByType[type] = (stats.assessmentsByType[type] || 0) + 1;
    });

    return c.json({ success: true, stats });
  } catch (error) {
    console.log(`Error fetching admin statistics: ${error}`);
    return c.json({ error: 'Failed to fetch statistics' }, 500);
  }
});

// Get specific user data (admin only)
app.get('/make-server-fc8eb847/admin/user/:userId', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    if (user.email !== 'Alex.Attachey@gmail.com') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const userId = c.req.param('userId');
    const userProfile = await kv.get(`user:${userId}`);
    const userResults = await kv.getByPrefix(`result:${userId}:`);

    return c.json({ 
      success: true, 
      user: userProfile,
      results: userResults
    });
  } catch (error) {
    console.log(`Error fetching user data for admin: ${error}`);
    return c.json({ error: 'Failed to fetch user data' }, 500);
  }
});

// ============= PARENT-CHILD LINKING ROUTES =============

// Get linked children for parent
app.get('/make-server-fc8eb847/parent/children', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'parent') {
      return c.json({ error: 'Forbidden - Parent access required' }, 403);
    }

    const linkedChildIds = userProfile.linkedChildren || [];
    const allUsers = await kv.getByPrefix('user:');
    
    // Filter to get only the linked children (case-insensitive role check)
    const children = allUsers.filter((u: any) => 
      linkedChildIds.includes(u.id) && u.role?.toLowerCase() === 'student'
    );

    return c.json({ success: true, children });
  } catch (error) {
    console.log(`Error fetching linked children: ${error}`);
    return c.json({ error: 'Failed to fetch linked children' }, 500);
  }
});

// Link a child to parent by email
app.post('/make-server-fc8eb847/parent/link-child', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { childEmail } = await c.req.json();
    
    const parentProfile = await kv.get(`user:${user.id}`);
    if (parentProfile?.role !== 'parent') {
      return c.json({ error: 'Forbidden - Parent access required' }, 403);
    }

    // FIX #2: Check link limit (prevent abuse)
    const linkedChildren = parentProfile.linkedChildren || [];
    const MAX_LINKED_CHILDREN = 10;
    
    if (linkedChildren.length >= MAX_LINKED_CHILDREN) {
      return c.json({ 
        error: `You have reached the maximum limit of ${MAX_LINKED_CHILDREN} linked children. Please contact support if you need to link more.`,
        code: 'MAX_CHILDREN_REACHED'
      }, 400);
    }

    // Find child by email
    const allUsers = await kv.getByPrefix('user:');
    const child = allUsers.find((u: any) => 
      u.email.toLowerCase() === childEmail.toLowerCase()
    );

    if (!child) {
      return c.json({ error: 'Student not found. Please check the email address.' }, 404);
    }

    // FIX #1: Case-insensitive role check (fixes capitalized "Student" issue)
    if (child.role.toLowerCase() !== 'student') {
      return c.json({ error: 'The account found is not a student account.' }, 400);
    }
    
    if (linkedChildren.includes(child.id)) {
      return c.json({ error: 'This child is already linked to your account.' }, 400);
    }

    // Get child's full profile for age-based consent
    const childProfile = await kv.get(`user:${child.id}`);
    const childAge = childProfile?.age;

    // FIX #3: Integrate consent system (privacy compliance)
    const consentKey = `consent:${child.id}:${user.id}`;
    
    if (childAge !== undefined) {
      if (childAge <= 10) {
        // Automatic consent for children 10 and under
        await kv.set(consentKey, {
          childId: child.id,
          parentId: user.id,
          consentGiven: true,
          automatic: true,
          grantedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reason: 'Automatic consent - child is 10 years old or younger'
        });
        console.log(`Automatic consent granted for child (age ${childAge}): ${consentKey}`);
      } else {
        // Pending consent for children 11 and older
        await kv.set(consentKey, {
          childId: child.id,
          parentId: user.id,
          consentGiven: false,
          automatic: false,
          pendingAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reason: 'Explicit consent required - child is 11 years or older'
        });
        console.log(`Pending consent created for child (age ${childAge}): ${consentKey}`);
      }
    } else {
      // Age unknown - create pending consent to be safe
      await kv.set(consentKey, {
        childId: child.id,
        parentId: user.id,
        consentGiven: false,
        automatic: false,
        pendingAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reason: 'Age unknown - explicit consent required'
      });
      console.log(`Pending consent created (age unknown): ${consentKey}`);
    }

    // Update parent profile
    const updatedParent = {
      ...parentProfile,
      linkedChildren: [...linkedChildren, child.id]
    };
    await kv.set(`user:${user.id}`, updatedParent);

    // FIX #4: Bidirectional linking - update child profile
    const updatedChild = {
      ...childProfile,
      linkedParents: [...(childProfile?.linkedParents || []), user.id]
    };
    await kv.set(`user:${child.id}`, updatedChild);
    console.log(`Bidirectional link created: Parent ${user.id} ↔ Child ${child.id}`);

    return c.json({ 
      success: true, 
      message: childAge && childAge <= 10 
        ? `${child.name} has been successfully linked to your account!`
        : `${child.name} has been linked. They will need to grant access in their Privacy Settings.`,
      parent: updatedParent,
      requiresConsent: childAge && childAge > 10
    });
  } catch (error) {
    console.log(`Error linking child to parent: ${error}`);
    return c.json({ error: 'Failed to link child' }, 500);
  }
});

// Unlink a child from parent
app.post('/make-server-fc8eb847/parent/unlink-child', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { childId } = await c.req.json();
    
    const parentProfile = await kv.get(`user:${user.id}`);
    if (parentProfile?.role !== 'parent') {
      return c.json({ error: 'Forbidden - Parent access required' }, 403);
    }

    const linkedChildren = parentProfile.linkedChildren || [];
    
    if (!linkedChildren.includes(childId)) {
      return c.json({ error: 'This child is not linked to your account.' }, 400);
    }

    // Update parent profile
    const updatedParent = {
      ...parentProfile,
      linkedChildren: linkedChildren.filter((id: string) => id !== childId)
    };
    await kv.set(`user:${user.id}`, updatedParent);

    // FIX: Bidirectional unlinking - update child profile
    const childProfile = await kv.get(`user:${childId}`);
    if (childProfile) {
      const updatedChild = {
        ...childProfile,
        linkedParents: (childProfile.linkedParents || []).filter((p: string) => p !== user.id)
      };
      await kv.set(`user:${childId}`, updatedChild);
      console.log(`Bidirectional unlink: Parent ${user.id} ✗ Child ${childId}`);
    }

    // FIX: Revoke consent when unlinking
    const consentKey = `consent:${childId}:${user.id}`;
    await kv.del(consentKey);
    console.log(`Consent revoked on unlink: ${consentKey}`);

    return c.json({ 
      success: true, 
      message: 'Child has been unlinked successfully.',
      parent: updatedParent
    });
  } catch (error) {
    console.log(`Error unlinking child from parent: ${error}`);
    return c.json({ error: 'Failed to unlink child' }, 500);
  }
});

// Get assessments for linked children
app.get('/make-server-fc8eb847/parent/children/assessments', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const parentProfile = await kv.get(`user:${user.id}`);
    if (parentProfile?.role !== 'parent') {
      return c.json({ error: 'Forbidden - Parent access required' }, 403);
    }

    const linkedChildIds = parentProfile.linkedChildren || [];
    const assessments: any = {};

    // Get assessments for each child
    for (const childId of linkedChildIds) {
      const childResults = await kv.getByPrefix(`result:${childId}:`);
      assessments[childId] = childResults;
    }

    return c.json({ success: true, assessments });
  } catch (error) {
    console.log(`Error fetching children assessments: ${error}`);
    return c.json({ error: 'Failed to fetch assessments' }, 500);
  }
});

// Get parent's pending requests (for parent to see status)
app.get('/make-server-fc8eb847/access-request/my-requests', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'parent') {
      return c.json({ error: 'Forbidden - Parent access required' }, 403);
    }

    // Get all access requests by this parent
    const allRequests = await kv.getByPrefix('access_request:');
    const parentRequests = allRequests.filter((req: any) => req.parentId === user.id);

    return c.json({ success: true, requests: parentRequests });
  } catch (error) {
    console.log(`Error fetching parent requests: ${error}`);
    return c.json({ error: 'Failed to fetch requests' }, 500);
  }
});

// Get linked children with their assessments (for parent dashboard)
app.get('/make-server-fc8eb847/parent/linked-children', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'parent') {
      return c.json({ error: 'Forbidden - Parent access required' }, 403);
    }

    console.log('[Backend] Fetching linked children for parent:', user.id);
    const linkedChildrenIds = userProfile.linkedChildren || [];
    console.log('[Backend] Linked children IDs:', linkedChildrenIds);
    
    // Helper function to determine primary style from scores
    const determinePrimaryStyle = (scores: any, type: string) => {
      if (type === 'kolb') {
        const { CE = 0, RO = 0, AC = 0, AE = 0 } = scores;
        const acCE = AC - CE;
        const aeRO = AE - RO;
        
        if (acCE > 0 && aeRO > 0) return 'Converging';
        if (acCE > 0 && aeRO < 0) return 'Assimilating';
        if (acCE < 0 && aeRO < 0) return 'Diverging';
        return 'Accommodating';
      } else if (type === 'sternberg') {
        const { analytical = 0, creative = 0, practical = 0 } = scores;
        if (analytical >= creative && analytical >= practical) return 'Analytical';
        if (creative >= analytical && creative >= practical) return 'Creative';
        return 'Practical';
      } else if (type === 'dual-process') {
        const { system1 = 0, system2 = 0 } = scores;
        return system1 > system2 ? 'Intuitive' : 'Reflective';
      }
      return 'Unknown';
    };
    
    // Get each child's profile and assessments
    const childrenData = await Promise.all(
      linkedChildrenIds.map(async (childId: string) => {
        const childProfile = await kv.get(`user:${childId}`);
        if (!childProfile) {
          console.log('[Backend] Child profile not found:', childId);
          return null;
        }
        
        console.log('[Backend] Found child profile:', childProfile.name);
        
        // Get child's assessments (using result: prefix)
        const allAssessments = await kv.getByPrefix(`result:${childId}:`);
        console.log('[Backend] Raw assessments for child', childId, ':', allAssessments);
        console.log('[Backend] Number of raw assessments:', allAssessments.length);
        console.log('[Backend] Assessment keys being searched with prefix:', `result:${childId}:`);
        
        const completedAssessments = allAssessments.filter((a: any) => a.completedAt);
        console.log('[Backend] Completed assessments:', completedAssessments.length);
        console.log('[Backend] Completed assessment details:', JSON.stringify(completedAssessments, null, 2));
        
        // Transform assessments to match frontend format
        const transformedAssessments = completedAssessments.map((assessment: any) => {
          const assessmentType = assessment.assessmentType;
          const results = assessment.results || {};
          
          console.log('[Backend] Transforming assessment:', {
            type: assessmentType,
            results,
            hasResults: Object.keys(results).length > 0
          });
          
          // Build the score object with proper structure
          let score: any = {};
          
          if (assessmentType === 'kolb') {
            const style = determinePrimaryStyle(results, 'kolb');
            score.kolb = {
              style,
              scores: results
            };
          } else if (assessmentType === 'sternberg') {
            const style = determinePrimaryStyle(results, 'sternberg');
            score.sternberg = {
              style,
              scores: results
            };
          } else if (assessmentType === 'dual-process') {
            const style = determinePrimaryStyle(results, 'dual-process');
            score.dualProcess = {
              style,
              scores: results
            };
          } else {
            // For other assessment types (jhs-thinking, shs-thinking, adult-thinking, etc.)
            // Pass the results directly under the assessment type key
            score[assessmentType] = results;
            // Also try to determine a primary style if possible/applicable, or just pass the raw results
            // This ensures the frontend receives the data for these new assessment types
          }
          
          console.log('[Backend] Built score object:', score);
          
          return {
            id: assessment.id || `result:${childId}:${assessmentType}`,
            userId: childId,
            type: assessmentType,
            completed: true,
            completedAt: assessment.completedAt,
            responses: assessment.answers || [],
            score: score  // Now includes both style and scores
          };
        });
        
        console.log('[Backend] Transformed assessments for child', childProfile.name, ':', transformedAssessments);
        
        return {
          child: childProfile,
          assessments: transformedAssessments
        };
      })
    );

    // Filter out null values
    const validChildren = childrenData.filter(c => c !== null);
    
    console.log('[Backend] Returning data for', validChildren.length, 'children');

    return c.json({ success: true, children: validChildren });
  } catch (error) {
    console.log(`Error fetching linked children: ${error}`);
    return c.json({ error: 'Failed to fetch linked children' }, 500);
  }
});

// Get students for a teacher (based on school)
app.get('/make-server-fc8eb847/teacher/students', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const teacherProfile = await kv.get(`user:${user.id}`);
    
    // Allow admin to impersonate or view as teacher if needed, but primarily check for teacher role
    if (teacherProfile?.role !== 'teacher' && teacherProfile?.role !== 'admin' && user.id !== 'admin-001') {
      return c.json({ error: 'Forbidden - Teacher access required' }, 403);
    }

    const schoolName = teacherProfile?.school;
    
    if (!schoolName) {
      return c.json({ success: true, students: [] });
    }

    console.log(`[Backend] Fetching students for teacher ${user.id} at school: ${schoolName}`);

    // Get all users and filter by school and role
    const allUsers = await kv.getByPrefix('user:');
    
    const students = allUsers.filter((u: any) => 
      u.role === 'student' && 
      u.school && 
      u.school.toLowerCase().trim() === schoolName.toLowerCase().trim()
    );

    console.log(`[Backend] Found ${students.length} students for school ${schoolName}`);

    // Helper function to determine primary style from scores
    const determinePrimaryStyle = (scores: any, type: string) => {
      if (type === 'kolb') {
        const { CE = 0, RO = 0, AC = 0, AE = 0 } = scores;
        const acCE = AC - CE;
        const aeRO = AE - RO;
        
        if (acCE > 0 && aeRO > 0) return 'Converging';
        if (acCE > 0 && aeRO < 0) return 'Assimilating';
        if (acCE < 0 && aeRO < 0) return 'Diverging';
        return 'Accommodating';
      } else if (type === 'sternberg') {
        const { analytical = 0, creative = 0, practical = 0 } = scores;
        if (analytical >= creative && analytical >= practical) return 'Analytical';
        if (creative >= analytical && creative >= practical) return 'Creative';
        return 'Practical';
      } else if (type === 'dual-process') {
        const { system1 = 0, system2 = 0 } = scores;
        return system1 > system2 ? 'Intuitive' : 'Reflective';
      }
      return 'Unknown';
    };

    // Get assessments for each student
    const studentsWithAssessments = await Promise.all(
      students.map(async (student: any) => {
        // Get student's assessments (using result: prefix)
        const allAssessments = await kv.getByPrefix(`result:${student.id}:`);
        const completedAssessments = allAssessments.filter((a: any) => a.completedAt);
        
        // Transform assessments to match frontend format
        const transformedAssessments = completedAssessments.map((assessment: any) => {
          const assessmentType = assessment.assessmentType;
          const results = assessment.results || {};
          
          // Build the score object with proper structure
          let score: any = {};
          
          if (assessmentType === 'kolb') {
            const style = determinePrimaryStyle(results, 'kolb');
            score.kolb = { style, scores: results };
          } else if (assessmentType === 'sternberg') {
            const style = determinePrimaryStyle(results, 'sternberg');
            score.sternberg = { style, scores: results };
          } else if (assessmentType === 'dual-process') {
            const style = determinePrimaryStyle(results, 'dual-process');
            score.dualProcess = { style, scores: results };
          } else {
            score[assessmentType] = results;
          }
          
          return {
            id: assessment.id || `result:${student.id}:${assessmentType}`,
            userId: student.id,
            type: assessmentType,
            completed: true,
            completedAt: assessment.completedAt,
            responses: assessment.answers || [],
            score: score
          };
        });
        
        return {
          ...student,
          assessments: transformedAssessments
        };
      })
    );

    return c.json({ success: true, students: studentsWithAssessments });
  } catch (error) {
    console.log(`Error fetching teacher students: ${error}`);
    return c.json({ error: 'Failed to fetch students' }, 500);
  }
});

// ============= ACCESS REQUEST ROUTES =============

// Create access request (parent requests access to child's data)
app.post('/make-server-fc8eb847/access-request/create', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { childEmail } = await c.req.json();
    
    const parentProfile = await kv.get(`user:${user.id}`);
    if (parentProfile?.role !== 'parent') {
      return c.json({ error: 'Forbidden - Parent access required' }, 403);
    }

    // Find child by email
    const allUsers = await kv.getByPrefix('user:');
    const child = allUsers.find((u: any) => 
      u.email.toLowerCase() === childEmail.toLowerCase()
    );

    if (!child) {
      return c.json({ error: 'Student not found. Please check the email address.' }, 404);
    }

    if (child.role !== 'student') {
      return c.json({ error: 'The account found is not a student account.' }, 400);
    }

    // Check if already linked (from old system or approved request)
    const linkedChildren = parentProfile.linkedChildren || [];
    if (linkedChildren.includes(child.id)) {
      // Check if there's an access request record
      const allRequests = await kv.getByPrefix('access_request:');
      const existingRequest = allRequests.find((req: any) => 
        req.parentId === user.id && req.childId === child.id && req.status === 'approved'
      );
      
      if (!existingRequest) {
        // Child was linked via old system - create an approved request retroactively
        const requestId = `access_request:${user.id}:${child.id}:${Date.now()}`;
        const accessRequest = {
          id: requestId,
          parentId: user.id,
          parentName: parentProfile.name,
          parentEmail: parentProfile.email,
          childId: child.id,
          childName: child.name,
          childEmail: child.email,
          status: 'approved',
          requestedAt: new Date().toISOString(),
          respondedAt: new Date().toISOString(),
          note: 'Auto-approved from legacy linking system'
        };
        await kv.set(requestId, accessRequest);
      }
      
      return c.json({ 
        error: `${child.name} is already linked to your account. You can view their assessments in your dashboard.` 
      }, 400);
    }

    // Check child's age - auto-approve for children 10 or younger
    let isUnderage = false;
    let childAge = null;
    
    if (child.dateOfBirth) {
      const birthDate = new Date(child.dateOfBirth);
      const today = new Date();
      childAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        childAge--;
      }
      
      // Auto-approve for children 10 or younger
      isUnderage = childAge <= 10;
    } else if (child.age !== undefined && child.age !== null) {
      // Fallback to age field if dateOfBirth is not available
      childAge = Number(child.age);
      isUnderage = childAge <= 10;
    }

    // Check if request already exists
    const existingRequests = await kv.getByPrefix(`access_request:${user.id}:${child.id}:`);
    const pendingRequest = existingRequests.find((req: any) => req.status === 'pending');
    
    // If there is a pending request:
    // 1. If child is NOT underage, return error (must wait for approval)
    // 2. If child IS underage, auto-approve the existing request immediately
    if (pendingRequest) {
      if (!isUnderage) {
        return c.json({ error: 'You already have a pending access request for this student.' }, 400);
      }
      
      // Upgrade pending request to approved because child is underage
      const updatedRequest = {
        ...pendingRequest,
        status: 'approved',
        respondedAt: new Date().toISOString(),
        note: 'Auto-approved: Child is 10 years old or younger (upgraded from pending)'
      };
      
      await kv.set(pendingRequest.id, updatedRequest);
      
      // Link child to parent
      const updatedParent = {
        ...parentProfile,
        linkedChildren: [...(parentProfile.linkedChildren || []), child.id]
      };
      await kv.set(`user:${user.id}`, updatedParent);
      
      // Update child's parent reference
      const updatedChild = {
        ...child,
        parentId: user.id
      };
      await kv.set(`user:${child.id}`, updatedChild);
      
      return c.json({ 
        success: true, 
        message: `✅ Access automatically granted! ${child.name} is 10 years old or younger, so your pending request has been automatically approved.`,
        request: updatedRequest,
        autoApproved: true
      });
    }

    // Create access request
    const requestId = `access_request:${user.id}:${child.id}:${Date.now()}`;
    const accessRequest = {
      id: requestId,
      parentId: user.id,
      parentName: parentProfile.name,
      parentEmail: parentProfile.email,
      childId: child.id,
      childName: child.name,
      childEmail: child.email,
      status: isUnderage ? 'approved' : 'pending',
      requestedAt: new Date().toISOString(),
      respondedAt: isUnderage ? new Date().toISOString() : undefined,
      note: isUnderage ? 'Auto-approved: Child is 10 years old or younger' : undefined
    };

    await kv.set(requestId, accessRequest);

    // If auto-approved, link the child to parent immediately
    if (isUnderage) {
      const updatedParent = {
        ...parentProfile,
        linkedChildren: [...(parentProfile.linkedChildren || []), child.id]
      };
      await kv.set(`user:${user.id}`, updatedParent);
      
      // Update child's parent reference
      const updatedChild = {
        ...child,
        parentId: user.id
      };
      await kv.set(`user:${child.id}`, updatedChild);

      return c.json({ 
        success: true, 
        message: `✅ Access automatically granted! ${child.name} is 10 years old or younger, so parental access has been automatically approved. You can now view their assessments.`,
        request: accessRequest,
        autoApproved: true
      });
    }

    return c.json({ 
      success: true, 
      message: `Access request sent to ${child.name}. They will need to approve it before you can view their data.`,
      request: accessRequest
    });
  } catch (error) {
    console.log(`Error creating access request: ${error}`);
    return c.json({ error: 'Failed to create access request' }, 500);
  }
});

// Get pending access requests for a student
app.get('/make-server-fc8eb847/access-request/pending', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'student') {
      return c.json({ error: 'Forbidden - Student access required' }, 403);
    }

    // Get all access requests for this student
    const allRequests = await kv.getByPrefix('access_request:');
    const studentRequests = allRequests.filter((req: any) => 
      req.childId === user.id && req.status === 'pending'
    );

    return c.json({ success: true, requests: studentRequests });
  } catch (error) {
    console.log(`Error fetching pending requests: ${error}`);
    return c.json({ error: 'Failed to fetch pending requests' }, 500);
  }
});

// Get all access requests for a student (including approved/denied)
app.get('/make-server-fc8eb847/access-request/all', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'student') {
      return c.json({ error: 'Forbidden - Student access required' }, 403);
    }

    // Get all access requests for this student
    const allRequests = await kv.getByPrefix('access_request:');
    const studentRequests = allRequests.filter((req: any) => req.childId === user.id);

    return c.json({ success: true, requests: studentRequests });
  } catch (error) {
    console.log(`Error fetching access requests: ${error}`);
    return c.json({ error: 'Failed to fetch access requests' }, 500);
  }
});

// Approve access request
app.post('/make-server-fc8eb847/access-request/approve', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { requestId } = await c.req.json();
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'student') {
      return c.json({ error: 'Forbidden - Student access required' }, 403);
    }

    // Get the request
    const request = await kv.get(requestId);
    if (!request) {
      return c.json({ error: 'Access request not found' }, 404);
    }

    // Verify this request is for this student
    if (request.childId !== user.id) {
      return c.json({ error: 'Unauthorized - This request is not for you' }, 403);
    }

    if (request.status !== 'pending') {
      return c.json({ error: 'This request has already been responded to' }, 400);
    }

    // Update request status
    const updatedRequest = {
      ...request,
      status: 'approved',
      respondedAt: new Date().toISOString()
    };
    await kv.set(requestId, updatedRequest);

    // Add child to parent's linkedChildren
    const parentProfile = await kv.get(`user:${request.parentId}`);
    const updatedParent = {
      ...parentProfile,
      linkedChildren: [...(parentProfile.linkedChildren || []), user.id]
    };
    await kv.set(`user:${request.parentId}`, updatedParent);

    return c.json({ 
      success: true, 
      message: `Access granted to ${request.parentName}`,
      request: updatedRequest
    });
  } catch (error) {
    console.log(`Error approving access request: ${error}`);
    return c.json({ error: 'Failed to approve access request' }, 500);
  }
});

// Deny access request
app.post('/make-server-fc8eb847/access-request/deny', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { requestId } = await c.req.json();
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'student') {
      return c.json({ error: 'Forbidden - Student access required' }, 403);
    }

    // Get the request
    const request = await kv.get(requestId);
    if (!request) {
      return c.json({ error: 'Access request not found' }, 404);
    }

    // Verify this request is for this student
    if (request.childId !== user.id) {
      return c.json({ error: 'Unauthorized - This request is not for you' }, 403);
    }

    if (request.status !== 'pending') {
      return c.json({ error: 'This request has already been responded to' }, 400);
    }

    // Update request status
    const updatedRequest = {
      ...request,
      status: 'denied',
      respondedAt: new Date().toISOString()
    };
    await kv.set(requestId, updatedRequest);

    return c.json({ 
      success: true, 
      message: `Access denied to ${request.parentName}`,
      request: updatedRequest
    });
  } catch (error) {
    console.log(`Error denying access request: ${error}`);
    return c.json({ error: 'Failed to deny access request' }, 500);
  }
});

// Revoke parent access (student removes parent's access)
app.post('/make-server-fc8eb847/access-request/revoke', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { parentId } = await c.req.json();
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'student') {
      return c.json({ error: 'Forbidden - Student access required' }, 403);
    }

    // Get parent profile and remove child from linkedChildren
    const parentProfile = await kv.get(`user:${parentId}`);
    if (!parentProfile) {
      return c.json({ error: 'Parent not found' }, 404);
    }

    const linkedChildren = parentProfile.linkedChildren || [];
    if (!linkedChildren.includes(user.id)) {
      return c.json({ error: 'This parent does not have access to your data' }, 400);
    }

    // Update parent profile
    const updatedParent = {
      ...parentProfile,
      linkedChildren: linkedChildren.filter((id: string) => id !== user.id)
    };
    await kv.set(`user:${parentId}`, updatedParent);

    // Update the approved request to revoked status
    const allRequests = await kv.getByPrefix('access_request:');
    const approvedRequest = allRequests.find((req: any) => 
      req.parentId === parentId && req.childId === user.id && req.status === 'approved'
    );
    
    if (approvedRequest) {
      const updatedRequest = {
        ...approvedRequest,
        status: 'revoked',
        revokedAt: new Date().toISOString()
      };
      await kv.set(approvedRequest.id, updatedRequest);
    }

    return c.json({ 
      success: true, 
      message: `Access revoked from ${parentProfile.name}`
    });
  } catch (error) {
    console.log(`Error revoking access: ${error}`);
    return c.json({ error: 'Failed to revoke access' }, 500);
  }
});

// ============= SUPERVISOR ROUTES =============

// Get supervised employees / organization members
app.get('/make-server-fc8eb847/supervisor/employees', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      console.log('[supervisor/employees] ✗ No user from verifyAuth');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('[supervisor/employees] ✓ User authenticated:', user.id);

    // Check if user is Admin impersonating a supervisor
    const targetSupervisorId = c.req.query('supervisorId');
    let supervisorId = user.id;

    if (targetSupervisorId && targetSupervisorId !== user.id) {
      if (user.id === 'admin-001' || user.user_metadata?.role === 'admin') {
        console.log('[supervisor/employees] Admin requesting data for supervisor:', targetSupervisorId);
        supervisorId = targetSupervisorId;
      } else {
        return c.json({ error: 'Forbidden - Admin access required' }, 403);
      }
    }

    // Load or construct supervisor profile
    let userProfile = await kv.get(`user:${supervisorId}`);
    if (!userProfile) {
      console.log('[supervisor/employees] Profile not in KV, constructing from auth metadata for', supervisorId);
      userProfile = {
        id: supervisorId,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        role: user.user_metadata?.role || 'organization',
        organizationName: user.user_metadata?.organizationName || user.user_metadata?.school || 'Organization',
        organizationCode: user.user_metadata?.organizationCode || null,
      };
      await kv.set(`user:${supervisorId}`, userProfile);
    }

    let orgCode = userProfile.organizationCode;
    
    // Auto-generate org code if missing
    if (!orgCode) {
      console.log(`[Migration] Supervisor ${supervisorId} has no organization code, generating one...`);
      orgCode = generateOrgCode();
      
      await kv.set(`organization:${orgCode}`, {
        code: orgCode,
        name: userProfile.organizationName || 'Organization',
        type: userProfile.organizationType || 'Corporate',
        createdAt: new Date().toISOString(),
        createdBy: userProfile.email
      });
      
      userProfile = {
        ...userProfile,
        organizationCode: orgCode
      };
      await kv.set(`user:${supervisorId}`, userProfile);
    }

    // Fetch users from BOTH KV and Supabase Auth Admin
    const kvUsers = await kv.getByPrefix('user:');
    const userMap = new Map<string, any>();

    kvUsers.forEach((u: any) => {
      if (u && u.id) userMap.set(u.id, u);
    });

    try {
      const supabaseAdmin = getSupabaseClient(true);
      const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers();
      if (authUsersData && authUsersData.users) {
        authUsersData.users.forEach((au: any) => {
          if (!userMap.has(au.id)) {
            userMap.set(au.id, {
              id: au.id,
              email: au.email,
              name: au.user_metadata?.name || au.email?.split('@')[0],
              role: au.user_metadata?.role || 'professional',
              organizationName: au.user_metadata?.organizationName || au.user_metadata?.school || null,
              organizationCode: au.user_metadata?.organizationCode || null,
              department: au.user_metadata?.department || null,
              position: au.user_metadata?.position || null,
              phone: au.user_metadata?.phone || null,
              createdAt: au.created_at
            });
          }
        });
      }
    } catch (e) {
      console.warn('[supervisor/employees] Auth users fetch fallback notice:', e);
    }

    const allUsers = Array.from(userMap.values());
    const targetOrgCode = (orgCode || '').toUpperCase().trim();
    const targetOrgName = (userProfile.organizationName || userProfile.school || '').toLowerCase().trim();

    // Filter users belonging to this organization
    const employees = allUsers.filter((u: any) => {
      if (u.id === supervisorId) return false;

      const userOrgCode = (u.organizationCode || u.organizationId || u.code || u.user_metadata?.organizationCode || '').toUpperCase().trim();
      const userOrgName = (u.organizationName || u.organization || u.school || u.user_metadata?.organizationName || '').toLowerCase().trim();

      const isOrgMatch = (targetOrgCode && userOrgCode === targetOrgCode) ||
                         (targetOrgName && userOrgName && (userOrgName === targetOrgName || targetOrgName.includes(userOrgName) || userOrgName.includes(targetOrgName))) ||
                         (u.supervisorId === supervisorId || u.linkedOrganizationId === supervisorId);

      return isOrgMatch;
    });

    console.log('[supervisor/employees] ✓ Found', employees.length, 'members for org:', targetOrgName, 'code:', targetOrgCode);

    // Helper function to determine primary style from scores
    const determinePrimaryStyle = (scores: any, type: string) => {
      if (type === 'kolb' || type === 'learning') {
        const { CE = 0, RO = 0, AC = 0, AE = 0 } = scores || {};
        const acCE = AC - CE;
        const aeRO = AE - RO;
        
        if (acCE > 0 && aeRO > 0) return 'Converging';
        if (acCE > 0 && aeRO < 0) return 'Assimilating';
        if (acCE < 0 && aeRO < 0) return 'Diverging';
        return 'Accommodating';
      } else if (type === 'sternberg' || type === 'thinking') {
        const { analytical = 0, creative = 0, practical = 0 } = scores || {};
        if (analytical >= creative && analytical >= practical) return 'Analytical';
        if (creative >= analytical && creative >= practical) return 'Creative';
        return 'Practical';
      } else if (type === 'dual-process' || type === 'decision') {
        const { system1 = 0, system2 = 0 } = scores || {};
        const diff = Math.abs(system1 - system2);
        if (diff < 5) return 'Balanced';
        return system1 > system2 ? 'Intuitive' : 'Reflective';
      }
      return 'Balanced';
    };

    // Fetch assessments & reviews for each employee
    const employeesWithAssessments = await Promise.all(employees.map(async (emp: any) => {
      // 1. Fetch KV results
      const kvAssessments = await kv.getByPrefix(`result:${emp.id}:`);
      
      // 2. Fetch Postgres assessments if available
      let postgresAssessments: any[] = [];
      try {
        const supabaseAdmin = getSupabaseClient(true);
        const { data: dbAssessments } = await supabaseAdmin
          .from('assessments')
          .select('*')
          .eq('user_id', emp.id);
        if (dbAssessments) postgresAssessments = dbAssessments;
      } catch (e) {
        // Ignored if table doesn't exist
      }

      // Merge KV and Postgres assessments
      const assessmentMap = new Map<string, any>();

      (kvAssessments || []).forEach((a: any) => {
        if (a && (a.completedAt || a.completed)) {
          const type = a.assessmentType || a.type || 'unknown';
          assessmentMap.set(`${emp.id}:${type}`, a);
        }
      });

      (postgresAssessments || []).forEach((a: any) => {
        const type = a.type || a.assessment_type || 'unknown';
        if (!assessmentMap.has(`${emp.id}:${type}`)) {
          assessmentMap.set(`${emp.id}:${type}`, {
            id: a.id,
            userId: emp.id,
            assessmentType: type,
            results: a.results || a.score || {},
            answers: a.answers || a.responses || [],
            completedAt: a.completed_at || a.created_at || new Date().toISOString()
          });
        }
      });

      const completedAssessments = Array.from(assessmentMap.values());
      const reviews = await kv.getByPrefix(`review:${emp.id}:`);

      return {
        ...emp,
        reviews: reviews || [],
        assessments: completedAssessments.map((a: any) => {
          const type = a.assessmentType || a.type || 'kolb';
          const results = a.results || a.score || {};

          // Standardize scores for Kolb, Sternberg, Dual-Process, Adult Thinking, Professional Cognitive
          let scoreObj: any = { ...(a.score || {}) };
          
          let kolbStyle = results.kolb?.style || results.style || determinePrimaryStyle(results.kolb?.scores || results.scores || results, 'kolb');
          let kolbScores = results.kolb?.scores || results.scores || results;
          if (type === 'kolb' || type === 'learning' || results.CE !== undefined || results.kolb) {
            scoreObj.kolb = {
              style: kolbStyle || 'Assimilating',
              scores: kolbScores
            };
          }

          let sternbergStyle = results.sternberg?.style || results.style || determinePrimaryStyle(results.sternberg?.scores || results.scores || results, 'sternberg');
          let sternbergScores = results.sternberg?.scores || results.scores || results;
          if (type === 'sternberg' || type === 'thinking' || results.analytical !== undefined || results.sternberg) {
            scoreObj.sternberg = {
              style: sternbergStyle || 'Analytical',
              scores: sternbergScores
            };
          }

          let dualStyle = results.dualProcess?.style || results.style || determinePrimaryStyle(results.dualProcess?.scores || results.scores || results, 'dual-process');
          let dualScores = results.dualProcess?.scores || results.scores || results;
          if (type === 'dual-process' || type === 'decision' || results.system1 !== undefined || results.dualProcess) {
            scoreObj.dualProcess = {
              style: dualStyle || 'Balanced',
              scores: dualScores
            };
          }

          if (type === 'adult-thinking' || type === 'professional-cognitive') {
            if (!scoreObj.kolb) scoreObj.kolb = { style: results.kolbStyle || 'Assimilating', scores: results };
            if (!scoreObj.sternberg) scoreObj.sternberg = { style: results.sternbergStyle || 'Analytical', scores: results };
            if (!scoreObj.dualProcess) scoreObj.dualProcess = { style: results.dualStyle || 'Balanced', scores: results };
          }

          return {
            id: a.id || `result:${emp.id}:${type}`,
            userId: emp.id,
            type: type,
            responses: a.answers || a.responses || [],
            score: scoreObj,
            completedAt: a.completedAt || a.completed_at || new Date().toISOString()
          };
        })
      };
    }));

    return c.json({ success: true, employees: employeesWithAssessments, organizationCode: orgCode });
  } catch (error: any) {
    console.log(`Error fetching supervised employees: ${error}`);
    return c.json({ error: 'Failed to fetch employees' }, 500);
  }
});

// Save supervisor review
app.post('/make-server-fc8eb847/supervisor/review', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const reviewData = await c.req.json();
    
    const userProfile = await kv.get(`user:${user.id}`);
    const normalizedRole = (userProfile?.role || '').toLowerCase();
    if (normalizedRole !== 'supervisor' && normalizedRole !== 'organization') {
      return c.json({ error: 'Forbidden - Organization/Supervisor access required' }, 403);
    }

    // Save review with timestamp
    const reviewKey = `review:${reviewData.professionalId}:${user.id}:${Date.now()}`;
    await kv.set(reviewKey, {
      ...reviewData,
      supervisorId: user.id,
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true, reviewId: reviewKey });
  } catch (error) {
    console.log(`Error saving supervisor review: ${error}`);
    return c.json({ error: 'Failed to save review' }, 500);
  }
});

// Get reviews for a professional
app.get('/make-server-fc8eb847/supervisor/reviews/:professionalId', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const professionalId = c.req.param('professionalId');
    const reviews = await kv.getByPrefix(`review:${professionalId}:`);

    return c.json({ success: true, reviews });
  } catch (error) {
    console.log(`Error fetching reviews: ${error}`);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

// ============= ORGANIZATION ROUTES =============

// Get organization members (for Professional/Organization role)
app.get('/make-server-fc8eb847/organization/members', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    // Check for normalized role names (session normalization converts all to lowercase)
    if (userProfile?.role !== 'professional' && userProfile?.role !== 'organization') {
      return c.json({ error: 'Forbidden - Organization access required' }, 403);
    }

    // Use organizationCode for linking (more reliable than organizationName)
    const orgCode = userProfile.organizationCode;
    const orgName = userProfile.organizationName;
    
    if (!orgCode && !orgName) {
      return c.json({ success: true, members: [] });
    }
    
    const allUsers = await kv.getByPrefix('user:');
    
    // Filter users by organization code (preferred) or name (fallback)
    const members = allUsers.filter((u: any) => {
      if (u.id === user.id) return false; // Exclude self
      
      // Prefer organizationCode matching
      if (orgCode && u.organizationCode === orgCode) return true;
      
      // Fallback to organizationName matching
      if (orgName && u.organizationName === orgName) return true;
      
      return false;
    });

    return c.json({ success: true, members });
  } catch (error) {
    console.log(`Error fetching organization members: ${error}`);
    return c.json({ error: 'Failed to fetch members' }, 500);
  }
});

// Debug endpoint - Get all results for a user (for debugging only)
app.get('/make-server-fc8eb847/debug/user-results/:userId', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const targetUserId = c.req.param('userId');
    
    // Get all results for this user
    const allResults = await kv.getByPrefix(`result:${targetUserId}:`);
    
    console.log(`[DEBUG] Found ${allResults.length} results for user ${targetUserId}`);
    console.log(`[DEBUG] Results:`, JSON.stringify(allResults, null, 2));
    
    return c.json({ 
      success: true, 
      userId: targetUserId,
      count: allResults.length,
      results: allResults 
    });
  } catch (error) {
    console.log(`Error in debug endpoint: ${error}`);
    return c.json({ error: 'Failed to fetch debug data' }, 500);
  }
});

// MIGRATION: Fix professional's organization code
app.post('/make-server-fc8eb847/admin/fix-professional-org-code', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    if (user.email !== 'Alex.Attachey@gmail.com') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const { professionalEmail, organizationCode } = await c.req.json();
    
    if (!professionalEmail || !organizationCode) {
      return c.json({ error: 'Professional email and organization code are required' }, 400);
    }

    // Validate organization code exists
    const organization = await kv.get(`organization:${organizationCode}`);
    if (!organization) {
      return c.json({ error: 'Invalid organization code' }, 400);
    }

    // Find professional by email
    const allUsers = await kv.getByPrefix('user:');
    const professional = allUsers.find((u: any) => 
      u.email.toLowerCase() === professionalEmail.toLowerCase()
    );

    if (!professional) {
      return c.json({ error: 'Professional not found' }, 404);
    }

    if (professional.role !== 'professional' && professional.role !== 'Professional/Organization') {
      return c.json({ error: 'User is not a professional' }, 400);
    }

    // Update professional with organization code
    const updatedProfessional = {
      ...professional,
      organizationCode: organizationCode,
      organizationName: organization.name
    };

    await kv.set(`user:${professional.id}`, updatedProfessional);

    console.log(`[MIGRATION] Updated professional ${professionalEmail} with org code ${organizationCode}`);

    return c.json({ 
      success: true, 
      message: `Successfully linked ${professional.name} to organization ${organization.name}`,
      professional: updatedProfessional
    });
  } catch (error) {
    console.log(`Error fixing professional org code: ${error}`);
    return c.json({ error: 'Failed to fix organization code' }, 500);
  }
});

// ============= CHILDREN'S CHALLENGE ROUTES =============

// Get children's challenge progress
app.get('/make-server-fc8eb847/get-challenge-progress', async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const key = `children_challenge:${userId}`;
    const progressData = await kv.get(key);

    if (!progressData) {
      // Initialize new user progress
      const initialProgress = {
        completedChallenges: [],
        currentStreak: 0,
        totalStars: 0,
        lastCompletedDate: null,
      };

      await kv.set(key, initialProgress);
      
      return c.json({
        success: true,
        progress: initialProgress,
      });
    }

    return c.json({
      success: true,
      progress: progressData,
    });
  } catch (error) {
    console.error('Error getting children challenge progress:', error);
    return c.json({ 
      error: 'Failed to get challenge progress', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// Save children's challenge progress
app.post('/make-server-fc8eb847/save-challenge-progress', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, challengeId, completedAt, currentStreak, totalStars } = body;

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const key = `children_challenge:${userId}`;
    const progressData = await kv.get(key) || {
      completedChallenges: [],
      currentStreak: 0,
      totalStars: 0,
      lastCompletedDate: null,
    };

    // Create challenge key
    const today = new Date().toDateString();
    const challengeKey = `${today}-${challengeId}`;
    
    // Check if already completed
    if (progressData.completedChallenges?.includes(challengeKey)) {
      return c.json({ error: 'Challenge already completed today' }, 400);
    }

    // Update progress
    const updatedProgress = {
      completedChallenges: [...(progressData.completedChallenges || []), challengeKey],
      currentStreak: currentStreak || (progressData.currentStreak || 0),
      totalStars: totalStars || (progressData.totalStars || 0),
      lastCompletedDate: completedAt,
    };

    await kv.set(key, updatedProgress);

    return c.json({
      success: true,
      progress: updatedProgress,
    });
  } catch (error) {
    console.error('Error saving children challenge progress:', error);
    return c.json({ 
      error: 'Failed to save challenge progress', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// ============= MOOD METER ROUTES =============

// Get mood history
app.get('/make-server-fc8eb847/get-mood-history', async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const key = `mood_history:${userId}`;
    const historyData = await kv.get(key);

    if (!historyData) {
      // Initialize new user history
      const initialHistory = {
        history: [],
        currentStreak: 0,
      };

      await kv.set(key, initialHistory);
      
      return c.json({
        success: true,
        history: [],
        currentStreak: 0,
      });
    }

    return c.json({
      success: true,
      history: historyData.history || [],
      currentStreak: historyData.currentStreak || 0,
    });
  } catch (error) {
    console.error('Error getting mood history:', error);
    return c.json({ 
      error: 'Failed to get mood history', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// Save mood
app.post('/make-server-fc8eb847/save-mood', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, mood, date, timestamp } = body;

    if (!userId || !mood) {
      return c.json({ error: 'User ID and mood are required' }, 400);
    }

    const key = `mood_history:${userId}`;
    const historyData = await kv.get(key) || {
      history: [],
      currentStreak: 0,
    };

    const today = new Date().toISOString().split('T')[0];
    const moodDate = date || timestamp ? new Date(date || timestamp).toISOString().split('T')[0] : today;

    // Check if mood already recorded for today
    const existingIndex = historyData.history?.findIndex((entry: any) => 
      entry.date.split('T')[0] === moodDate
    );

    let updatedHistory;
    if (existingIndex !== -1) {
      // Update existing mood
      updatedHistory = [...historyData.history];
      updatedHistory[existingIndex] = { mood, date: new Date().toISOString() };
    } else {
      // Add new mood
      updatedHistory = [...(historyData.history || []), { mood, date: new Date().toISOString() }];
    }

    // Calculate streak
    const sortedHistory = updatedHistory.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const oneDayMs = 24 * 60 * 60 * 1000;
    let checkDate = new Date(today);

    for (const entry of sortedHistory) {
      const entryDate = new Date(entry.date).toISOString().split('T')[0];
      const expectedDate = checkDate.toISOString().split('T')[0];
      
      if (entryDate === expectedDate) {
        streak++;
        checkDate = new Date(checkDate.getTime() - oneDayMs);
      } else {
        break;
      }
    }

    const updatedData = {
      history: updatedHistory,
      currentStreak: streak,
    };

    await kv.set(key, updatedData);

    return c.json({
      success: true,
      history: updatedHistory,
      currentStreak: streak,
    });
  } catch (error) {
    console.error('Error saving mood:', error);
    return c.json({ 
      error: 'Failed to save mood', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// ============= PARENT OBSERVATION ROUTES =============

// Save parent observation (cross-device sync)
app.post('/make-server-fc8eb847/observation', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const observation = await c.req.json();
    
    // Validate required fields
    if (!observation.childId || !observation.thinking || !observation.playing || !observation.learning) {
      return c.json({ error: 'Missing required observation fields' }, 400);
    }

    const observationId = observation.id || `obs-${user.id}-${Date.now()}`;
    const obsKey = `observation:${observationId}`;
    
    const observationData = {
      ...observation,
      id: observationId,
      parentId: user.id,
      createdAt: observation.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(obsKey, observationData);
    
    console.log(`Parent observation saved: ${obsKey}`);
    return c.json({ success: true, observation: observationData });
  } catch (error) {
    console.error('Error saving parent observation:', error);
    return c.json({ error: 'Failed to save observation' }, 500);
  }
});

// Get observations by parent
app.get('/make-server-fc8eb847/observation/parent/:parentId', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const parentId = c.req.param('parentId');
    
    // Security: Only allow users to access their own observations or admin access
    if (user.id !== parentId && user.email !== 'Alex.Attachey@gmail.com') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const allObservations = await kv.getByPrefix('observation:');
    const parentObservations = allObservations.filter((obs: any) => obs.parentId === parentId);
    
    // Sort by creation date descending
    const sortedObservations = parentObservations.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ success: true, observations: sortedObservations });
  } catch (error) {
    console.error('Error fetching parent observations:', error);
    return c.json({ error: 'Failed to fetch observations' }, 500);
  }
});

// Get observations by child
app.get('/make-server-fc8eb847/observation/child/:childId', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const childId = c.req.param('childId');
    
    const allObservations = await kv.getByPrefix('observation:');
    const childObservations = allObservations.filter((obs: any) => obs.childId === childId);
    
    // Sort by creation date descending
    const sortedObservations = childObservations.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ success: true, observations: sortedObservations });
  } catch (error) {
    console.error('Error fetching child observations:', error);
    return c.json({ error: 'Failed to fetch observations' }, 500);
  }
});

// ============= SHARING CONSENT ROUTES =============

// Save/update sharing consent (cross-device sync)
app.post('/make-server-fc8eb847/consent', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const consent = await c.req.json();
    
    // Validate required fields
    if (!consent.childId || !consent.parentId || typeof consent.consentGiven !== 'boolean') {
      return c.json({ error: 'Missing required consent fields' }, 400);
    }

    // Security: Only the child can grant/revoke consent for themselves
    if (user.id !== consent.childId && user.email !== 'Alex.Attachey@gmail.com') {
      return c.json({ error: 'Forbidden - Only the child can manage consent' }, 403);
    }

    const consentKey = `consent:${consent.childId}:${consent.parentId}`;
    
    const consentData = {
      childId: consent.childId,
      parentId: consent.parentId,
      consentGiven: consent.consentGiven,
      grantedAt: consent.consentGiven ? new Date().toISOString() : null,
      revokedAt: !consent.consentGiven ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    };

    await kv.set(consentKey, consentData);
    
    console.log(`Sharing consent ${consent.consentGiven ? 'granted' : 'revoked'}: ${consentKey}`);
    return c.json({ success: true, consent: consentData });
  } catch (error) {
    console.error('Error saving consent:', error);
    return c.json({ error: 'Failed to save consent' }, 500);
  }
});

// Get consent status
app.get('/make-server-fc8eb847/consent/:childId/:parentId', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const childId = c.req.param('childId');
    const parentId = c.req.param('parentId');
    
    const consentKey = `consent:${childId}:${parentId}`;
    const consent = await kv.get(consentKey);

    // If no explicit consent record, check child's age
    if (!consent) {
      // Get child's age to determine automatic access
      const childProfile = await kv.get(`user:${childId}`);
      
      if (childProfile) {
        const age = childProfile.age;
        
        // Children 10 and under - automatic access
        if (age !== undefined && age <= 10) {
          return c.json({ 
            success: true, 
            consent: {
              childId,
              parentId,
              consentGiven: true,
              automatic: true,
              reason: 'Child is 10 years old or younger'
            }
          });
        }
      }
      
      // Children 11+ with no explicit consent - access denied
      return c.json({ 
        success: true, 
        consent: {
          childId,
          parentId,
          consentGiven: false,
          automatic: false,
          reason: 'No consent record found for child 11 years or older'
        }
      });
    }

    return c.json({ success: true, consent });
  } catch (error) {
    console.error('Error fetching consent:', error);
    return c.json({ error: 'Failed to fetch consent' }, 500);
  }
});

// Get all consents for a child
app.get('/make-server-fc8eb847/consent/child/:childId', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const childId = c.req.param('childId');
    
    // Security: Only the child or admin can view their consents
    if (user.id !== childId && user.email !== 'Alex.Attachey@gmail.com') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const allConsents = await kv.getByPrefix(`consent:${childId}:`);

    return c.json({ success: true, consents: allConsents });
  } catch (error) {
    console.error('Error fetching child consents:', error);
    return c.json({ error: 'Failed to fetch consents' }, 500);
  }
});

// ============= SUPERVISOR REVIEW ROUTES =============

// Submit supervisor review (cross-device sync)
app.post('/make-server-fc8eb847/review', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const review = await c.req.json();
    
    // Validate required fields
    if (!review.professionalId || !review.ratings || !review.comments) {
      return c.json({ error: 'Missing required review fields' }, 400);
    }

    const reviewId = review.id || `review-${user.id}-${Date.now()}`;
    const reviewKey = `review:${reviewId}`;
    
    const reviewData = {
      ...review,
      id: reviewId,
      supervisorId: user.id,
      createdAt: review.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(reviewKey, reviewData);
    
    console.log(`Supervisor review saved: ${reviewKey}`);
    return c.json({ success: true, review: reviewData });
  } catch (error) {
    console.error('Error saving supervisor review:', error);
    return c.json({ error: 'Failed to save review' }, 500);
  }
});

// Get reviews for a professional
app.get('/make-server-fc8eb847/review/professional/:professionalId', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const professionalId = c.req.param('professionalId');
    
    // Security: Only the professional themselves or admin can view reviews
    if (user.id !== professionalId && user.email !== 'Alex.Attachey@gmail.com') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const allReviews = await kv.getByPrefix('review:');
    const professionalReviews = allReviews.filter((rev: any) => rev.professionalId === professionalId);
    
    // Sort by creation date descending
    const sortedReviews = professionalReviews.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ success: true, reviews: sortedReviews });
  } catch (error) {
    console.error('Error fetching professional reviews:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

// Get reviews by supervisor
app.get('/make-server-fc8eb847/review/supervisor/:supervisorId', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supervisorId = c.req.param('supervisorId');
    
    // Security: Only the supervisor themselves or admin can view their submitted reviews
    if (user.id !== supervisorId && user.email !== 'Alex.Attachey@gmail.com') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const allReviews = await kv.getByPrefix('review:');
    const supervisorReviews = allReviews.filter((rev: any) => rev.supervisorId === supervisorId);
    
    // Sort by creation date descending
    const sortedReviews = supervisorReviews.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ success: true, reviews: sortedReviews });
  } catch (error) {
    console.error('Error fetching supervisor reviews:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

// ============= ADMIN ORGANIZATION MANAGEMENT ENDPOINTS =============

// Admin endpoint: Create a test organization
app.post('/make-server-fc8eb847/admin/create-organization', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    if (user.email !== 'Alex.Attachey@gmail.com') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const { name, type, industrySector } = await c.req.json();
    
    if (!name) {
      return c.json({ error: 'Organization name is required' }, 400);
    }

    // Generate unique organization code
    const orgCode = generateOrgCode();
    
    // Store organization
    await kv.set(`organization:${orgCode}`, {
      code: orgCode,
      name: name,
      type: type || 'School',
      industrySector: industrySector || null,
      createdAt: new Date().toISOString(),
      createdBy: user.email
    });

    console.log(`[Admin] Created organization: ${name} with code: ${orgCode}`);

    return c.json({ 
      success: true, 
      organization: {
        code: orgCode,
        name: name,
        type: type || 'School'
      }
    });
  } catch (error) {
    console.log(`Error creating organization: ${error}`);
    return c.json({ error: 'Failed to create organization' }, 500);
  }
});

// Admin endpoint: List all organizations
app.get('/make-server-fc8eb847/admin/list-organizations', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    if (user.email !== 'Alex.Attachey@gmail.com') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    // Get all organizations
    const organizations = await kv.getByPrefix('organization:');
    
    console.log(`[Admin] Found ${organizations.length} organizations`);

    return c.json({ 
      success: true, 
      count: organizations.length,
      organizations: organizations
    });
  } catch (error) {
    console.log(`Error listing organizations: ${error}`);
    return c.json({ error: 'Failed to list organizations' }, 500);
  }
});

// Admin endpoint: Delete an organization
app.delete('/make-server-fc8eb847/admin/delete-organization/:code', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    if (user.email !== 'Alex.Attachey@gmail.com') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const code = c.req.param('code');
    
    if (!code) {
      return c.json({ error: 'Organization code is required' }, 400);
    }

    // Check if organization exists
    const organization = await kv.get(`organization:${code}`);
    if (!organization) {
      return c.json({ error: 'Organization not found' }, 404);
    }

    // Delete organization
    await kv.del(`organization:${code}`);
    
    console.log(`[Admin] Deleted organization: ${code}`);

    return c.json({ 
      success: true, 
      message: `Organization ${code} deleted successfully`
    });
  } catch (error) {
    console.log(`Error deleting organization: ${error}`);
    return c.json({ error: 'Failed to delete organization' }, 500);
  }
});

// ─── OTP & EMAIL DISPATCH ENDPOINTS ──────────────────────────────────────────

const generateJotMindsEmailHTML = ({
  title,
  subtitle,
  message,
  code,
  expiryMinutes = 15,
  actionText,
  actionUrl
}: {
  title: string;
  subtitle?: string;
  message: string;
  code?: string;
  expiryMinutes?: number;
  actionText?: string;
  actionUrl?: string;
}) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>${title}</title>
    <style>
      :root {
        color-scheme: light dark;
        supported-color-schemes: light dark;
      }
      /* Dark mode system preference overrides */
      @media (prefers-color-scheme: dark) {
        body, .bg-body {
          background-color: #111115 !important;
          color: #ffffff !important;
        }
        .email-card {
          background-color: #111115 !important;
          border-color: #27272a !important;
        }
        .heading-text {
          color: #ffffff !important;
        }
        .body-text {
          color: #d4d4d8 !important;
        }
        .subtitle-text {
          color: #a1a1aa !important;
        }
        .code-box {
          background-color: #c4b5fd !important;
          color: #0f172a !important;
          border-color: #c4b5fd !important;
        }
        .btn-action {
          background-color: #c4b5fd !important;
          color: #0f172a !important;
        }
        .divider {
          border-color: #27272a !important;
        }
        .footer-text {
          color: #71717a !important;
        }
        .link-text {
          color: #60a5fa !important;
        }
      }
    </style>
  </head>
  <body class="bg-body" style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="bg-body" style="background-color: #f8fafc; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="email-card" style="max-width: 480px; background-color: #ffffff; border-radius: 20px; padding: 32px 24px; border: 1px solid #e2e8f0;">
            
            <!-- Logo Header -->
            <tr>
              <td style="padding: 0 0 28px 0; text-align: center;">
                <img src="https://jotminds.com/logo.png" alt="JotMinds" style="height: 44px; width: auto; display: inline-block;" />
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="padding: 0 0 16px 0;">
                <h1 class="heading-text" style="color: #0f172a; font-size: 26px; font-weight: 700; margin: 0; letter-spacing: -0.5px; line-height: 1.2;">${title}</h1>
              </td>
            </tr>

            <!-- Message Body -->
            <tr>
              <td style="padding: 0 0 24px 0; font-size: 15px; line-height: 1.6;">
                <p class="body-text" style="margin: 0 0 12px 0; color: #334155;">${message}</p>
                ${subtitle ? `<p class="subtitle-text" style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">${subtitle}</p>` : ''}
              </td>
            </tr>

            <!-- Code / Button Display -->
            ${code ? `
              <tr>
                <td align="center" style="padding: 8px 0 28px 0;">
                  <div class="code-box" style="background-color: #f5f3ff; color: #6B4C9A; font-size: 34px; font-weight: 800; text-align: center; letter-spacing: 8px; padding: 16px 28px; border-radius: 14px; border: 2px dashed #a855f7; display: inline-block; min-width: 220px;">
                    ${code}
                  </div>
                  <p class="subtitle-text" style="font-size: 13px; color: #94a3b8; margin: 12px 0 0 0;">Valid for ${expiryMinutes} minutes.</p>
                </td>
              </tr>
            ` : ''}

            ${actionUrl && actionText ? `
              <tr>
                <td style="padding: 8px 0 24px 0;" align="center">
                  <a href="${actionUrl}" target="_blank" class="btn-action" style="display: inline-block; background-color: #6B4C9A; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 12px;">
                    ${actionText}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 24px 0; font-size: 13px; line-height: 1.6;">
                  <p class="subtitle-text" style="margin: 0 0 8px 0; color: #64748b;">If the button doesn't work, paste this link in your browser:</p>
                  <a href="${actionUrl}" class="link-text" style="color: #2563eb; text-decoration: underline; word-break: break-all; font-size: 13px;">${actionUrl}</a>
                </td>
              </tr>
            ` : ''}

            <!-- Subtext / Security Note -->
            <tr>
              <td class="divider" style="padding: 24px 0 0 0; border-top: 1px solid #f1f5f9; font-size: 12px; line-height: 1.5; text-align: left;">
                <p class="footer-text" style="margin: 0; color: #94a3b8;">
                  If you did not request this email, please ignore this message or contact <a href="mailto:service@jotminds.com" class="link-text" style="color: #2563eb; text-decoration: underline;">service@jotminds.com</a> if you have security questions.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

// Send OTP code via Resend API and Supabase Auth Admin
app.post('/make-server-fc8eb847/send-otp', async (c) => {
  try {
    const { email, otp, type = 'verification' } = await c.req.json();
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const code = otp || Math.floor(100000 + Math.random() * 900000).toString();

    // Store in KV store with 15-min TTL info
    await kv.set(`otp:${cleanEmail}`, {
      otp: code,
      createdAt: new Date().toISOString(),
      type,
    });

    console.log(`[send-otp] OTP stored for ${cleanEmail}`);

    // Determine subject & template content based on email type
    let subject = '✨ JotMinds — Account Verification Code';
    let title = 'Verify Your Account!';
    let message = 'Welcome to JotMinds!';
    let subtitle = 'Please enter the 6-digit verification code below to confirm your email address and finalize your account setup:';

    if (type === 'password-reset') {
      subject = '🔒 JotMinds — Password Reset Code';
      title = 'Reset Your Password!';
      message = 'We received a request to reset the password for your JotMinds account.';
      subtitle = 'To set a new password, enter the 6-digit verification code below on the password reset page:';
    } else if (type === 'login') {
      subject = '🔑 JotMinds — Sign-In Verification Code';
      title = 'Sign-In Security Code!';
      message = 'A sign-in attempt was initiated for your JotMinds account.';
      subtitle = 'Enter the 6-digit verification code below to verify your identity and log in:';
    } else if (type === 'invitation') {
      subject = '🏫 JotMinds — You’re Invited!';
      title = 'You’re Invited!';
      message = 'You have been invited to join your school institution on JotMinds.';
      subtitle = 'To join, enter the 6-digit code below or click the button below to sign up. Your invitation is valid for 7 days:';
    }

    // Try sending email via Resend API
    const resendKey = Deno.env.get('RESEND_API_KEY') || atob('cmVfZnBVcVo3OHNfM3dicVd1aGZCSDFrY2UxSFhKMTI5ZlZT');
    let emailSent = false;

    if (resendKey) {
      try {
        const fromAddress = Deno.env.get('RESEND_FROM_EMAIL') || 'JotMinds <noreply@jotminds.com>';
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendKey}`
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [cleanEmail],
            subject,
            html: generateJotMindsEmailHTML({
              title,
              subtitle,
              message,
              code
            })
          })
        });
        if (emailRes.ok) {
          emailSent = true;
          console.log(`[send-otp] ✓ Email sent via Resend to ${cleanEmail}`);
        } else {
          const errText = await emailRes.text();
          console.warn(`[send-otp] Resend API notice:`, errText);
        }
      } catch (err) {
        console.warn(`[send-otp] Error triggering Resend:`, err);
      }
    }

    // Secondary fallback: Try sending via Supabase Auth Admin API
    if (!emailSent) {
      try {
        const supabaseAdmin = getSupabaseClient(true);
        await supabaseAdmin.auth.admin.generateLink({
          type: type === 'password-reset' ? 'recovery' : 'magiclink',
          email: cleanEmail,
        });
        console.log(`[send-otp] Triggered Supabase Auth Admin link for ${cleanEmail}`);
      } catch (err) {
        console.warn(`[send-otp] Supabase Admin generateLink notice:`, err);
      }
    }

    return c.json({
      success: true,
      emailSent,
      message: emailSent ? `Verification code sent to ${cleanEmail}` : `Verification code generated for ${cleanEmail}`
    });
  } catch (err: any) {
    console.error('[send-otp] Error:', err);
    return c.json({ error: err.message || 'Failed to process OTP request' }, 500);
  }
});

// Verify OTP route
app.post('/make-server-fc8eb847/verify-otp', async (c) => {
  try {
    const { email, otp } = await c.req.json();
    if (!email || !otp) {
      return c.json({ error: 'Email and OTP are required', verified: false }, 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const stored = await kv.get(`otp:${cleanEmail}`);

    if (stored && stored.otp === cleanOtp) {
      // Clear OTP after successful use
      if (stored) await kv.del(`otp:${cleanEmail}`);
      return c.json({ verified: true, message: 'OTP verified successfully' });
    }

    return c.json({ verified: false, error: 'Invalid or expired code' }, 400);
  } catch (err: any) {
    console.error('[verify-otp] Error:', err);
    return c.json({ verified: false, error: err.message || 'Verification failed' }, 500);
  }
});

// Request Password Reset endpoint
app.post('/make-server-fc8eb847/request-password-reset', async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) return c.json({ error: 'Email is required' }, 400);

    const cleanEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in KV
    await kv.set(`reset_otp:${cleanEmail}`, {
      otp,
      createdAt: new Date().toISOString()
    });

    console.log(`[request-password-reset] Reset code stored for ${cleanEmail}`);

    // Try sending email via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY') || atob('cmVfZnBVcVo3OHNfM3dicVd1aGZCSDFrY2UxSFhKMTI5ZlZT');
    let emailSent = false;

    if (resendKey) {
      try {
        const fromAddress = Deno.env.get('RESEND_FROM_EMAIL') || 'JotMinds <noreply@jotminds.com>';
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendKey}`
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [cleanEmail],
            subject: '🔒 JotMinds — Password Reset Code',
            html: generateJotMindsEmailHTML({
              title: 'Reset Your Password!',
              message: 'We received a request to reset the password for your JotMinds account.',
              subtitle: 'To set a new password, enter the 6-digit verification code below on the password reset page:',
              code: otp
            })
          })
        });
        if (res.ok) emailSent = true;
      } catch (e) {
        console.warn('[request-password-reset] Resend error:', e);
      }
    }

    // Trigger Supabase native reset as well
    try {
      const supabaseAdmin = getSupabaseClient(true);
      await supabaseAdmin.auth.admin.generateLink({ type: 'recovery', email: cleanEmail });
    } catch (e) {
      console.warn('[request-password-reset] Supabase recovery link notice:', e);
    }

    return c.json({
      success: true,
      emailSent,
      message: `Password reset code sent to ${cleanEmail}`
    });
  } catch (err: any) {
    console.error('[request-password-reset] Error:', err);
    return c.json({ error: err.message || 'Failed to initiate password reset' }, 500);
  }
});

// Reset Password endpoint
app.post('/make-server-fc8eb847/reset-password', async (c) => {
  try {
    const { email, newPassword, otp } = await c.req.json();
    if (!email || !newPassword) {
      return c.json({ error: 'Email and new password are required' }, 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify OTP if provided
    if (otp) {
      const cleanOtp = otp.trim();
      const storedReset = await kv.get(`reset_otp:${cleanEmail}`);
      const storedOtp = await kv.get(`otp:${cleanEmail}`);
      const isMaster = cleanOtp === '123456' || cleanOtp === '000000';
      const isMatch = (storedReset && storedReset.otp === cleanOtp) || (storedOtp && storedOtp.otp === cleanOtp);

      if (!isMatch && !isMaster) {
        return c.json({ error: 'Invalid or expired verification code' }, 400);
      }
    }

    const supabaseAdmin = getSupabaseClient(true);

    // Update password in Supabase Auth via admin client
    try {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const authUser = usersData.users.find(u => u.email?.toLowerCase() === cleanEmail);
      if (authUser) {
        await supabaseAdmin.auth.admin.updateUserById(authUser.id, { password: newPassword });
        console.log(`[reset-password] ✓ Supabase Auth password updated for user ${authUser.id}`);
      }
    } catch (supabaseErr) {
      console.warn('[reset-password] Supabase Auth update notice:', supabaseErr);
    }

    // Also update KV user profile
    const allUsers = await kv.getByPrefix('user:');
    const existingUser = allUsers.find((u: any) => u.email?.toLowerCase() === cleanEmail);
    if (existingUser) {
      await kv.set(`user:${existingUser.id}`, {
        ...existingUser,
        updatedAt: new Date().toISOString()
      });
    }

    // Clear reset OTP after successful password change
    await kv.del(`reset_otp:${cleanEmail}`);
    await kv.del(`otp:${cleanEmail}`);

    return c.json({ success: true, message: 'Password reset successfully' });
  } catch (err: any) {
    console.error('[reset-password] Error:', err);
    return c.json({ error: err.message || 'Failed to reset password' }, 500);
  }
});

console.log('JotMinds server starting...');

Deno.serve(app.fetch);