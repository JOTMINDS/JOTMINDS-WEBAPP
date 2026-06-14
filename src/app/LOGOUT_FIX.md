# Logout Fix - Proper Sign Out Functionality

## Problem
The logout button in the AdminPanel and other dashboards was not actually logging users out. Clicking "Logout" would only navigate between views without clearing the authentication session.

## Root Cause
1. **AdminPanel**: The logout button called `onBack()` which just navigated, didn't clear auth
2. **Role Dashboards**: All dashboards passed `handleBackToDashboard` as the logout handler
3. **handleBackToDashboard**: This function only changed views and cleared impersonation, but didn't call `signOut()`
4. **Missing signOut call**: The AuthContext's `signOut()` function (which clears localStorage and Supabase session) was never being called

## Solution

### 1. Added Proper Logout Handler
Created a dedicated `handleLogout` function in App.tsx that:
- Calls the AuthContext `signOut()` method
- Clears admin tokens from localStorage
- Clears Supabase auth session
- Clears auth tokens from memory
- Resets view to landing page

```tsx
const handleLogout = async () => {
  console.log('[App] Logout requested');
  await signOut();
  setCurrentView('landing');
  setCurrentAssessment(null);
  setAssessmentResults(null);
};
```

### 2. Updated AdminPanel
- Added `onLogout` prop to AdminPanelProps
- Made logout button conditional:
  - When impersonating: Shows "Back to Admin Panel" → calls `onBack()`
  - When NOT impersonating: Shows "Logout" → calls `onLogout()`
- Updated error state to use `onLogout` instead of `onBack`

**Before:**
```tsx
<Button onClick={onBack}>
  <ArrowLeft />
  {impersonatedUser ? 'Back to Admin Panel' : 'Logout'}
</Button>
```

**After:**
```tsx
{impersonatedUser ? (
  <Button onClick={onBack}>
    <ArrowLeft />Back to Admin Panel
  </Button>
) : (
  <Button onClick={onLogout}>
    <ArrowLeft />Logout
  </Button>
)}
```

### 3. Fixed Role-Specific Dashboard Logout
Updated all role-specific dashboards to use the correct logout handler:

```tsx
// Determine if we should logout or go back to admin panel
const logoutHandler = impersonatedUser ? handleBackToDashboard : handleLogout;

// Pass correct handler to each dashboard
<TeacherDashboard user={displayUser} onLogout={logoutHandler} />
<StudentDashboard user={displayUser} onLogout={logoutHandler} />
<ParentDashboard user={displayUser} onLogout={logoutHandler} />
<ProfessionalDashboard user={displayUser} onLogout={logoutHandler} />
```

This ensures:
- **When admin impersonates**: "Logout" returns to admin panel (doesn't sign out)
- **When regular user or admin NOT impersonating**: "Logout" actually signs out

### 4. What signOut() Does (from AuthContext)
```tsx
const signOut = async () => {
  // Clear admin session
  localStorage.removeItem('admin_user');
  localStorage.removeItem('admin_token');
  
  // Sign out from Supabase
  const supabase = createClient();
  await supabase.auth.signOut();
  
  // Clear state
  setUser(null);
  setImpersonatedUser(null);
  clearAuthToken();
};
```

## What Gets Cleared on Logout

### localStorage
- ✅ `admin_user` - Admin user data
- ✅ `admin_token` - Admin authentication token
- ✅ Supabase session cookies (handled by `supabase.auth.signOut()`)

### In-Memory State
- ✅ `authToken` - API auth token (via `clearAuthToken()`)
- ✅ `user` - Current user state
- ✅ `impersonatedUser` - Impersonation state
- ✅ `currentView` - Reset to 'landing'
- ✅ `currentAssessment` - Cleared
- ✅ `assessmentResults` - Cleared

### Supabase Session
- ✅ Access token invalidated
- ✅ Refresh token invalidated
- ✅ Session cookies cleared

## Testing the Fix

### Test 1: Admin Logout (Not Impersonating)
1. Log in as admin (Alex.Attachey@gmail.com)
2. View Admin Panel
3. Click "Logout" button
4. **Expected**: 
   - Redirected to landing page
   - localStorage cleared
   - Must log in again to access admin

### Test 2: Admin Impersonating User
1. Log in as admin
2. Click "View Dashboard" on a user
3. See role-specific dashboard with "Logout" button
4. Click "Logout"
5. **Expected**:
   - Return to Admin Panel (not logged out)
   - Can still manage other users
   - Still authenticated as admin

### Test 3: Regular User Logout (Student/Teacher/Parent/Professional)
1. Log in as regular user
2. View their role-specific dashboard
3. Click "Logout" button
4. **Expected**:
   - Redirected to landing page
   - Session cleared
   - Must log in again

### Test 4: Admin Logout from Error State
1. Trigger admin panel error (e.g., clear localStorage mid-session)
2. See error screen
3. Click "Logout" button
4. **Expected**:
   - Return to landing page
   - Can sign in again

## Verification Commands

### Check if session is cleared
```javascript
// Run in browser console after logout
console.log('admin_token:', localStorage.getItem('admin_token'));  // Should be null
console.log('admin_user:', localStorage.getItem('admin_user'));    // Should be null
```

### Check Supabase session
```javascript
import { createClient } from './utils/supabase/client';
const supabase = createClient();
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session);  // Should be null after logout
```

## Files Modified

1. `/App.tsx`
   - Added `handleLogout` function
   - Updated `handleBackToDashboard` (removed admin logout logic)
   - Added `signOut` to useAuth destructuring
   - Passed `onLogout` to AdminPanel
   - Added `logoutHandler` conditional logic for role dashboards

2. `/components/AdminPanel.tsx`
   - Added `onLogout` prop to interface
   - Made logout button conditional (impersonation vs logout)
   - Updated error state logout button

3. `/components/AuthContext.tsx`
   - No changes needed (signOut already implemented correctly)

## Regression Tests

- [x] Admin can logout from Admin Panel
- [x] Admin logout clears localStorage
- [x] Admin logout clears Supabase session
- [x] Admin impersonating user can return to admin panel
- [x] Regular users can logout from their dashboards
- [x] Regular user logout clears session
- [x] After logout, user must re-authenticate
- [x] Error state logout works correctly
- [x] No console errors during logout

## Related Documentation

- `/ADMIN_AUTH_FIX.md` - Admin authentication system
- `/ADMIN_ACCESS.md` - Admin panel access and features
- `/components/AuthContext.tsx` - Authentication context and signOut implementation
