import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import nodemailer from 'npm:nodemailer@6.9.10';
import * as kv from './kv_store.tsx';
import dailyChallengeRoutes from './daily-challenge-routes.tsx';
import assessmentRoutes from './assessment-routes.tsx';
import skillPlanRoutes from './skill-plan-routes.tsx';
import cognitiveProfileRoutes from './cognitive-profile-routes.tsx';
import careerMatchRoutes from './career-match-routes.tsx';
import seedQuestionsRoutes from './seed-questions-routes.tsx';
import aiRoutes from './ai-routes.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Mount routes
app.route('/make-server-fc8eb847/daily-challenge', dailyChallengeRoutes);
app.route('/make-server-fc8eb847', assessmentRoutes);
app.route('/make-server-fc8eb847/skill-plan', skillPlanRoutes);
app.route('/make-server-fc8eb847/cognitive-profile', cognitiveProfileRoutes);
app.route('/make-server-fc8eb847/career', careerMatchRoutes);
app.route('/make-server-fc8eb847/admin', seedQuestionsRoutes);
app.route('/make-server-fc8eb847/ai', aiRoutes);

// Health check and diagnostics endpoint
app.get('/make-server-fc8eb847/health', async (c) => {
  try {
    // Test database connection
    const testKey = `health_check:${Date.now()}`;
    await kv.set(testKey, { timestamp: new Date().toISOString() });
    const value = await kv.get(testKey);
    await kv.del(testKey);

    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      kv_store: 'operational',
      environment: {
        hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
        hasAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
        hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return c.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: 'error'
    }, 500);
  }
});

// Send OTP Endpoint
app.post('/make-server-fc8eb847/send-otp', async (c) => {
  try {
    const { email, otp } = await c.req.json();
    if (!email || !otp) {
      return c.json({ error: 'Email and OTP required' }, 400);
    }
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || 're_eFr3vz6q_G7KDp6TjnDLVUX2JyouKEbfG';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'JotMinds Support <service@jotminds.com>',
        to: email,
        subject: 'Your JotMinds Verification Code',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://www.jotminds.com/logo.png" alt="JotMinds Logo" style="height: 48px; width: auto;" />
            </div>
            <h2>Verification Code</h2>
            <p>Your OTP verification code is:</p>
            <div style="font-size: 24px; font-weight: bold; padding: 10px; background: #f4f4f5; text-align: center; letter-spacing: 4px; border-radius: 6px;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `
      })
    });
    
    if (response.ok) {
      return c.json({ success: true });
    } else {
      const err = await response.json();
      console.error('[send-otp] Resend API error:', err);
      return c.json({ error: 'Failed to send OTP via Resend', details: err }, 500);
    }
  } catch (error: any) {
    console.error('[send-otp] Server error:', error);
    return c.json({ error: 'Failed to send OTP email', message: error.message }, 500);
  }
});

// Send Login Alert Endpoint
app.post('/make-server-fc8eb847/send-login-alert', async (c) => {
  try {
    const { email, name, location, device } = await c.req.json();
    if (!email) {
      return c.json({ error: 'Email required' }, 400);
    }
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || 're_eFr3vz6q_G7KDp6TjnDLVUX2JyouKEbfG';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'JotMinds Security <service@jotminds.com>',
        to: email,
        subject: 'New Login Detected to Your JotMinds Account',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://www.jotminds.com/logo.png" alt="JotMinds Logo" style="height: 48px; width: auto;" />
            </div>
            <h2>New Login Detected</h2>
            <p>Hi ${name || 'there'},</p>
            <p>We noticed a new login to your JotMinds account.</p>
            <div style="background: #f4f4f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Time:</strong> ${new Date().toUTCString()}</p>
              ${location ? `<p style="margin: 5px 0 0 0;"><strong>Location:</strong> ${location}</p>` : ''}
              ${device ? `<p style="margin: 5px 0 0 0;"><strong>Device:</strong> ${device}</p>` : ''}
            </div>
            <p>If this was you, you can safely ignore this email.</p>
            <p style="color: #ef4444; font-weight: bold;">If you do not recognize this activity, please reset your password immediately and contact support.</p>
          </div>
        `
      })
    });
    
    if (response.ok) {
      return c.json({ success: true });
    } else {
      const err = await response.json();
      console.error('[send-login-alert] Resend API error:', err);
      return c.json({ error: 'Failed to send login alert via Resend', details: err }, 500);
    }
  } catch (error: any) {
    console.error('[send-login-alert] Server error:', error);
    return c.json({ error: 'Failed to send login alert email', message: error.message }, 500);
  }
});

// Send Organization Code Endpoint
app.post('/make-server-fc8eb847/send-org-code', async (c) => {
  try {
    const { email, organizationName, organizationCode } = await c.req.json();
    if (!email || !organizationName || !organizationCode) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || 're_eFr3vz6q_G7KDp6TjnDLVUX2JyouKEbfG';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'JotMinds <service@jotminds.com>',
        to: email,
        subject: `Welcome to JotMinds, ${organizationName}!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://www.jotminds.com/logo.png" alt="JotMinds Logo" style="height: 48px; width: auto;" />
            </div>
            <h2>Account Created Successfully</h2>
            <p>Your organization <strong>${organizationName}</strong> has been registered on JotMinds.</p>
            <div style="background: #f4f4f5; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #666;">Your Organization Code</p>
              <h1 style="margin: 10px 0; font-size: 32px; letter-spacing: 2px; color: #3b82f6;">${organizationCode}</h1>
            </div>
            <p>Please share this code with your team members so they can join your organization during registration.</p>
            <p>You can also find this code in your dashboard after logging in.</p>
          </div>
        `
      })
    });
    
    if (response.ok) {
      return c.json({ success: true });
    } else {
      const err = await response.json();
      console.error('[send-org-code] Resend API error:', err);
      return c.json({ error: 'Failed to send org code via Resend', details: err }, 500);
    }
  } catch (error: any) {
    console.error('[send-org-code] Server error:', error);
    return c.json({ error: 'Failed to send org code email', message: error.message }, 500);
  }
});

// Send Teacher Invite Endpoint
app.post('/make-server-fc8eb847/send-teacher-invite', async (c) => {
  try {
    const { email, institutionName, institutionCode } = await c.req.json();
    if (!email || !institutionName || !institutionCode) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || 're_eFr3vz6q_G7KDp6TjnDLVUX2JyouKEbfG';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'JotMinds <service@jotminds.com>',
        to: email,
        subject: `You've been invited to join ${institutionName} on JotMinds!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://www.jotminds.com/logo.png" alt="JotMinds Logo" style="height: 48px; width: auto;" />
            </div>
            <h2>You're Invited!</h2>
            <p>You have been invited to join <strong>${institutionName}</strong> as a teacher on JotMinds.</p>
            <p>To join, simply sign up for a Teacher account on JotMinds and enter the following institution code during registration:</p>
            <div style="background: #f4f4f5; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #666;">Institution Code</p>
              <h1 style="margin: 10px 0; font-size: 32px; letter-spacing: 2px; color: #3b82f6;">${institutionCode}</h1>
            </div>
            <p>If you already have an account, you can enter this code in your Profile Settings to join the institution.</p>
          </div>
        `
      })
    });
    
    if (response.ok) {
      return c.json({ success: true });
    } else {
      const err = await response.json();
      console.error('[send-teacher-invite] Resend API error:', err);
      return c.json({ error: 'Failed to send invite via Resend', details: err }, 500);
    }
  } catch (error: any) {
    console.error('[send-teacher-invite] Server error:', error);
    return c.json({ error: 'Failed to send teacher invite email', message: error.message }, 500);
  }
});

app.post('/make-server-fc8eb847/send-student-invite', async (c) => {
  try {
    const { email, studentName, teacherName, schoolName } = await c.req.json();
    if (!email || !teacherName) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || 're_eFr3vz6q_G7KDp6TjnDLVUX2JyouKEbfG';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'JotMinds <service@jotminds.com>',
        to: email,
        subject: `You've been added to ${teacherName}'s class on JotMinds!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://www.jotminds.com/logo.png" alt="JotMinds Logo" style="height: 48px; width: auto;" />
            </div>
            <h2>Welcome to JotMinds!</h2>
            <p>Hi ${studentName || 'Student'},</p>
            <p>You have been added to <strong>${teacherName}</strong>'s class${schoolName ? ` at <strong>${schoolName}</strong>` : ''} on JotMinds.</p>
            <p>To get started, please sign up for a Student account on JotMinds. When creating your account, use this email address so you are automatically linked to your class.</p>
            <div style="margin-top: 30px;">
              <a href="https://jotminds.com/auth" style="background-color: #6B4C9A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Sign Up Now</a>
            </div>
          </div>
        `
      })
    });
    
    if (response.ok) {
      return c.json({ success: true });
    } else {
      const err = await response.json();
      console.error('[send-student-invite] Resend API error:', err);
      return c.json({ error: 'Failed to send invite via Resend', details: err }, 500);
    }
  } catch (error: any) {
    console.error('[send-student-invite] Server error:', error);
    return c.json({ error: 'Failed to send student invite email', message: error.message }, 500);
  }
});

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
      console.log(`[validate-org-code] ✗ Organization not found for code: ${code}`);
      return c.json({ valid: false, error: 'Invalid organization code' }, 200);
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

function generateWelcomeEmailHtml(name: string, role: string, email: string, orgCode?: string | null): string {
  const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  
  let roleTip = "";
  switch (role.toLowerCase()) {
    case 'student':
      roleTip = "<li><strong>Discover Your Brain Type</strong>: Take your first assessment to map out your Analytical, Creative, and Practical thinking styles.</li>" +
                "<li><strong>Have Fun & Earn Rewards</strong>: Train your brain with daily challenges and collect achievements and badges in your sticker book!</li>";
      break;
    case 'teacher':
      roleTip = "<li><strong>Map Your Classroom</strong>: Share your school code with your students to link them to your class roster automatically.</li>" +
                "<li><strong>Analyze Learning Styles</strong>: Review class-wide cognitive profiles to customize your lesson plans.</li>";
      break;
    case 'parent':
      roleTip = "<li><strong>Link Child Accounts</strong>: Connect your children's profiles to monitor their learning progress and streaks.</li>" +
                "<li><strong>Observe & Support</strong>: Complete Parent Observation assessments to unlock deeper insights.</li>";
      break;
    case 'professional':
      roleTip = "<li><strong>Manage Your Roster</strong>: Invite clients and employees to complete thinking profile assessments.</li>" +
                "<li><strong>Custom Guidance</strong>: View detailed comparative profiles to recommend industry-specific developmental paths.</li>";
      break;
    default:
      roleTip = "<li><strong>Personal Insights</strong>: Take the triarchic cognitive assessments to discover your dominant thinking style.</li>" +
                "<li><strong>Strengthen Skills</strong>: Access our daily workouts and cognitive workout exercises.</li>";
  }

  const orgCodeSection = orgCode 
    ? `<div style="background-color: #EEF2F6; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #4F46E5;">
        <span style="font-size: 14px; color: #4A5568; display: block; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Organization Code</span>
        <strong style="font-size: 20px; color: #1E293B; letter-spacing: 1px;">${orgCode}</strong>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #718096;">Share this code with your members/students to link them to your roster automatically.</p>
       </div>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to JotMinds</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px; text-align: center;">
              <div style="text-align: center; margin-bottom: 15px;">
                <img src="https://www.jotminds.com/logo.png" alt="JotMinds Logo" style="height: 48px; width: auto;" />
              </div>
              <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Welcome to JotMinds</h1>
              <p style="color: #E2E8F0; margin: 10px 0 0 0; font-size: 16px;">Discover How You Think and Learn</p>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 40px; color: #1E293B; line-height: 1.6;">
              <p style="font-size: 16px; margin-top: 0;">Hello <strong>${name}</strong>,</p>
              
              <p style="font-size: 15px;">Thank you for creating an account on JotMinds! We are thrilled to have you join our community.</p>
              
              <p style="font-size: 15px;"><strong>What is JotMinds?</strong> JotMinds is a collaborative learning and cognitive profiling platform. Our goal is to bridge the gap between individual thinking styles and organizational/classroom knowledge sharing by mapping out unique traits based on Sternberg's Triarchic Theory.</p>

              <!-- Account Details Box -->
              <div style="background-color: #F1F5F9; border-radius: 10px; padding: 20px; margin: 25px 0;">
                <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 15px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">Account Details</h3>
                <table width="100%" border="0" cellspacing="0" cellpadding="5">
                  <tr>
                    <td width="30%" style="font-size: 14px; color: #64748B; font-weight: 600;">Email Address:</td>
                    <td style="font-size: 14px; color: #334155;">${email}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #64748B; font-weight: 600;">Account Type:</td>
                    <td style="font-size: 14px; color: #334155;">${normalizedRole}</td>
                  </tr>
                </table>
                ${orgCodeSection}
              </div>

              <!-- Next Steps section -->
              <h3 style="font-size: 16px; color: #1E293B; margin-top: 30px; margin-bottom: 15px;">Here's how to get started:</h3>
              <ul style="padding-left: 20px; margin-bottom: 30px; font-size: 15px; color: #475569;">
                ${roleTip}
                <li><strong>Organize and Share</strong>: Capture ideas instantly and keep track of your jots and notes.</li>
              </ul>

              <!-- Call to Action -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 35px; text-align: center;">
                <tr>
                  <td align="center">
                    <a href="https://jotminds.com" style="background-color: #4F46E5; color: #FFFFFF; font-weight: 600; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.25);">Go to Dashboard</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 25px 40px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="font-size: 13px; color: #94A3B8; margin: 0 0 5px 0;">&copy; 2026 JotMinds. All rights reserved.</p>
              <p style="font-size: 12px; color: #CBD5E1; margin: 0;">This email was sent to you because you registered for a JotMinds account.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Sign up
app.post('/make-server-fc8eb847/signup', async (c) => {
  try {
    const { email, password, name, role, organizationName, organizationType, industrySector, position, phone, secondaryEmail, secondaryPhone, school, educationLevel, dateOfBirth, organizationCode, hasConsented, consentType, consentDate } = await c.req.json();
    
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
    } else if ((role === 'professional' || role === 'teacher') && organizationCode) {
      // Professional or Teacher can optionally provide an organization code
      const organization = await kv.get(`organization:${organizationCode}`);
      if (!organization) {
        return c.json({ error: 'Invalid organization code' }, 400);
      }

      finalOrgCode = organizationCode;
      finalOrgName = organization.name;
    }

    const supabase = getSupabaseClient(true);
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since email server isn't configured
      user_metadata: { name, role, organizationName: finalOrgName, organizationType, industrySector, position, phone, secondaryEmail, secondaryPhone, school, educationLevel, dateOfBirth, organizationCode: finalOrgCode, hasConsented, consentType, consentDate }
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
      secondaryEmail: secondaryEmail || null,
      secondaryPhone: secondaryPhone || null,
      school: school || null,
      educationLevel: educationLevel || null,
      dateOfBirth: dateOfBirth || null,
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

    // Send welcome email via Resend HTTP API (avoids SMTP port-blocking in serverless runtime)
    try {
      console.log(`[signup] Triggering welcome email for ${email}`);
      const resendApiKey = Deno.env.get('RESEND_API_KEY') || 're_eFr3vz6q_G7KDp6TjnDLVUX2JyouKEbfG';
      if (resendApiKey) {
        const welcomeHtml = generateWelcomeEmailHtml(name, role, email, finalOrgCode);
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'JotMinds Support <service@jotminds.com>',
            to: email,
            subject: 'Welcome to JotMinds! 🧠',
            html: welcomeHtml
          })
        });

        if (response.ok) {
          console.log(`[signup] ✓ Welcome email successfully sent to ${email} via Resend`);
        } else {
          const errData = await response.json();
          console.error(`[signup] ✗ Resend API returned error:`, errData);
        }
      } else {
        console.error(`[signup] ✗ RESEND_API_KEY is not configured in environment`);
      }
    } catch (emailErr) {
      console.error(`[signup] ✗ Error sending welcome email:`, emailErr);
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

    // Check if their organization is active
    if (userData.organizationCode) {
      const org = await kv.get(`organization:${userData.organizationCode}`);
      if (org && org.isActive === false) {
        // If they are the founder, we might want to let them login to reactivate it,
        // but the requirements say "Activate/deactivate institution account" 
        // We'll let the 'organization' role login to reactivate, but block others
        if (userData.role !== 'organization') {
          return c.json({ error: 'Your institution account has been deactivated.' }, 403);
        }
      }
    }

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
    
    // Check if their organization is active
    if (userData.organizationCode) {
      const org = await kv.get(`organization:${userData.organizationCode}`);
      if (org && org.isActive === false && userData.role !== 'organization') {
        return c.json({ error: 'Your institution account has been deactivated.' }, 403);
      }
    }
    
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

// Get school roster (students and teachers)
app.get('/make-server-fc8eb847/school/roster', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userProfile = await kv.get(`user:${user.id}`);
    
    // Check school-admin or admin role
    if (userProfile?.role !== 'school-admin' && userProfile?.role !== 'admin' && userProfile?.role !== 'teacher' && user.id !== 'admin-001') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const schoolName = userProfile?.school;
    
    if (!schoolName) {
      return c.json({ success: true, students: [], teachers: [] });
    }

    console.log(`[Backend] Fetching roster for school: ${schoolName}`);

    const allUsers = await kv.getByPrefix('user:');
    
    const rosterUsers = allUsers.filter((u: any) => 
      u.school && u.school.toLowerCase().trim() === schoolName.toLowerCase().trim()
    );

    const students = rosterUsers.filter((u: any) => u.role === 'student').map((s: any) => ({
      id: s.id,
      name: s.name,
      learningStyle: s.learningStyle || 'Unknown',
      thinkingStyle: s.thinkingStyle || 'Unknown',
      strengths: s.strengths || [],
      areasForImprovement: s.areasForImprovement || [],
      recentScores: s.recentScores || {
        analytical: 70, creative: 70, practical: 70, reflection: 70, intuition: 70, logic: 70
      },
      lastAssessmentDate: s.lastAssessmentDate || s.createdAt || new Date().toISOString()
    }));

    const teachers = rosterUsers.filter((u: any) => u.role === 'teacher').map((t: any) => ({
      id: t.id,
      name: t.name,
      subjects: t.subjects || [],
      classes: t.classes || []
    }));

    return c.json({ success: true, students, teachers });
  } catch (error) {
    console.error('[Backend] Error fetching school roster:', error);
    return c.json({ error: 'Failed to fetch school roster' }, 500);
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

// Get supervised employees (for Supervisor role)
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

    if (targetSupervisorId) {
      // If target matches authenticated user, allow it (redundant but safe)
      if (targetSupervisorId === user.id) {
        supervisorId = user.id;
      }
      // Only allow admin to specify a DIFFERENT supervisor ID
      else if (user.id === 'admin-001' || user.user_metadata?.role === 'admin') {
        console.log('[supervisor/employees] Admin requesting data for supervisor:', targetSupervisorId);
        supervisorId = targetSupervisorId;
      } else {
        console.log('[supervisor/employees] ✗ Non-admin tried to request data for another supervisor');
        return c.json({ error: 'Forbidden - Admin access required to view other supervisors' }, 403);
      }
    }

    const userProfile = await kv.get(`user:${supervisorId}`);
    console.log('[supervisor/employees] Supervisor profile:', userProfile ? 'Found' : 'NOT FOUND');
    console.log('[supervisor/employees] Supervisor profile role:', userProfile?.role);
    
    if (!userProfile) {
      console.log('[supervisor/employees] ✗ User profile not found in KV store');
      return c.json({ error: 'User profile not found' }, 404);
    }
    
    // Accept both 'organization' and 'supervisor' roles (they're the same in this context)
    const normalizedRole = (userProfile?.role || '').toLowerCase();
    if (normalizedRole !== 'supervisor' && normalizedRole !== 'organization') {
      console.log('[supervisor/employees] ✗ User is not a supervisor/organization, role:', userProfile?.role);
      return c.json({ error: 'Forbidden - Organization/Supervisor access required' }, 403);
    }

    let orgCode = userProfile.organizationCode;
    console.log('[supervisor/employees] Organization code from profile:', orgCode);
    
    // MIGRATION FIX: If supervisor doesn't have an org code, generate one now
    if (!orgCode) {
      console.log(`[Migration] Supervisor ${supervisorId} has no organization code, generating one...`);
      orgCode = generateOrgCode();
      
      // Store organization
      await kv.set(`organization:${orgCode}`, {
        code: orgCode,
        name: userProfile.organizationName,
        type: userProfile.organizationType,
        createdAt: new Date().toISOString(),
        createdBy: userProfile.email
      });
      
      // Update user profile with the new code
      const updatedProfile = {
        ...userProfile,
        organizationCode: orgCode
      };
      await kv.set(`user:${supervisorId}`, updatedProfile);
      
      console.log(`[Migration] Generated organization code ${orgCode} for supervisor ${supervisorId}`);
    }

    console.log('[supervisor/employees] Fetching all users...');
    const allUsers = await kv.getByPrefix('user:');
    console.log('[supervisor/employees] Total users in KV:', allUsers.length);
    
    // Filter users by organization code who are professionals
    const employees = allUsers.filter((u: any) => {
      const matches = u.organizationCode === orgCode && 
        (u.role === 'Professional/Organization' || u.role === 'professional') && 
        u.id !== supervisorId;
      
      if (u.organizationCode === orgCode) {
        console.log(`[supervisor/employees] User ${u.email} - orgCode match: ${u.organizationCode}, role: ${u.role}, matches: ${matches}`);
      }
      
      return matches;
    });

    console.log('[supervisor/employees] ✓ Found', employees.length, 'employees for org code:', orgCode);
    
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
        const diff = Math.abs(system1 - system2);
        if (diff < 5) return 'Balanced';
        return system1 > system2 ? 'Intuitive' : 'Reflective';
      }
      return 'Unknown';
    };
    
    // Fetch assessments AND reviews for each employee
    const employeesWithAssessments = await Promise.all(employees.map(async (emp: any) => {
      const assessments = await kv.getByPrefix(`result:${emp.id}:`);
      const completedAssessments = assessments.filter((a: any) => a.completedAt);
      
      // Fetch reviews
      const reviews = await kv.getByPrefix(`review:${emp.id}:`);
      
      return {
        ...emp,
        reviews: reviews || [],
        assessments: completedAssessments.map((a: any) => {
          const assessmentType = a.assessmentType;
          const results = a.results || {};
          
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
            // For other assessment types, pass results directly
            score[assessmentType] = results;
          }
          
          return {
            id: a.id || `result:${emp.id}:${assessmentType}`,
            userId: emp.id,
            type: assessmentType,
            responses: a.answers || a.responses || [],
            score: score,
            completedAt: a.completedAt
          };
        })
      };
    }));

    return c.json({ success: true, employees: employeesWithAssessments, organizationCode: orgCode });
  } catch (error) {
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
// Organization Management (Self-Serve)
app.patch('/make-server-fc8eb847/organization/profile', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (user.role !== 'organization' && user.role !== 'supervisor' && user.role !== 'Supervisor') {
      return c.json({ error: 'Forbidden - Organization access required' }, 403);
    }

    const { name, type, industrySector, logoUrl, isActive } = await c.req.json();
    
    // An organization user's ID is their email, and their KV should hold their organizationCode
    // Let's fetch the user to get their organizationCode
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || !userProfile.organizationCode) {
      return c.json({ error: 'User does not belong to an organization' }, 400);
    }
    
    const orgCode = userProfile.organizationCode;
    const org = await kv.get(`organization:${orgCode}`);
    
    if (!org) {
      return c.json({ error: 'Organization not found' }, 404);
    }

    // Update organization
    const updatedOrg = {
      ...org,
      name: name || org.name,
      type: type || org.type,
      industrySector: industrySector !== undefined ? industrySector : org.industrySector,
      logoUrl: logoUrl !== undefined ? logoUrl : org.logoUrl,
      isActive: isActive !== undefined ? isActive : (org.isActive !== false)
    };

    await kv.set(`organization:${orgCode}`, updatedOrg);

    // If the organization was just deactivated, send an email to all its members
    if (org.isActive !== false && updatedOrg.isActive === false) {
      try {
        console.log(`[organization/profile] Organization ${orgCode} deactivated. Sending emails to members.`);
        const allUsers = await kv.getByPrefix('user:');
        const members = allUsers.filter((u: any) => u.organizationCode === orgCode);
        
        const resendApiKey = Deno.env.get('RESEND_API_KEY') || 're_eFr3vz6q_G7KDp6TjnDLVUX2JyouKEbfG';
        
        const emailPromises = members.map((member: any) => {
          if (!member.email) return Promise.resolve();
          
          return fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: 'JotMinds Support <service@jotminds.com>',
              to: member.email,
              subject: 'Institution Account Deactivated',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                  <div style="margin-bottom: 20px;">
                    <img src="https://www.jotminds.com/logo.png" alt="JotMinds Logo" style="height: 48px; width: auto;" />
                  </div>
                  <h2 style="color: #e11d48;">Institution Account Deactivated</h2>
                  <p>Hello ${member.name || 'there'},</p>
                  <p>We are writing to inform you that your institution's account (<strong>${updatedOrg.name}</strong>) on JotMinds has been deactivated by the institution administrator.</p>
                  <p>You will no longer be able to log in or access your dashboard until the account is reactivated.</p>
                  <p>If you believe this is an error, please contact your institution's administrator directly.</p>
                  <br/>
                  <p>Best regards,<br/>The JotMinds Team</p>
                </div>
              `
            })
          });
        });
        
        await Promise.allSettled(emailPromises);
        console.log(`[organization/profile] Successfully queued deactivation emails to ${members.length} members.`);
      } catch (emailError) {
        console.error(`[organization/profile] Failed to send deactivation emails: ${emailError}`);
        // Do not block the successful profile update response
      }
    }

    return c.json({ success: true, organization: updatedOrg });
  } catch (error) {
    console.log(`Error updating organization profile: ${error}`);
    return c.json({ error: 'Failed to update organization profile' }, 500);
  }
});

app.post('/make-server-fc8eb847/organization/assign-admin', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (user.role !== 'organization' && user.role !== 'supervisor' && user.role !== 'Supervisor') {
      return c.json({ error: 'Forbidden - Organization access required' }, 403);
    }

    const { email } = await c.req.json();
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || !userProfile.organizationCode) {
      return c.json({ error: 'User does not belong to an organization' }, 400);
    }

    // Find the target user by email
    const users = await kv.getByPrefix('user:');
    const targetUser = users.find((u: any) => u.email === email);
    
    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update target user
    const updatedTargetUser = {
      ...targetUser,
      role: 'supervisor',
      organizationCode: userProfile.organizationCode,
      organizationName: userProfile.organizationName
    };

    await kv.set(`user:${targetUser.id}`, updatedTargetUser);

    return c.json({ success: true, message: 'Administrator assigned successfully' });
  } catch (error) {
    console.log(`Error assigning administrator: ${error}`);
    return c.json({ error: 'Failed to assign administrator' }, 500);
  }
});

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

// ============= PASSWORD RESET ROUTES =============

// Request password reset
app.post('/make-server-fc8eb847/auth/request-password-reset', async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const supabase = getSupabaseClient(true);

    // Send password reset email with deep link
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${c.req.header('origin') || 'https://femvnconxoefpctiptkj.supabase.co'}#type=recovery`
    });

    if (error) {
      console.error('Password reset request error:', error.message);
      // Don't reveal if email exists - always return success for security
    }

    console.log(`Password reset requested for: ${email}`);
    return c.json({ success: true, message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return c.json({ error: 'Failed to request password reset' }, 500);
  }
});

// Verify password reset token
app.post('/make-server-fc8eb847/auth/verify-reset-token', async (c) => {
  try {
    const { accessToken } = await c.req.json();

    if (!accessToken) {
      return c.json({ error: 'Access token is required' }, 400);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.error('Token verification error:', error?.message || 'User not found');
      return c.json({ error: 'Invalid or expired reset token' }, 401);
    }

    return c.json({ success: true, userId: user.id, email: user.email });
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return c.json({ error: 'Failed to verify token' }, 500);
  }
});

// Reset password with token
app.post('/make-server-fc8eb847/auth/reset-password', async (c) => {
  try {
    const { accessToken, newPassword } = await c.req.json();

    if (!accessToken || !newPassword) {
      return c.json({ error: 'Access token and new password are required' }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    const supabase = getSupabaseClient(true);

    // Verify token first
    const { data: { user }, error: verifyError } = await supabase.auth.getUser(accessToken);

    if (verifyError || !user) {
      console.error('Token verification failed:', verifyError?.message || 'User not found');
      return c.json({ error: 'Invalid or expired reset token' }, 401);
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError.message);
      return c.json({ error: updateError.message }, 400);
    }

    console.log(`Password reset successful for user: ${user.id}`);
    return c.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return c.json({ error: 'Failed to reset password' }, 500);
  }
});

// ============= OAUTH CONSENT ROUTES =============

// Generate OAuth consent session
app.post('/make-server-fc8eb847/oauth/consent/create', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { clientId, scope, redirectUri } = await c.req.json();

    if (!clientId || !scope || !redirectUri) {
      return c.json({ error: 'Missing required OAuth parameters' }, 400);
    }

    // Generate state token
    const state = crypto.randomUUID();

    // Store consent request
    const consentData = {
      userId: user.id,
      clientId,
      scope: Array.isArray(scope) ? scope : [scope],
      redirectUri,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
    };

    await kv.set(`auth:oauth:${state}:consent`, consentData);

    console.log(`OAuth consent session created: ${state} for user: ${user.id}`);
    return c.json({ success: true, state, consentData });
  } catch (error) {
    console.error('Error creating OAuth consent:', error);
    return c.json({ error: 'Failed to create consent session' }, 500);
  }
});

// Get OAuth consent details
app.get('/make-server-fc8eb847/oauth/consent/:state', async (c) => {
  try {
    const state = c.req.param('state');

    const consentData = await kv.get(`auth:oauth:${state}:consent`);

    if (!consentData) {
      return c.json({ error: 'Invalid or expired consent session' }, 404);
    }

    // Check expiration
    if (new Date(consentData.expiresAt) < new Date()) {
      await kv.del(`auth:oauth:${state}:consent`);
      return c.json({ error: 'Consent session expired' }, 410);
    }

    return c.json({ success: true, consent: consentData });
  } catch (error) {
    console.error('Error fetching OAuth consent:', error);
    return c.json({ error: 'Failed to fetch consent' }, 500);
  }
});

// Approve OAuth consent
app.post('/make-server-fc8eb847/oauth/consent/approve', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { state } = await c.req.json();

    if (!state) {
      return c.json({ error: 'State parameter is required' }, 400);
    }

    const consentData = await kv.get(`auth:oauth:${state}:consent`);

    if (!consentData) {
      return c.json({ error: 'Invalid or expired consent session' }, 404);
    }

    if (consentData.userId !== user.id) {
      return c.json({ error: 'Unauthorized - user mismatch' }, 403);
    }

    // Generate authorization code
    const authCode = crypto.randomUUID();

    // Store authorization
    await kv.set(`auth:oauth:${authCode}:authorization`, {
      userId: user.id,
      clientId: consentData.clientId,
      scope: consentData.scope,
      redirectUri: consentData.redirectUri,
      approvedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
    });

    // Clean up consent session
    await kv.del(`auth:oauth:${state}:consent`);

    console.log(`OAuth consent approved for user: ${user.id}, code: ${authCode}`);
    return c.json({
      success: true,
      authorizationCode: authCode,
      redirectUri: `${consentData.redirectUri}?code=${authCode}&state=${state}`
    });
  } catch (error) {
    console.error('Error approving OAuth consent:', error);
    return c.json({ error: 'Failed to approve consent' }, 500);
  }
});

// Deny OAuth consent
app.post('/make-server-fc8eb847/oauth/consent/deny', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { state } = await c.req.json();

    if (!state) {
      return c.json({ error: 'State parameter is required' }, 400);
    }

    const consentData = await kv.get(`auth:oauth:${state}:consent`);

    if (!consentData) {
      return c.json({ error: 'Invalid or expired consent session' }, 404);
    }

    // Clean up consent session
    await kv.del(`auth:oauth:${state}:consent`);

    console.log(`OAuth consent denied by user: ${user.id}`);
    return c.json({
      success: true,
      redirectUri: `${consentData.redirectUri}?error=access_denied&state=${state}`
    });
  } catch (error) {
    console.error('Error denying OAuth consent:', error);
    return c.json({ error: 'Failed to deny consent' }, 500);
  }
});

// Send transactional email route via Titan Mail
app.post('/make-server-fc8eb847/send-email', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { recipientEmail, subject, htmlContent, textContent } = await c.req.json();

    if (!recipientEmail || !subject || (!htmlContent && !textContent)) {
      return c.json({ error: 'Missing recipientEmail, subject, or message content' }, 400);
    }

    console.log(`[send-email] Attempting to send email to ${recipientEmail} with subject: "${subject}"`);

    const transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 465,
      secure: true,
      auth: {
        user: "service@jotminds.com",
        pass: "Service@0248838540",
      },
    });

    await transporter.sendMail({
      from: `"JotMinds Support" <service@jotminds.com>`,
      to: recipientEmail,
      subject: subject,
      text: textContent || htmlContent,
      html: htmlContent || textContent,
    });

    console.log(`[send-email] ✓ Email successfully sent to ${recipientEmail}`);

    return c.json({ success: true, message: 'Email sent successfully via GoDaddy secureserver' });
  } catch (error) {
    console.error('[send-email] ✗ Error sending email:', error);
    return c.json({ 
      error: 'Failed to send email', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// Gamification Profile Endpoints
app.get('/make-server-fc8eb847/gamification/:userId', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const targetUserId = c.req.param('userId');
    // Basic auth check
    if (user.id !== targetUserId && user.id !== 'admin-001' && user.role !== 'admin') {
      const userProfile = await kv.get(`user:${user.id}`);
      let isAuthorized = false;
      if (userProfile?.role === 'parent' && userProfile.linkedChildren?.includes(targetUserId)) {
        isAuthorized = true;
      } else if (userProfile?.role === 'teacher') {
        isAuthorized = true; // Simplified for teacher access
      }
      
      if (!isAuthorized) {
        return c.json({ error: 'Forbidden' }, 403);
      }
    }

    const profile = await kv.get(`gamification:${targetUserId}`);
    return c.json({ success: true, profile: profile || null });
  } catch (error) {
    console.error('[Gamification] Error fetching profile:', error);
    return c.json({ error: 'Failed to fetch gamification profile' }, 500);
  }
});

app.post('/make-server-fc8eb847/gamification/update', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const { profile } = await c.req.json();
    if (!profile || !profile.userId) {
      return c.json({ error: 'Missing profile data' }, 400);
    }

    const userObj = await kv.get(`user:${user.id}`);
    if (user.id !== profile.userId && user.id !== 'admin-001' && userObj?.role !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await kv.set(`gamification:${profile.userId}`, profile);
    return c.json({ success: true, profile });
  } catch (error) {
    console.error('[Gamification] Error updating profile:', error);
    return c.json({ error: 'Failed to update gamification profile' }, 500);
  }
});
Deno.serve((req) => {
  const url = new URL(req.url);
  if (url.pathname.startsWith('/server/')) {
    url.pathname = url.pathname.replace(/^\/server/, '');
    req = new Request(url.toString(), req);
  }
  return app.fetch(req);
});