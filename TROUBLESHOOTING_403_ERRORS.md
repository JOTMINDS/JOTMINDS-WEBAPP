# Troubleshooting 403 Forbidden Errors in JotMinds

## Quick Diagnosis

**Test your deployment status:**
```bash
# Test health endpoint (should return 200 OK with diagnostics)
curl -H "Authorization: Bearer YOUR_ANON_KEY" \
  https://femvnconxoefpctiptkj.supabase.co/functions/v1/make-server-fc8eb847/health
```

Your anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA`

---

## Common 403 Error Causes

### 1. **Table Doesn't Exist** ⚠️ Most Likely
**Symptom:** Edge Functions deploy but database operations fail  
**Cause:** The `kv_store_fc8eb847` table hasn't been created yet

**Fix:**
1. Go to: https://supabase.com/dashboard/project/femvnconxoefpctiptkj/database/tables
2. Click "New Table"
3. Create table with exact schema:

```sql
CREATE TABLE kv_store_fc8eb847 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

4. **Important:** Disable RLS or add permissive policy:

```sql
-- Option 1: Disable RLS (simpler for development)
ALTER TABLE kv_store_fc8eb847 DISABLE ROW LEVEL SECURITY;

-- Option 2: Enable RLS with permissive policy
ALTER TABLE kv_store_fc8eb847 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role bypass" ON kv_store_fc8eb847
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### 2. **RLS Policies Blocking Access**
**Symptom:** "new row violates row-level security policy" or generic 403  
**Cause:** RLS is enabled but no policies allow access

**Fix:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'kv_store_fc8eb847';

-- If rowsecurity = true, add policy for service role
CREATE POLICY "Allow all for service role" ON kv_store_fc8eb847
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### 3. **Missing Environment Variables**
**Symptom:** Server starts but crashes on database operations  
**Cause:** `SUPABASE_SERVICE_ROLE_KEY` not set

**Check:** The health endpoint will show environment status:
```json
{
  "environment": {
    "hasSupabaseUrl": true,
    "hasAnonKey": true,
    "hasServiceKey": true  // ← Should be true
  }
}
```

**Fix:** In Figma Make, these are auto-configured. If missing, check project settings.

### 4. **Deployment Not Triggered**
**Symptom:** New routes return 404  
**Cause:** File changes haven't triggered auto-deployment

**Fix:** 
- Save any file in `/supabase/functions/server/` to trigger deployment
- Check Supabase dashboard → Edge Functions → Logs for deployment status

### 5. **Wrong Authorization Header**
**Symptom:** "Missing authorization header" or "Unauthorized"  
**Cause:** Frontend not sending auth token correctly

**Fix in frontend:**
```typescript
// Correct way to call backend from frontend
const response = await fetch(
  `https://femvnconxoefpctiptkj.supabase.co/functions/v1/make-server-fc8eb847/some-route`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}` // ← Must include this
    },
    body: JSON.stringify({ ... })
  }
);
```

---

## Verification Steps

### Step 1: Check Table Exists
```sql
-- Run in Supabase SQL Editor
SELECT * FROM kv_store_fc8eb847 LIMIT 5;
```
**Expected:** Query succeeds (even if empty)  
**If fails:** Table doesn't exist - see Fix #1 above

### Step 2: Check RLS Status
```sql
-- Run in Supabase SQL Editor
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'kv_store_fc8eb847';
```
**Expected:** `rowsecurity = false` OR you have policies defined  
**If rowsecurity = true:** Check policies exist

### Step 3: Check Policies
```sql
-- Run in Supabase SQL Editor
SELECT * FROM pg_policies 
WHERE tablename = 'kv_store_fc8eb847';
```
**Expected:** At least one policy for `service_role`  
**If empty:** Add policy from Fix #2 above

### Step 4: Test Health Endpoint
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA" \
  https://femvnconxoefpctiptkj.supabase.co/functions/v1/make-server-fc8eb847/health
```
**Expected:** `{"status":"ok","database":"connected"}`  
**If error:** Check the error message for specific cause

### Step 5: Test Basic Route
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"code":"TEST"}' \
  https://femvnconxoefpctiptkj.supabase.co/functions/v1/make-server-fc8eb847/validate-org-code
```
**Expected:** `{"valid":false,"error":"Invalid organization code"}`  
**If 403:** Database/RLS issue - see fixes above

---

## Current Deployment Status

✅ **Server Code:** Deployed to `/supabase/functions/server/`  
✅ **Routes Working:** signin, validate-org-code, signup  
⏳ **New Routes:** Password reset and OAuth (may need deployment trigger)  
❓ **Database Table:** Need to verify exists (see Step 1 above)

---

## Quick Fix Commands

**Run these in Supabase SQL Editor if table doesn't exist:**

```sql
-- Create table
CREATE TABLE IF NOT EXISTS kv_store_fc8eb847 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Disable RLS (simplest for development)
ALTER TABLE kv_store_fc8eb847 DISABLE ROW LEVEL SECURITY;

-- OR enable with permissive policy
ALTER TABLE kv_store_fc8eb847 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON kv_store_fc8eb847
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON kv_store_fc8eb847
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

---

## Still Getting 403s?

1. **Check Supabase Dashboard Logs:**
   - https://supabase.com/dashboard/project/femvnconxoefpctiptkj/logs/edge-functions
   - Look for specific error messages

2. **Check Browser Console:**
   - Open DevTools → Network tab
   - Look at failed request details
   - Check Response tab for error message

3. **Enable Debug Logging:**
   - The server already logs all auth attempts
   - Check Edge Function logs for `[verifyAuth]` messages

4. **Verify Project ID:**
   - Should be: `femvnconxoefpctiptkj`
   - Check that URLs match this project ID

---

## Next Steps After Fixing 403s

Once the server is responding correctly:

1. ✅ Test password reset flow
2. ✅ Test OAuth consent flow  
3. ✅ Test organization invitation codes
4. ✅ Set up mobile deep linking
5. ✅ Configure email templates in Supabase

See `DEPLOYMENT_FIX_SUMMARY.md` for complete feature documentation.
