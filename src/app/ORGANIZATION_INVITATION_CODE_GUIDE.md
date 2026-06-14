# Organization Invitation Code - Implementation Guide

## Overview

The Organization Invitation Code feature allows teachers and professionals to link their accounts to institutions during registration. This creates a unified system for organizational analytics, student management, and institutional reporting.

## Current Implementation Status

✅ **COMPLETED:**
- Organization invitation code field added to teacher sign-up form
- Organization invitation code field added to professional sign-up form
- Validation endpoint `/validate-org-code` implemented
- Signup integration with organization code verification
- Admin panel integration for organization management
- Error handling with specific 403 connection error messaging
- OrganizationManager component for creating and managing codes

⚠️ **KNOWN ISSUE:**
- Supabase connection issue (status 403) - needs to be resolved by reconnecting the Supabase project in the integrations panel

## How It Works

### For Admins

1. **Create Organizations:**
   - Login as admin (Alex.Attachey@gmail.com)
   - Navigate to Admin Panel → "Organizations & Schools" tab
   - Use the Organization Manager to create new organizations
   - System generates unique codes (format: JOTM-XXXXXX)
   - Copy and share codes with teachers/professionals

2. **Manage Organizations:**
   - View all created organizations
   - Copy invitation codes to clipboard
   - Delete organizations if needed
   - Monitor which users are linked to each organization

### For Teachers/Professionals

1. **During Registration:**
   - Select "Teacher" or "Professional" role
   - Enter school/organization details
   - (Optional) Enter organization invitation code in the designated field
   - Click "Verify" button to validate the code
   - If valid, see confirmation with organization name
   - Complete registration

2. **After Registration:**
   - Account is automatically linked to the organization
   - Organization code stored in user profile
   - Appears in organizational analytics and reports

## API Endpoints

### 1. Validate Organization Code
**Endpoint:** `POST /make-server-fc8eb847/validate-org-code`

**Request:**
```json
{
  "code": "JOTM-ABC123"
}
```

**Response (Success):**
```json
{
  "valid": true,
  "organizationName": "Springfield High School",
  "organizationType": "School"
}
```

**Response (Invalid Code):**
```json
{
  "valid": false,
  "error": "Invalid organization code"
}
```

### 2. Create Organization (Admin Only)
**Endpoint:** `POST /make-server-fc8eb847/admin/create-organization`

**Headers:**
```
Authorization: Bearer {admin_token}
X-Admin-Token: {admin_token}
```

**Request:**
```json
{
  "name": "Springfield High School",
  "type": "School",
  "industrySector": null
}
```

**Response:**
```json
{
  "success": true,
  "organization": {
    "code": "JOTM-XYZ789",
    "name": "Springfield High School",
    "type": "School"
  }
}
```

### 3. List All Organizations (Admin Only)
**Endpoint:** `GET /make-server-fc8eb847/admin/list-organizations`

**Headers:**
```
Authorization: Bearer {admin_token}
X-Admin-Token: {admin_token}
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "organizations": [
    {
      "code": "JOTM-ABC123",
      "name": "Springfield High School",
      "type": "School",
      "createdAt": "2026-03-09T10:30:00.000Z",
      "createdBy": "Alex.Attachey@gmail.com"
    }
  ]
}
```

### 4. Delete Organization (Admin Only)
**Endpoint:** `DELETE /make-server-fc8eb847/admin/delete-organization/{code}`

**Headers:**
```
Authorization: Bearer {admin_token}
X-Admin-Token: {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization JOTM-ABC123 deleted successfully"
}
```

## Data Storage

### Organization Data (KV Store)
**Key:** `organization:{code}`

**Value:**
```json
{
  "code": "JOTM-ABC123",
  "name": "Springfield High School",
  "type": "School",
  "industrySector": null,
  "createdAt": "2026-03-09T10:30:00.000Z",
  "createdBy": "Alex.Attachey@gmail.com"
}
```

### User Profile Data (KV Store)
**Key:** `user:{userId}`

**Value (includes):**
```json
{
  "id": "user-123",
  "email": "teacher@school.edu",
  "name": "John Teacher",
  "role": "teacher",
  "school": "Springfield High School",
  "organizationCode": "JOTM-ABC123",
  "organizationName": "Springfield High School"
}
```

## Testing Checklist

Once Supabase is reconnected, follow these steps to test:

### 1. Reconnect Supabase
- [ ] Open the integrations panel
- [ ] Reconnect the Supabase project
- [ ] Verify connection is successful

### 2. Create Test Organization
- [ ] Login as admin (Alex.Attachey@gmail.com)
- [ ] Navigate to Admin Panel → Organizations & Schools tab
- [ ] Create a test organization (e.g., "Test High School")
- [ ] Note the generated code (e.g., JOTM-XYZ789)
- [ ] Verify organization appears in the list

### 3. Test Teacher Registration with Valid Code
- [ ] Logout from admin
- [ ] Go to registration page
- [ ] Select "Teacher" role
- [ ] Fill in required fields
- [ ] Enter the test organization code
- [ ] Click "Verify" button
- [ ] Verify success message shows correct organization name
- [ ] Complete registration
- [ ] Login and verify account is linked

### 4. Test Teacher Registration with Invalid Code
- [ ] Go to registration page
- [ ] Select "Teacher" role
- [ ] Enter an invalid code (e.g., JOTM-INVALID)
- [ ] Click "Verify" button
- [ ] Verify error message appears: "Invalid organization code"

### 5. Test Teacher Registration without Code
- [ ] Go to registration page
- [ ] Select "Teacher" role
- [ ] Leave organization code field empty
- [ ] Complete registration
- [ ] Verify registration succeeds without code

### 6. Test Professional Registration
- [ ] Repeat steps 3-5 for "Professional" role
- [ ] Verify same behavior

### 7. Verify Organization Analytics
- [ ] Login as admin
- [ ] Check that teachers with same org code are grouped
- [ ] Verify organization members endpoint works

## Error Handling

### Connection Errors
- **403 Forbidden:** Supabase not connected - clear message guides user to reconnect
- **500 Server Error:** Server issue - user-friendly error message
- **Network Timeout:** Connection timeout - retry suggestion

### Validation Errors
- **Empty Code:** "Please enter an organization code"
- **Invalid Code:** "Invalid organization code"
- **Code Not Found:** "Invalid organization code"

## UI Components

### AuthForm (Registration)
**Location:** `/components/AuthForm.tsx`

**Features:**
- Organization code input field (auto-uppercase)
- Verify button with loading state
- Success indicator with checkmark
- Verified organization name display
- Error messages
- Field disables after successful verification

### OrganizationManager (Admin)
**Location:** `/components/OrganizationManager.tsx`

**Features:**
- Create new organizations
- List all organizations
- Copy codes to clipboard
- Delete organizations
- Organization type selection
- Industry sector (for corporate)
- Instructions card

## Code Generation

Organization codes are generated using this format:
- Prefix: `JOTM-` (JotMinds)
- Length: 6 random characters
- Characters: A-Z, 0-9
- Example: `JOTM-A4X9K2`

**Function:**
```typescript
function generateOrgCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'JOTM-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

## Security Considerations

1. **Admin Only Creation:** Only admin users can create/delete organizations
2. **Validation Required:** Codes must be verified before use
3. **Case Insensitive:** Codes stored and checked in uppercase
4. **Unique Codes:** Random generation ensures uniqueness
5. **Server-Side Validation:** All validation happens server-side

## Future Enhancements

### Potential Improvements:
- [ ] Expiring invitation codes
- [ ] Usage limits per code
- [ ] Multi-organization support for users
- [ ] Organization admin role
- [ ] Bulk code generation
- [ ] Email invitations with codes
- [ ] Analytics per organization
- [ ] Organization branding customization

## Troubleshooting

### "Connection error (403)"
- **Cause:** Supabase project not connected
- **Solution:** Reconnect Supabase in integrations panel

### "Invalid organization code"
- **Cause:** Code doesn't exist or typo
- **Solution:** Verify code is correct, create organization if needed

### "Failed to validate organization code"
- **Cause:** Network issue or server down
- **Solution:** Check internet connection, try again

### Organization not appearing in list
- **Cause:** Creation failed or not refreshed
- **Solution:** Refresh the page, check browser console for errors

## Support

If you encounter issues:
1. Check browser console for detailed error logs
2. Verify Supabase connection status
3. Ensure admin credentials are correct
4. Check server logs in Supabase dashboard
5. Review this guide for testing steps

## Summary

The Organization Invitation Code system is **fully implemented** and ready for testing once the Supabase connection issue is resolved. All components, API endpoints, validation logic, and admin tools are in place. Simply reconnect Supabase and follow the testing checklist above to verify everything works correctly.
