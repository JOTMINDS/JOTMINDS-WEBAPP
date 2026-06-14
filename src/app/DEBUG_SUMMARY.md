# JotMinds Debug Summary

## ✅ Recent Changes - Manifest & Document Title

### What Was Changed:
1. **Created `/public/manifest.json`**
   - App name: "JotMinds"
   - Theme color: #2C2E83 (Deep Indigo)
   - Purpose: Controls how browser displays app name in permission prompts

2. **Modified `/App.tsx`**
   - Added document.title setter: "JotMinds - Discover How You Think"
   - Runs on app mount via useEffect

### Expected Behavior:
- ✅ Browser tab shows "JotMinds - Discover How You Think"
- ✅ Permission prompts should show "JotMinds wants to..."
- ✅ PWA installation will use "JotMinds" as app name

---

## 🐛 Built-in Debug Tools

### 1. Debug Panel (Bottom Right Corner)
The app has a floating debug panel that shows:
- **localStorage admin_token**: First 40 chars (or "NOT SET")
- **localStorage admin_user**: "FOUND" or "NOT SET"
- **API authToken**: First 40 chars of in-memory token (or "NOT SET")
- **Last updated**: Real-time timestamp (updates every second)

**Controls:**
- Click "Show Debug Panel" to open
- Click X to close
- Click "Refresh Now" to manually update

**Location:** `/components/DebugPanel.tsx`

### 2. Console Logging
Extensive logging with prefixes for easy filtering:

#### App-Level Logs:
```
[App] ===== MOUNT - Setting up auth =====
[App] Checking localStorage...
[App] admin_token: [status]
[App] admin_user: [status]
[App] Supabase session: [status]
[App] useEffect - Checking user role: [role]
```

#### Auth Logs:
```
[AuthContext] ✓ User refreshed successfully
[AuthContext] ✗ Error refreshing user: [error]
[AuthForm] ✓ Admin login successful
[AuthForm] ✓ Role migrated successfully
[AuthForm] ❌ CRITICAL: [error message]
```

#### Admin Panel Logs:
```
[AdminPanel] Fetching admin data...
[AdminPanel] ✓ Admin data loaded
[AdminPanel] ✗ No admin session found
[AdminPanel] ✗ Error fetching admin data: [error]
```

---

## 🔍 How to Debug Issues

### If App Won't Load:
1. **Check Browser Console (F12 → Console tab)**
   - Look for red error messages
   - Check for [App] MOUNT logs
   - Verify auth setup completed

2. **Check Debug Panel (Bottom Right)**
   - Is authToken set?
   - Is admin_token set (if admin)?
   - Are tokens actually present or showing "NOT SET"?

3. **Check Network Tab (F12 → Network tab)**
   - Look for failed API calls (red status codes)
   - Check calls to `/functions/v1/make-server-fc8eb847/*`
   - Verify authorization headers are present

### If Login Fails:
1. **Console should show:**
   ```
   [AuthForm] Email: [email]
   [AuthForm] Password length: [number]
   [AuthForm] Attempting login...
   ```

2. **Check for error patterns:**
   - "Invalid login credentials" → Wrong email/password
   - "User not found" → Account doesn't exist
   - "Failed to save admin credentials" → localStorage issue

3. **For Admin Login:**
   - Must see: `[AuthForm] ✓ Admin credentials saved to localStorage`
   - Must see: `[App] ✓ Admin token found in localStorage`

### If Permission Prompts Show Wrong Name:
1. **Check Document Title:**
   ```javascript
   // In browser console:
   console.log(document.title);
   // Should show: "JotMinds - Discover How You Think"
   ```

2. **Check Manifest Loaded:**
   - DevTools → Application tab (Chrome) or Storage tab (Firefox)
   - Look for "Manifest" section
   - Verify name: "JotMinds"

3. **Iframe Limitation:**
   - If embedded in Figma iframe, some browsers may still show parent domain
   - This is expected browser behavior for security
   - Will work correctly when deployed to custom domain

### If Assessment/Export/Share Fails:
1. **Look for specific errors:**
   - "Auto-save failed" → Progress saving issue
   - "Clipboard error" → Clipboard API permission denied
   - "Failed to submit assessment" → Server communication issue

2. **Check Network Tab:**
   - Look for POST requests to `/make-server-fc8eb847/*`
   - Check response status (should be 200)
   - Check response body for error messages

---

## 🔧 Common Error Patterns

### Pattern 1: Admin Can't Access Dashboard
**Symptoms:**
- Admin logs in successfully
- Immediately redirected back to admin panel
- Can't view any user dashboards

**Check:**
```
[App] Admin detected, routing to admin panel
[App] ⚠️ Admin in dashboard view without impersonation! Redirecting to admin panel
```

**This is correct behavior!** Admins must:
1. Go to Admin Panel
2. Click "View Dashboard" on a user
3. This sets impersonatedUser
4. Then dashboard shows correctly

### Pattern 2: No Auth Token
**Symptoms:**
- App loads but shows login screen
- User was previously logged in

**Check Debug Panel:**
- All tokens show "NOT SET"

**Check Console:**
```
[App] No admin token, checking Supabase session...
[App] Supabase session: NOT FOUND
[App] No authentication found
```

**Solution:**
- User needs to log in again
- Check if session expired
- Clear localStorage and try fresh login

### Pattern 3: API Calls Failing
**Symptoms:**
- App loads but data won't save/load
- "Failed to load" errors

**Check Network Tab:**
- Status 401 → Auth token invalid/expired
- Status 500 → Server error (check server logs)
- Status 404 → Wrong endpoint URL

**Check Console:**
- Look for specific error messages from catch blocks
- Each component logs its own errors with context

---

## 📊 Data Flow

### Authentication Flow:
1. **User submits login form** → `AuthForm.tsx`
2. **Call Supabase auth** → Get access_token
3. **Save to localStorage** → For admins: save admin_token + admin_user
4. **Set API token** → Call `setAuthToken()` in `/utils/api.ts`
5. **Refresh user** → `AuthContext` loads user data from API
6. **Route to dashboard** → Based on user.role

### Assessment Flow:
1. **User starts assessment** → `Assessment.tsx` or `AssessmentTaking.tsx`
2. **Auto-save progress** → Every answer, debounced 1 second
3. **Submit complete** → Send all answers to server
4. **Calculate scores** → Server processes with scoring logic
5. **Store results** → KV store with key `assessment:{assessmentId}`
6. **Show results** → `AssessmentReport.tsx` or results component

### Admin Impersonation Flow:
1. **Admin clicks "View Dashboard"** → `AdminPanel.tsx`
2. **Call getUserData(userId)** → Fetch target user data
3. **Set impersonatedUser** → In AuthContext state
4. **Route to dashboard** → Shows target user's view
5. **"Log out" = Stop Impersonation** → Clear impersonatedUser, back to admin panel

---

## 🚀 Quick Checks

Run these in browser console to verify state:

```javascript
// Check document title
console.log('Title:', document.title);

// Check localStorage
console.log('Admin Token:', localStorage.getItem('admin_token') ? 'SET' : 'NOT SET');
console.log('Admin User:', localStorage.getItem('admin_user') ? 'SET' : 'NOT SET');

// Check current page URL
console.log('Location:', window.location.href);

// Trigger manual auth check (if you modify App.tsx to expose this)
// You may need to add: window.debugAuth = setupAuth; in the App.tsx
```

---

## 📝 Notes

### Manifest Limitations in Figma Make:
- The manifest.json is created but may not be automatically referenced
- Figma Make auto-generates index.html without manifest link
- Full PWA functionality requires deployment to custom domain
- Document title WILL work immediately regardless

### Debug Panel Purpose:
- Shows real-time auth state
- Useful for debugging admin login issues
- Can be hidden/removed in production
- Located in bottom-right, non-intrusive

### Console Log Strategy:
- Prefixes: `[App]`, `[AuthForm]`, `[AdminPanel]`, etc.
- Symbols: ✓ (success), ✗ (error), ⚠️ (warning)
- Makes filtering easy: Just search for component name in DevTools
- Comprehensive coverage across all major flows

---

## 🎯 Current Status: HEALTHY ✅

Based on code review:
- ✅ Document title properly set
- ✅ Manifest file created with correct structure
- ✅ Auth flow has comprehensive logging
- ✅ Debug panel functional
- ✅ Error handling present in all components
- ✅ No obvious syntax errors or missing dependencies

**If experiencing issues, check browser console first!**
The logging is extensive and will show exactly where the problem is.
