# Organization Invitation Code - Testing Guide

## Quick Start Testing (After Supabase Reconnection)

### Step 1: Reconnect Supabase
1. Open the Figma Make integrations panel
2. Find the Supabase integration
3. Click "Reconnect"
4. Verify the connection is successful

### Step 2: Login as Admin
```
Email: Alex.Attachey@gmail.com
Password: [Your admin password]
```

### Step 3: Create Test Organization

1. Navigate to **Admin Panel** (you'll be automatically logged in)
2. Click on **"Organizations & Schools"** tab
3. In the **Organization Manager** card:
   - Organization Name: `Test High School`
   - Organization Type: `School`
   - Click **"Create Organization"**
4. **Copy the generated code** (e.g., `JOTM-A4X9K2`)

### Step 4: Test Teacher Registration

1. **Logout** from admin account
2. Go to **Sign Up** page
3. Fill in the registration form:
   - **Email:** `teacher@test.edu`
   - **Password:** `Test123!@#`
   - **Name:** `John Teacher`
   - **Phone:** `+1234567890`
   - **Role:** Select `Teacher / Educator`
   - **School Name:** `Test High School`
   
4. **In the Organization Invitation Code field:**
   - Paste the code you copied (e.g., `JOTM-A4X9K2`)
   - Click **"Verify"**
   
5. **Expected Result:**
   - ✅ Green checkmark appears
   - ✅ Message shows: "Verified Institution: Test High School"
   - ✅ Input field is disabled

6. **Complete registration**
7. **Login** with the new account
8. **Verify** account is linked to the organization

### Step 5: Test Invalid Code

1. **Logout** and go back to Sign Up
2. Fill in the form for another teacher
3. **In the Organization Code field:**
   - Enter: `JOTM-INVALID`
   - Click **"Verify"**
   
4. **Expected Result:**
   - ❌ Error message: "Invalid organization code"
   - ❌ No green checkmark
   - ❌ Field remains editable

### Step 6: Test Without Code (Optional)

1. Fill in the form for another teacher
2. **Leave the Organization Code field empty**
3. **Complete registration**
4. **Expected Result:**
   - ✅ Registration succeeds
   - ✅ Account created without organization link

## Common Test Scenarios

### Scenario 1: Code Format Validation
```
Valid formats:
- JOTM-ABC123 ✅
- jotm-abc123 ✅ (auto-converted to uppercase)
- JOTM-A1B2C3 ✅

Invalid formats:
- ABC123 ❌ (missing prefix)
- JOTM-AB ❌ (too short)
- TEST-ABC123 ❌ (wrong prefix)
```

### Scenario 2: Connection Error Testing
If you see "Connection error (403)":
1. This means Supabase is not connected
2. Go to integrations panel
3. Reconnect Supabase
4. Try again

### Scenario 3: Multiple Teachers Same Organization
1. Create one organization
2. Register 3 teachers with the same code
3. Login as admin
4. Check organization members list
5. All 3 teachers should appear under the same organization

## API Testing (Advanced)

### Using cURL

#### 1. Validate Organization Code
```bash
curl -X POST https://[project-id].supabase.co/functions/v1/make-server-fc8eb847/validate-org-code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [public-anon-key]" \
  -d '{"code": "JOTM-ABC123"}'
```

**Expected Response:**
```json
{
  "valid": true,
  "organizationName": "Test High School",
  "organizationType": "School"
}
```

#### 2. Create Organization (Admin only)
```bash
curl -X POST https://[project-id].supabase.co/functions/v1/make-server-fc8eb847/admin/create-organization \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [admin-token]" \
  -H "X-Admin-Token: [admin-token]" \
  -d '{
    "name": "API Test School",
    "type": "School"
  }'
```

#### 3. List All Organizations (Admin only)
```bash
curl -X GET https://[project-id].supabase.co/functions/v1/make-server-fc8eb847/admin/list-organizations \
  -H "Authorization: Bearer [admin-token]" \
  -H "X-Admin-Token: [admin-token]"
```

## Browser Console Testing

Open browser console and run:

```javascript
// Test validate organization code
async function testValidateCode(code) {
  const response = await fetch(
    'https://[project-id].supabase.co/functions/v1/make-server-fc8eb847/validate-org-code',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer [public-anon-key]'
      },
      body: JSON.stringify({ code })
    }
  );
  const data = await response.json();
  console.log('Validation result:', data);
  return data;
}

// Run test
testValidateCode('JOTM-ABC123');
```

## Troubleshooting

### Issue: "Connection error (403)"
**Solution:**
1. Check Supabase connection in integrations panel
2. Reconnect if needed
3. Verify environment variables are set

### Issue: "Invalid organization code" for valid code
**Check:**
1. Code format is correct (JOTM-XXXXXX)
2. Organization exists in KV store
3. Code is uppercase
4. No extra spaces

### Issue: Verify button doesn't work
**Check:**
1. Code field is not empty
2. Code hasn't been verified already
3. Network connection is active
4. Browser console for errors

### Issue: Organization not appearing in admin list
**Check:**
1. Click refresh button
2. Check browser console
3. Verify creation was successful
4. Try creating another organization

## Success Criteria

After testing, you should be able to:
- ✅ Create organizations as admin
- ✅ View all organizations in admin panel
- ✅ Copy organization codes
- ✅ Delete organizations
- ✅ Verify valid codes during registration
- ✅ See error for invalid codes
- ✅ Register without code (optional field)
- ✅ See verified organization name
- ✅ Link teacher accounts to organizations
- ✅ View organization members in admin panel

## Performance Checks

- Code validation should complete in < 2 seconds
- Organization creation should be instant
- List should load all organizations in < 3 seconds
- No errors in browser console
- No errors in server logs

## Security Checks

- ✅ Non-admin users cannot create organizations
- ✅ Non-admin users cannot delete organizations
- ✅ Non-admin users cannot list all organizations
- ✅ Anyone can validate codes (public endpoint)
- ✅ Codes are stored securely in KV store
- ✅ No sensitive data exposed in error messages

## Next Steps After Successful Testing

1. **Create Real Organizations:**
   - Login as admin
   - Create organizations for actual schools/institutions
   - Document the codes securely

2. **Distribute Codes:**
   - Share codes with institution administrators
   - Provide instructions on how to use them

3. **Monitor Usage:**
   - Check admin panel regularly
   - Monitor which teachers are linking to organizations
   - Track organization growth

4. **User Support:**
   - Be ready to help users with code entry
   - Have this guide available for reference
   - Create additional documentation if needed

## Questions?

Refer to:
- `/ORGANIZATION_INVITATION_CODE_GUIDE.md` - Complete implementation guide
- `/components/OrganizationManager.tsx` - Organization management UI
- `/components/OrganizationCodeHelp.tsx` - User help documentation
- `/components/AuthForm.tsx` - Registration form with code field
- `/supabase/functions/server/index.tsx` - Server-side validation logic
