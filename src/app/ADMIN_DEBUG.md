# Admin Panel Debug Guide

## Common Admin Issues & Solutions

### Issue 1: "Admin session expired" Error

**Symptoms:**
- See error message: "Admin session expired. Please log in again."
- Page redirects to home after 2 seconds
- Admin panel won't load

**Debugging Steps:**

1. **Check localStorage** (Open browser console - F12):
```javascript
console.log('admin_token:', localStorage.getItem('admin_token'));
console.log('admin_user:', localStorage.getItem('admin_user'));
```

**Expected Output:**
- `admin_token:` should start with "admin-token-"
- `admin_user:` should show your admin user data

**If Missing:** You need to log in again.

2. **Check Console Logs:**
Look for:
```
[AdminPanel] ===== FETCHING ADMIN DATA =====
[AdminPanel] admin_token: admin-token-...
[AdminPanel] admin_user: FOUND
```

**If you see "NOT FOUND":** Admin session was lost.

---

### Issue 2: Data Won't Load / Infinite Loading

**Symptoms:**
- Admin panel shows "Loading admin panel..." forever
- No data appears
- No error shown

**Debugging Steps:**

1. **Check Network Tab** (F12 → Network):
   - Filter by: `make-server-fc8eb847`
   - Look for these requests:
     - `/admin/users`
     - `/admin/stats`
   
2. **Check Response Status:**
   - **200 OK** = Server responded successfully
   - **401 Unauthorized** = Auth token problem
   - **403 Forbidden** = Not admin user
   - **500 Server Error** = Server issue

3. **Check Response Body:**
   - Click on the request
   - Look at "Response" tab
   - Should see: `{ "success": true, "users": [...] }`
   - If error: `{ "error": "..." }`

4. **Console Logs to Look For:**
```
[AdminPanel] Calling getAllUsers()...
[API] Making request to /admin/users
[API] Admin endpoint detected, localStorage admin_token: admin-token-...
[API] Token type: ADMIN TOKEN
[API] Using X-Admin-Token header for admin authentication
[API] Success on /admin/users
[AdminPanel] Users data received: { success: true, users: [...] }
```

**If you see errors in any step above**, note the specific error message.

---

### Issue 3: Duplicate Roles in Distribution

**Symptoms:**
- "User Distribution by Role" shows duplicates like:
  - "student" and "Student"
  - "teacher" and "Teacher"

**Solution:**
This was just fixed! The server now normalizes all roles. To see the fix:
1. Refresh the admin panel (F5)
2. Roles should now be consolidated

**How it works:**
- Server converts all roles to lowercase
- Maps them to consistent display names
- "professional" → "Professional/Organization"
- "student" → "Student"
- etc.

---

### Issue 4: Can't View User Dashboards

**Symptoms:**
- Click "View Dashboard" on a user
- Nothing happens / error occurs

**Debugging Steps:**

1. **Check Console:**
```
[App] Loading user data for: [userId]
[App] User data loaded: {...}
[App] Setting impersonated user...
```

2. **Check if impersonation is set:**
```javascript
// In browser console:
console.log('Impersonated user:', /* check React state */);
```

3. **Common Issue:** Admin tries to view their own dashboard
   - Admins can only impersonate other users
   - Can't view admin dashboard directly

---

## Quick Health Check

Run this in browser console (F12) when on admin panel:

```javascript
// Admin Health Check
const healthCheck = async () => {
  console.log('=== ADMIN HEALTH CHECK ===');
  
  // 1. Check localStorage
  const adminToken = localStorage.getItem('admin_token');
  const adminUser = localStorage.getItem('admin_user');
  console.log('1. localStorage:');
  console.log('   admin_token:', adminToken ? '✅ PRESENT' : '❌ MISSING');
  console.log('   admin_user:', adminUser ? '✅ PRESENT' : '❌ MISSING');
  
  // 2. Check if token is valid format
  if (adminToken) {
    console.log('2. Token format:', adminToken.startsWith('admin-token-') ? '✅ VALID' : '❌ INVALID');
  }
  
  // 3. Parse admin user
  if (adminUser) {
    try {
      const user = JSON.parse(adminUser);
      console.log('3. Admin user data:', user);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
    } catch (e) {
      console.error('3. Admin user data: ❌ INVALID JSON');
    }
  }
  
  // 4. Test API call
  console.log('4. Testing API call to /admin/stats...');
  try {
    const response = await fetch(
      'https://'+projectId+'.supabase.co/functions/v1/make-server-fc8eb847/admin/stats',
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
          'Authorization': 'Bearer ' + publicAnonKey
        }
      }
    );
    const data = await response.json();
    console.log('   Status:', response.status);
    console.log('   Response:', data);
    if (response.ok) {
      console.log('   Result: ✅ SUCCESS');
    } else {
      console.log('   Result: ❌ FAILED');
    }
  } catch (error) {
    console.error('   Result: ❌ ERROR:', error);
  }
  
  console.log('=== END HEALTH CHECK ===');
};

// Run the check
healthCheck();
```

---

## Manual Fix: Reset Admin Session

If admin panel is completely broken, try this:

**Option 1: Force Re-login**
```javascript
// In browser console:
localStorage.removeItem('admin_token');
localStorage.removeItem('admin_user');
location.reload();
// Then login again
```

**Option 2: Manual Token Set** (Only if you know the admin credentials)
This is advanced - only do if you understand what you're doing:
```javascript
// Create admin token manually
const adminToken = 'admin-token-' + Date.now();
const adminUser = JSON.stringify({
  id: 'admin-001',
  email: 'Alex.Attachey@gmail.com',
  name: 'Admin',
  role: 'admin'
});

localStorage.setItem('admin_token', adminToken);
localStorage.setItem('admin_user', adminUser);
location.reload();
```

---

## Server-Side Debug

Check server logs for these patterns:

**Successful Admin Auth:**
```
[verifyAuth] === Authentication Debug ===
[verifyAuth] X-Admin-Token header: admin-token-...
[verifyAuth] ✓ Admin token detected in X-Admin-Token header
```

**Failed Admin Auth:**
```
[verifyAuth] X-Admin-Token header: NOT PRESENT
[verifyAuth] Authorization token: ...
[verifyAuth] ✗ No access token provided
```

**Admin Stats Endpoint:**
```
[Admin Stats] User authenticated
[Admin Stats] Checking admin email: Alex.Attachey@gmail.com
[Admin Stats] ✓ Admin access granted
[Admin Stats] Fetching users...
[Admin Stats] Found X users
```

---

## Common Error Messages & Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Admin session expired" | No admin_token in localStorage | Log in again |
| "Forbidden - Admin access required" | Token valid but user isn't admin | Check email is Alex.Attachey@gmail.com |
| "Unauthorized" | No token or invalid token | Re-login |
| "Failed to load admin data" | Network/server error | Check server logs, check internet |
| "Cannot read property 'users' of undefined" | API returned unexpected format | Check API response in Network tab |

---

## Expected Data Structures

**Admin User (localStorage.admin_user):**
```json
{
  "id": "admin-001",
  "email": "Alex.Attachey@gmail.com",
  "name": "Admin",
  "role": "admin"
}
```

**Admin Stats Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 10,
    "usersByRole": {
      "Student": 5,
      "Teacher": 2,
      "Parent": 2,
      "Professional/Organization": 1
    },
    "totalAssessments": 15,
    "assessmentsByType": {
      "learning": 5,
      "thinking": 5,
      "decision": 5
    }
  }
}
```

**All Users Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user-123",
      "email": "student@example.com",
      "name": "Student Name",
      "role": "student",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "assessmentsCompleted": ["learning", "thinking"]
    }
  ]
}
```

---

## What Was Just Fixed

### Role Normalization (Just Fixed!)

**Problem:**
- Users created with different capitalizations ("student" vs "Student")
- "Professional/Organization" vs "professional"
- Caused duplicate entries in "User Distribution by Role"

**Solution Applied:**
- Server now normalizes all roles to lowercase first
- Maps to consistent display names
- Handles legacy data

**Code Location:**
`/supabase/functions/server/index.tsx` - Line 515-530 (admin stats endpoint)

**Test:**
1. Refresh admin panel
2. Check "User Distribution by Role"
3. Should see no duplicates
4. All roles properly capitalized

---

## Debug Panel Features

The app has a built-in Debug Panel (bottom-right corner):

**Shows:**
- localStorage admin_token (first 40 chars)
- localStorage admin_user (presence check)
- In-memory API authToken (first 40 chars)
- Auto-updates every second

**Use it to:**
- Verify tokens are set
- Check if token persists across page loads
- See when token gets cleared

---

## Contact/Support

**Files to check:**
- `/components/AdminPanel.tsx` - Frontend admin panel
- `/supabase/functions/server/index.tsx` - Backend admin endpoints
- `/utils/api.ts` - API client with admin auth logic

**Recent changes:**
- Role normalization in stats endpoint ✅
- Admin auth token handling via X-Admin-Token header ✅
- Debug logging throughout ✅

**Known working state:**
- Admin login creates admin_token in localStorage ✅
- API checks localStorage for admin endpoints ✅
- Server validates X-Admin-Token header ✅
- Stats endpoint normalizes roles ✅
