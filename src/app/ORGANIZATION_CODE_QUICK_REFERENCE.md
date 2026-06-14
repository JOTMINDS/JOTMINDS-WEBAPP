# Organization Invitation Code - Quick Reference

## 🎯 At a Glance

| Aspect | Details |
|--------|---------|
| **Feature** | Organization Invitation Codes for Teachers & Professionals |
| **Status** | ✅ Fully Implemented, Ready for Testing |
| **Requirement** | Reconnect Supabase (status 403 issue) |
| **Code Format** | `JOTM-XXXXXX` (6 random characters) |
| **User Roles** | Teacher, Professional |
| **Admin Role** | Organization creation & management |

## 📍 File Locations

```
Frontend:
├── /components/AuthForm.tsx              (Registration form with code field)
├── /components/OrganizationManager.tsx   (Admin management UI)
├── /components/OrganizationCodeHelp.tsx  (User help dialog)
└── /components/AdminPanel.tsx            (Integration point)

Backend:
└── /supabase/functions/server/index.tsx  (API endpoints)

Documentation:
├── /ORGANIZATION_INVITATION_CODE_GUIDE.md
├── /ORGANIZATION_CODE_TESTING.md
├── /ORGANIZATION_CODE_IMPLEMENTATION_SUMMARY.md
└── /ORGANIZATION_CODE_QUICK_REFERENCE.md (this file)
```

## 🔑 Key Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/validate-org-code` | POST | Public | Validate invitation code |
| `/admin/create-organization` | POST | Admin | Create new organization |
| `/admin/list-organizations` | GET | Admin | List all organizations |
| `/admin/delete-organization/:code` | DELETE | Admin | Delete organization |
| `/signup` | POST | Public | User registration (includes org code) |

## 💻 Quick Commands

### Create Organization (Admin)
```javascript
// In browser console after admin login
const token = localStorage.getItem('admin_token');

fetch('https://[project-id].supabase.co/functions/v1/make-server-fc8eb847/admin/create-organization', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Admin-Token': token
  },
  body: JSON.stringify({
    name: 'Test School',
    type: 'School'
  })
})
.then(r => r.json())
.then(data => console.log('Created:', data));
```

### Validate Code (Anyone)
```javascript
fetch('https://[project-id].supabase.co/functions/v1/make-server-fc8eb847/validate-org-code', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer [public-anon-key]'
  },
  body: JSON.stringify({ code: 'JOTM-ABC123' })
})
.then(r => r.json())
.then(data => console.log('Valid:', data));
```

## 🎨 UI Components

### Teacher Registration
```
┌─────────────────────────────────────────┐
│ Organization Invitation Code (Optional) │  [?] Help
├─────────────────────────────────────────┤
│ [JOTM-______]              [Verify]     │
│                                         │
│ ✅ Verified Institution: Test School   │
│                                         │
│ If your school provided a code...      │
└─────────────────────────────────────────┘
```

### Admin Panel
```
┌──────────────────────────────────────────┐
│ Organization Manager                     │
├──────────────────────────────────────────┤
│ Create New Organization                  │
│ Name:  [________________]                │
│ Type:  [School ▾]                       │
│        [Create Organization]             │
├──────────────────────────────────────────┤
│ Existing Organizations                   │
│                                          │
│ Test School                              │
│ Code: JOTM-ABC123  [📋] [🗑️]           │
│ Type: School                             │
│ Created: Mar 9, 2026                     │
└──────────────────────────────────────────┘
```

## ⚡ Common Tasks

### Task 1: Create & Distribute Code
```
1. Login as admin
2. Go to Admin Panel → Organizations tab
3. Create organization
4. Copy generated code
5. Share with teachers
```

### Task 2: Teacher Uses Code
```
1. Teacher goes to registration
2. Selects "Teacher" role
3. Enters organization code
4. Clicks "Verify"
5. Sees organization name
6. Completes registration
```

### Task 3: Verify Organization Link
```
1. Login as admin
2. View organization members
3. Confirm teacher appears in list
```

## 🐛 Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| Connection error (403) | Supabase not connected | Reconnect in integrations panel |
| Invalid organization code | Code doesn't exist | Create organization or check code |
| Failed to validate | Network issue | Check internet connection |
| Button disabled | Code empty or verified | Enter code or reset form |

## ✅ Testing Quick Check

```
□ Reconnect Supabase
□ Login as admin
□ Create test organization
□ Copy code
□ Logout
□ Register as teacher
□ Enter code
□ Verify code
□ See organization name
□ Complete registration
□ Login as admin
□ Verify teacher in organization
```

## 📊 Data Flow

```
Admin Creates Org
     ↓
Code Generated (JOTM-XXXXXX)
     ↓
Code Stored in KV Store
     ↓
Admin Shares Code
     ↓
Teacher Enters Code
     ↓
System Validates
     ↓
If Valid → Show Org Name
     ↓
Teacher Registers
     ↓
Account Linked to Org
     ↓
Data Stored in User Profile
```

## 🎓 Code Examples

### Create Org (Server)
```typescript
const orgCode = generateOrgCode();
await kv.set(`organization:${orgCode}`, {
  code: orgCode,
  name: organizationName,
  type: organizationType,
  createdAt: new Date().toISOString(),
  createdBy: email
});
```

### Validate Code (Server)
```typescript
const organization = await kv.get(`organization:${code}`);
if (organization) {
  return { valid: true, organizationName: organization.name };
}
return { valid: false, error: 'Invalid code' };
```

### Link User (Server)
```typescript
await kv.set(`user:${userId}`, {
  ...userProfile,
  organizationCode: orgCode,
  organizationName: orgName
});
```

## 🔐 Security

```
✅ Admin-only creation
✅ Admin-only deletion
✅ Public validation (read-only)
✅ Server-side checks
✅ Token verification
✅ Case-insensitive matching
```

## 🎯 Success Indicators

After implementation:
- ✅ Teachers can verify codes
- ✅ Invalid codes show errors
- ✅ Registration works with/without codes
- ✅ Admin can create organizations
- ✅ Admin can see all organizations
- ✅ Codes link accounts correctly

## 📱 User Access Points

### Teachers
```
Sign Up → Teacher Role → Org Code Field → Verify → Register
```

### Admins
```
Login → Admin Panel → Organizations Tab → Create Org → Get Code
```

### Help
```
Registration Form → [?] Help Icon → Dialog Opens → Instructions
```

## 💾 KV Store Structure

```
organization:JOTM-ABC123 → {org data}
organization:JOTM-XYZ789 → {org data}
user:user-id-1 → {profile with orgCode}
user:user-id-2 → {profile with orgCode}
```

## 🚀 Next Actions

1. **Immediate:** Reconnect Supabase
2. **Testing:** Follow testing guide
3. **Production:** Create real organizations
4. **Distribution:** Share codes
5. **Monitoring:** Track usage

## 📞 Quick Links

- 📖 [Full Guide](/ORGANIZATION_INVITATION_CODE_GUIDE.md)
- 🧪 [Testing Guide](/ORGANIZATION_CODE_TESTING.md)
- 📝 [Implementation Summary](/ORGANIZATION_CODE_IMPLEMENTATION_SUMMARY.md)
- 💻 [AuthForm.tsx](/components/AuthForm.tsx)
- 🛠️ [OrganizationManager.tsx](/components/OrganizationManager.tsx)
- ❓ [Help Component](/components/OrganizationCodeHelp.tsx)

---

**Status:** ✅ Ready for Production (after Supabase reconnection)
**Last Updated:** March 9, 2026
