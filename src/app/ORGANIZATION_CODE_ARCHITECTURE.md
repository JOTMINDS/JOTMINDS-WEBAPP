# Organization Invitation Code - System Architecture

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         JotMinds Platform                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
        ┌───────▼───────┐              ┌───────▼────────┐
        │   Frontend    │              │    Backend     │
        │   (React)     │              │ (Supabase Edge)│
        └───────┬───────┘              └────────┬───────┘
                │                               │
                │                               │
    ┌───────────┼───────────┐          ┌───────┴──────┐
    │           │           │          │              │
┌───▼──┐   ┌───▼───┐  ┌───▼───┐   ┌──▼───┐    ┌────▼─────┐
│Auth  │   │Org    │  │Admin  │   │Auth  │    │KV Store  │
│Form  │   │Code   │  │Panel  │   │API   │    │(Database)│
│      │   │Help   │  │       │   │      │    │          │
└──────┘   └───────┘  └───────┘   └──────┘    └──────────┘
```

## 📦 Component Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Component Hierarchy                      │
└──────────────────────────────────────────────────────────────┘

App.tsx
│
├── AuthForm.tsx
│   ├── OrganizationCodeHelp.tsx (Dialog Component)
│   ├── PasswordStrengthIndicator.tsx
│   └── Checkbox.tsx (Consent)
│
└── AdminPanel.tsx
    ├── Tabs (Platform, Organizations, Content)
    │   └── Organizations Tab
    │       ├── OrganizationManager.tsx
    │       │   ├── Create Organization Form
    │       │   ├── Organization List
    │       │   └── Instructions Card
    │       └── Organization Users Table
    │
    ├── SchoolAdminDashboard.tsx
    └── QuestionBankAudit.tsx
```

## 🔄 Data Flow Diagram

### Teacher Registration Flow

```
┌─────────────┐
│   Teacher   │
└──────┬──────┘
       │ 1. Navigates to Sign Up
       ▼
┌─────────────────┐
│   AuthForm      │
│  (Registration) │
└────────┬────────┘
         │ 2. Fills form + enters org code
         │ 3. Clicks "Verify"
         ▼
┌──────────────────────────┐
│ validateOrgCode()        │
│ (Frontend Function)      │
└──────────┬───────────────┘
           │ 4. POST /validate-org-code
           ▼
┌───────────────────────────────┐
│  Supabase Edge Function       │
│  /validate-org-code endpoint  │
└──────────┬────────────────────┘
           │ 5. Check KV Store
           ▼
┌──────────────────────┐
│   KV Store           │
│ organization:{code}  │
└──────────┬───────────┘
           │ 6. Return org data or error
           ▼
┌────────────────────┐
│   AuthForm         │
│ Show result        │
└────────┬───────────┘
         │ 7. If valid, show org name
         │ 8. Teacher completes registration
         ▼
┌─────────────────────┐
│ POST /signup        │
│ (with org code)     │
└────────┬────────────┘
         │ 9. Create user + link to org
         ▼
┌──────────────────────┐
│  KV Store            │
│  user:{id}           │
│  - organizationCode  │
│  - organizationName  │
└──────────────────────┘
```

### Admin Organization Creation Flow

```
┌─────────────┐
│    Admin    │
└──────┬──────┘
       │ 1. Login & navigate to Admin Panel
       ▼
┌──────────────────┐
│   AdminPanel     │
│ Organizations Tab│
└────────┬─────────┘
         │ 2. Fill org details
         │ 3. Click "Create Organization"
         ▼
┌───────────────────────┐
│ OrganizationManager   │
│ createOrganization()  │
└──────────┬────────────┘
           │ 4. POST /admin/create-organization
           ▼
┌────────────────────────────────┐
│  Supabase Edge Function        │
│  /admin/create-organization    │
└──────────┬─────────────────────┘
           │ 5. Verify admin auth
           │ 6. Generate code (JOTM-XXXXXX)
           ▼
┌──────────────────────┐
│   KV Store           │
│ organization:{code}  │
│ - name               │
│ - type               │
│ - createdAt          │
│ - createdBy          │
└──────────┬───────────┘
           │ 7. Return success + code
           ▼
┌───────────────────────┐
│ OrganizationManager   │
│ Display code          │
└────────┬──────────────┘
         │ 8. Admin copies code
         │ 9. Shares with teachers
         ▼
┌─────────────┐
│  Teachers   │
└─────────────┘
```

## 🗄️ Database Schema (KV Store)

```
┌─────────────────────────────────────────────────────────────┐
│                      KV Store Keys                           │
└─────────────────────────────────────────────────────────────┘

organization:{code}
├── code: string           (e.g., "JOTM-ABC123")
├── name: string           (e.g., "Springfield High School")
├── type: string           (e.g., "School")
├── industrySector: string (optional, e.g., "Technology")
├── createdAt: string      (ISO timestamp)
└── createdBy: string      (Admin email)

user:{userId}
├── id: string
├── email: string
├── name: string
├── role: string
├── organizationCode: string (optional, e.g., "JOTM-ABC123")
├── organizationName: string (optional, e.g., "Springfield HS")
├── organizationType: string (optional)
├── school: string          (for teachers/students)
├── position: string        (for professionals)
├── phone: string
├── educationLevel: string  (for students)
├── dateOfBirth: string     (for students)
├── hasConsented: boolean
├── consentType: string
├── consentDate: string
├── createdAt: string
├── assessmentsCompleted: array
└── cognitiveProfile: object
```

## 🔌 API Endpoints Architecture

```
┌────────────────────────────────────────────────────────────┐
│              Supabase Edge Function Routes                 │
│          /functions/v1/make-server-fc8eb847/              │
└────────────────────────────────────────────────────────────┘

PUBLIC ENDPOINTS (No Auth Required)
├── POST   /validate-org-code
│   ├── Input: { code: string }
│   ├── Output: { valid: boolean, organizationName?: string }
│   └── Purpose: Validate invitation codes during registration
│
└── POST   /signup
    ├── Input: { email, password, name, role, organizationCode?, ... }
    ├── Output: { success: boolean, user: object }
    └── Purpose: Create user account (optionally with org code)

ADMIN ENDPOINTS (Admin Auth Required)
├── POST   /admin/create-organization
│   ├── Auth: Admin token
│   ├── Input: { name: string, type: string, industrySector?: string }
│   ├── Output: { success: boolean, organization: object }
│   └── Purpose: Create new organization and generate code
│
├── GET    /admin/list-organizations
│   ├── Auth: Admin token
│   ├── Output: { success: boolean, count: number, organizations: array }
│   └── Purpose: List all organizations
│
└── DELETE /admin/delete-organization/:code
    ├── Auth: Admin token
    ├── Input: code (URL param)
    ├── Output: { success: boolean, message: string }
    └── Purpose: Delete organization
```

## 🔐 Security Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Security Layers                         │
└────────────────────────────────────────────────────────────┘

Layer 1: Frontend Validation
├── Code format validation (JOTM-XXXXXX)
├── Required field validation
├── Email format validation
└── Password strength validation

Layer 2: Network Layer
├── HTTPS encryption
├── CORS headers
└── Request rate limiting (Supabase)

Layer 3: Backend Authentication
├── Admin token verification
│   ├── Check Authorization header
│   ├── Check X-Admin-Token header
│   └── Verify admin email
│
├── Supabase JWT validation
│   └── For regular users
│
└── Public endpoints (read-only validation)

Layer 4: Data Access Control
├── Admin-only write operations
│   ├── Create organizations
│   ├── Delete organizations
│   └── List all organizations
│
└── Public read operations
    └── Validate organization codes

Layer 5: Data Storage
├── KV Store access control
├── User data isolation
└── Organization data protection
```

## 🎨 UI/UX Flow

```
┌────────────────────────────────────────────────────────────┐
│                  User Interface Flow                        │
└────────────────────────────────────────────────────────────┘

Teacher Registration Journey
┌─────────────┐
│ Landing     │
│ Page        │
└──────┬──────┘
       │ Click "Sign Up"
       ▼
┌─────────────┐
│ Role        │
│ Selection   │ ← Select "Teacher"
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Step 1: Account Setup   │
│ - Email                 │
│ - Password              │
└──────┬──────────────────┘
       │ Next
       ▼
┌─────────────────────────┐
│ Step 2: Personal Info   │
│ - Name                  │
│ - Phone                 │
└──────┬──────────────────┘
       │ Next
       ▼
┌─────────────────────────────────┐
│ Step 3: School & Organization   │
│ - School Name                   │
│ - Org Code (Optional) [?] Help │
│   [JOTM-______] [Verify]       │
│                                 │
│ ✅ Verified: Springfield HS    │
└──────┬──────────────────────────┘
       │ Next
       ▼
┌─────────────────────────┐
│ Step 4: Consent         │
│ - Terms acceptance      │
│ - Privacy policy        │
└──────┬──────────────────┘
       │ Submit
       ▼
┌─────────────┐
│ Success     │
│ & Login     │
└─────────────┘

Help Dialog Flow
┌─────────────┐
│ [?] Icon    │
└──────┬──────┘
       │ Click
       ▼
┌─────────────────────────┐
│ Modal Dialog            │
│ - What is this?         │
│ - Benefits              │
│ - How to get code       │
│ - How to use            │
│ - Instructions          │
└─────────────────────────┘
```

## 💾 State Management

```
┌────────────────────────────────────────────────────────────┐
│                    React State Flow                         │
└────────────────────────────────────────────────────────────┘

AuthForm Component State
├── organizationCode: string        (User input)
├── verifiedOrgName: string         (After validation)
├── verifyingCode: boolean          (Loading state)
├── error: string                   (Error messages)
└── loading: boolean                (Form submission)

OrganizationManager Component State
├── organizations: array            (All organizations)
├── loading: boolean                (Loading organizations)
├── error: string                   (Error messages)
├── success: string                 (Success messages)
├── newOrgName: string              (Form input)
├── newOrgType: string              (Form input)
├── newOrgSector: string            (Form input)
├── creating: boolean               (Creation in progress)
└── copiedCode: string              (Clipboard feedback)

Local Storage (Admin)
├── admin_token: string             (Admin session)
└── admin_user: object              (Admin profile)

Session Storage (Users)
├── supabase_session: object        (Supabase session)
└── access_token: string            (JWT token)
```

## 🔄 Integration Points

```
┌────────────────────────────────────────────────────────────┐
│                  System Integrations                        │
└──────────────────────────���─────────────────────────────────┘

Frontend Components
├── AuthForm
│   └── Integrates: OrganizationCodeHelp
│
├── AdminPanel
│   └── Integrates: OrganizationManager
│
└── Dashboard Components
    └── Can query: Organization members

Backend Services
├── Supabase Auth
│   └── User authentication
│
├── Supabase Edge Functions
│   ├── Organization validation
│   ├── Organization CRUD
│   └── User registration
│
└── KV Store
    ├── Organization data
    └── User profiles

External Services
└── Supabase
    ├── Authentication
    ├── Edge Functions
    └── Database (KV Store)
```

## 🎯 Performance Considerations

```
┌────────────────────────────────────────────────────────────┐
│                  Performance Metrics                        │
└────────────────────────────────────────────────────────────┘

Target Response Times
├── Code Validation: < 2 seconds
├── Organization Creation: < 1 second
├── List Organizations: < 3 seconds
└── User Registration: < 5 seconds

Optimization Strategies
├── Frontend
│   ├── Debounced input validation
│   ├── Optimistic UI updates
│   └── Cached organization data
│
├── Backend
│   ├── KV Store indexing
│   ├── Efficient queries
│   └── Minimal data transfer
│
└── Network
    ├── Request batching
    ├── Response caching
    └── Compression
```

## 🔍 Monitoring & Logging

```
┌────────────────────────────────────────────────────────────┐
│                  Logging Architecture                       │
└────────────────────────────────────────────────────────────┘

Frontend Logging
├── console.log('[validate-org-code] ...')
├── console.error('Error validating ...')
└── Browser DevTools Network tab

Backend Logging
├── console.log('[validate-org-code] Validating code: XXX')
├── console.log('[validate-org-code] ✓ Organization found')
├── console.log('[Admin] Created organization: XXX')
└── Supabase Edge Function logs

Error Tracking
├── Frontend: Browser console
├── Backend: Supabase logs
└── User feedback: Error messages in UI
```

## 📊 Data Relationships

```
┌────────────────────────────────────────────────────────────┐
│                   Entity Relationships                      │
└────────────────────────────────────────────────────────────┘

┌──────────────┐        ┌─────────────┐
│ Organization │◄───────┤   Teacher   │
│              │1     n │             │
│ - code       │        │ - orgCode   │
│ - name       │        │ - orgName   │
│ - type       │        └─────────────┘
└──────┬───────┘
       │
       │1
       │
       │n
       ▼
┌──────────────┐
│ Professional │
│              │
│ - orgCode    │
│ - orgName    │
└──────────────┘

Cardinality
├── 1 Organization : N Teachers
├── 1 Organization : N Professionals
└── 1 User : 0..1 Organization
```

---

**Last Updated:** March 9, 2026  
**Status:** ✅ Architecture Complete & Ready for Deployment
