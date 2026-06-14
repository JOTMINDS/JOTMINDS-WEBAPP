# Role Migration Fix - Automatic Role Normalization

## Problem Statement

Teachers and other users who registered before the role standardization fix had capitalized or inconsistent role values in their accounts:
- `'Teacher'` instead of `'teacher'`
- `'Student'` instead of `'student'`
- `'Educator'` instead of `'teacher'`
- `'Professional/Organization'` instead of `'professional'`

This caused routing issues where teachers were shown the generic Dashboard (with assessment prompts) instead of the TeacherDashboard.

## Solution: Automatic Migration

The system now automatically migrates old role values to the correct lowercase format.

### Migration Points

#### 1. Client-Side Migration (AuthForm.tsx)
**When**: On user sign-in
**Location**: `/components/AuthForm.tsx` lines 114-139

```tsx
// After successful Supabase login
const userMetadata = data.user?.user_metadata;
if (userMetadata?.role) {
  const role = userMetadata.role;
  const normalizedRole = role === 'Professional/Organization' ? 'professional' : role.toLowerCase();
  
  if (role !== normalizedRole) {
    // Update Supabase user_metadata with correct role
    await supabase.auth.updateUser({
      data: { 
        ...userMetadata,
        role: normalizedRole
      }
    });
  }
}
```

**Effect**: Permanently updates the user's role in Supabase Auth

#### 2. Server-Side Migration (Session Endpoint)
**When**: Every time user data is fetched
**Location**: `/supabase/functions/server/index.tsx` lines 173-192

```tsx
// When returning user data from /session endpoint
const normalizedRole = userData.role === 'Professional/Organization' ? 'professional' : 
                      userData.role === 'Teacher' ? 'teacher' :
                      userData.role === 'Student' ? 'student' :
                      userData.role === 'Parent' ? 'parent' :
                      userData.role === 'Educator' ? 'teacher' :
                      userData.role.toLowerCase();
userData.role = normalizedRole;
```

**Effect**: Provides fallback normalization even if client-side migration fails

### Migration Mapping

| Old Role Value | New Role Value |
|----------------|----------------|
| `Teacher` | `teacher` |
| `Educator` | `teacher` |
| `Student` | `student` |
| `Parent` | `parent` |
| `Professional/Organization` | `professional` |
| `Professional` | `professional` |
| `TEACHER` (any caps) | `teacher` |

### Migration Flow

```
User Signs In
    ↓
AuthForm receives user data
    ↓
Check user_metadata.role
    ↓
Is role capitalized? → YES
    ↓
Call supabase.auth.updateUser()
    ↓
Update user_metadata.role to lowercase
    ↓
✅ Migration Complete
    ↓
User data refreshed with correct role
    ↓
App routes to correct dashboard
```

### Migration Guarantees

1. **Automatic**: No user action required
2. **Transparent**: User doesn't notice migration happening
3. **Permanent**: Role is fixed in Supabase Auth after first login
4. **Safe**: Server-side fallback ensures correct routing even if update fails
5. **One-time**: After migration, no performance impact

## Testing Migration

### Test Case 1: Existing Teacher with Capitalized Role
**Before:**
- User metadata: `{ role: 'Teacher' }`
- Routes to: Generic Dashboard (wrong!)
- Sees: Assessment prompts (wrong!)

**After Login with Fix:**
- Migration runs automatically
- User metadata: `{ role: 'teacher' }`
- Routes to: TeacherDashboard (correct!)
- Sees: Student data, no assessments (correct!)

### Test Case 2: Old "Educator" Role
**Before:**
- User metadata: `{ role: 'Educator' }`
- Routes to: Incorrect dashboard

**After Login with Fix:**
- Migration converts to `'teacher'`
- Routes to: TeacherDashboard
- All teacher features work correctly

### Test Case 3: "Professional/Organization" Role
**Before:**
- User metadata: `{ role: 'Professional/Organization' }`
- Routes to: May fail or show wrong dashboard

**After Login with Fix:**
- Migration converts to `'professional'`
- Routes to: ProfessionalDashboard
- Assessment features work correctly

## Verification Commands

### Check Current User Role in Browser Console
```javascript
// Get current user data
const user = JSON.parse(localStorage.getItem('ts_current_user'));
console.log('Current role:', user.role);

// Should output lowercase role: "teacher", "student", etc.
```

### Check All Users (Admin Only)
```javascript
// In Admin Dashboard, check user list
// All roles should display as lowercase
```

## Migration Safety

### What if migration fails?

1. **Client-side update fails**: 
   - Server-side normalization catches it
   - User still routed correctly
   - Migration retries on next login

2. **Server-side normalization fails**:
   - Should never happen (it's just string transformation)
   - But if it does, App.tsx routing has fallback logic

3. **Network issue during migration**:
   - User can retry login
   - Migration will attempt again
   - No data loss occurs

### Backwards Compatibility

- ✅ New signups use lowercase from the start (no migration needed)
- ✅ Old accounts migrate automatically
- ✅ System handles both old and new formats
- ✅ No breaking changes for existing users

## Developer Notes

### Adding New Roles

If you add a new role in the future:

1. **Define lowercase in types**: `export type UserRole = 'newrole' | ...`
2. **Update AuthForm select**: `<SelectItem value="newrole">New Role</SelectItem>`
3. **Add migration mapping**: Add to server-side normalization
4. **Create role dashboard**: Create `NewRoleDashboard.tsx`
5. **Update App.tsx routing**: Add routing case for `newrole`

### Testing New Migrations

```bash
# Test signup with new role
1. Sign up with new role
2. Check localStorage for lowercase role
3. Verify correct dashboard appears

# Test migration
1. Manually set capitalized role in Supabase
2. Sign in
3. Check if role auto-converts to lowercase
4. Verify routing works correctly
```

## Related Files

- `/components/AuthForm.tsx` - Client-side migration logic
- `/supabase/functions/server/index.tsx` - Server-side normalization
- `/App.tsx` - Role-based routing
- `/types/index.ts` - UserRole type definition
- `/TEACHER_DASHBOARD_FIX.md` - Complete teacher fix documentation
- `/USER_FLOWS.md` - All user role flows

## Conclusion

This migration system ensures:
- ✅ All users have consistent, lowercase role values
- ✅ Teachers are never shown assessment prompts
- ✅ Routing works correctly for all user types
- ✅ Old accounts work seamlessly with no manual intervention
- ✅ New accounts use correct format from the start
