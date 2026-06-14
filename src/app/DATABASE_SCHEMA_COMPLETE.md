# JotMinds - Complete Database Schema & Data Storage Documentation

**Last Updated:** March 23, 2026  
**Purpose:** Comprehensive documentation of all data storage, database schema, and key patterns

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Physical Database Schema](#physical-database-schema)
3. [Logical Data Organization](#logical-data-organization)
4. [All Key Patterns with Processes](#all-key-patterns-with-processes)
5. [API Endpoints Mapped to Keys](#api-endpoints-mapped-to-keys)
6. [Data Flow Examples](#data-flow-examples)
7. [Storage Location Reference](#storage-location-reference)

---

## Architecture Overview

### ⚠️ CRITICAL: Key-Value Store Architecture

JotMinds uses a **single-table Key-Value Store**, NOT traditional relational database tables.

**Why KV Store?**

- ✅ Flexible schema (no migrations)
- ✅ Fast O(1) lookups
- ✅ Easy prefix queries
- ✅ JSON storage for complex objects
- ✅ Simple 7-function API
- ✅ Scales from MVP to production

**Trade-offs:**

- ⚠️ No SQL joins (fetch separately)
- ⚠️ Application-level sorting
- ⚠️ No foreign key constraints
- ⚠️ Prefix queries expensive on large datasets

---

## Physical Database Schema

### Single Table: `kv_store_fc8eb847`

```sql
CREATE TABLE kv_store_fc8eb847 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

**Columns:**

- **key** (TEXT, PRIMARY KEY) - Unique identifier string
- **value** (JSONB) - JSON object containing all data

**Location:** Supabase PostgreSQL Database

**Access Pattern:** All access through KV helper functions

---

## KV Helper Functions

**File:** `/supabase/functions/server/kv_store.tsx`

### Single Operations

```typescript
// Create or update a key
await kv.set(key: string, value: any): Promise<void>

// Read a single key
await kv.get(key: string): Promise<any>

// Delete a single key
await kv.del(key: string): Promise<void>
```

### Bulk Operations

```typescript
// Set multiple keys at once
await kv.mset(keys: string[], values: any[]): Promise<void>

// Get multiple keys at once
await kv.mget(keys: string[]): Promise<any[]>

// Delete multiple keys at once
await kv.mdel(keys: string[]): Promise<void>
```

### Prefix Queries (Most Powerful!)

```typescript
// Get all keys matching a prefix
await kv.getByPrefix(prefix: string): Promise<any[]>

// Examples:
await kv.getByPrefix('user:')              // Get all users
await kv.getByPrefix('result:user123:')    // Get all user's assessments
await kv.getByPrefix('reflection:user123:') // Get all user's reflections
```

---

## Logical Data Organization

### All Key Patterns

| Pattern                                        | Example                                   | Purpose                 | Count     |
| ---------------------------------------------- | ----------------------------------------- | ----------------------- | --------- |
| `user:{userId}`                                | `user:abc-123`                            | User profiles           | ~1000s    |
| `organization:{code}`                          | `organization:JOTM-ABC123`                | Organizations           | ~100s     |
| `result:{userId}:{type}`                       | `result:abc-123:jhs-thinking`             | Assessment results      | ~10000s   |
| `progress:{userId}:{type}`                     | `progress:abc-123:jhs-thinking`           | In-progress assessments | ~100s     |
| `questions:{framework}:{version}`              | `questions:sternberg:v1`                  | Question banks          | ~10       |
| `reflection:{userId}:{timestamp}`              | `reflection:abc-123:1711358400000`        | User reflections        | ~1000s    |
| `consent:{childId}:{parentId}`                 | `consent:child-123:parent-456`            | Parental consent        | ~100s     |
| `admin:user`                                   | `admin:user`                              | Admin user ID           | 1         |
| `challenge:daily:{date}`                       | `challenge:daily:2026-03-23`              | Daily challenges        | ~365/year |
| `challenge-completion:{userId}:{date}`         | `challenge-completion:abc-123:2026-03-23` | Challenge tracking      | ~10000s   |
| `teaching-style:{userId}`                      | `teaching-style:teacher-123`              | Teaching assessments    | ~100s     |
| `observation:{parentId}:{childId}:{timestamp}` | `observation:p-123:c-456:1711358400000`   | Parent observations     | ~1000s    |

---

## All Key Patterns with Processes

### 1. User Data

**Key Pattern:** `user:{userId}`  
**Example:** `user:550e8400-e29b-41d4-a716-446655440000`  
**Storage:** Supabase KV Store  
**Count:** ~1000s of records

#### Value Structure

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "student@example.com",
  "name": "John Doe",
  "role": "student",
  "age": 15,
  "dateOfBirth": "2009-03-15",
  "school": "Accra Secondary School",
  "educationLevel": "JHS 2",
  "organizationCode": "JOTM-ABC123",
  "organizationName": "Accra Schools",
  "organizationType": "School",
  "linkedChildren": ["child-id-1", "child-id-2"],
  "assessmentsCompleted": ["jhs-thinking", "sternberg"],
  "cognitiveProfile": {
    "analytical": 75,
    "creative": 85,
    "practical": 70
  },
  "hasConsented": true,
  "consentType": "parental",
  "consentDate": "2026-01-15T10:30:00Z",
  "createdAt": "2026-01-10T08:00:00Z",
  "updatedAt": "2026-03-20T14:22:00Z",
  "lastJHSAssessment": "2026-03-15T10:00:00Z",
  "lastSHSAssessment": null,
  "lastAdultAssessment": null,
  "profileUpdatedAt": "2026-03-20T14:22:00Z"
}
```

#### Processes Using This Key

##### Process 1.1: User Sign-Up

**Component:** `AuthForm`  
**API Endpoint:** `POST /make-server-fc8eb847/signup`  
**Flow:**

1. User fills out signup form
2. Frontend sends: `{ email, password, name, role, dateOfBirth, ... }`
3. Backend creates Supabase Auth user
4. Backend generates `userId`
5. Backend creates `user:{userId}` key with all profile data
6. If supervisor role: Also creates `organization:{code}` key
7. If teacher/professional with org code: Validates `organization:{code}` exists
8. If email is admin: Sets `admin:user` key
9. Returns: `{ success: true, userId, user, organizationCode? }`

**Components:** `AuthForm`, `OrganizationAuthForm`  
**Files:** `/supabase/functions/server/index.tsx` (lines 128-218)

##### Process 1.2: User Sign-In

**Component:** `AuthForm`  
**API Endpoint:** `POST /make-server-fc8eb847/signin`  
**Flow:**

1. User enters email/password
2. Backend authenticates with Supabase Auth
3. Backend reads `user:{userId}` from KV store
4. Backend merges Supabase user metadata with KV profile
5. Returns: `{ session, user }`

**Components:** `AuthForm`  
**Files:** `/supabase/functions/server/index.tsx` (lines 220-256)

##### Process 1.3: Get Session

**Component:** All components (via `AuthContext`)  
**API Endpoint:** `GET /make-server-fc8eb847/session`  
**Flow:**

1. Frontend loads, checks for existing session
2. Backend verifies auth token
3. Backend reads `user:{userId}` from KV store
4. Backend normalizes role (fixes capitalization, old role names)
5. Returns: `{ success: true, user }`

**Components:** `AuthContext`  
**Files:** `/supabase/functions/server/index.tsx` (lines 258-305)

##### Process 1.4: Update User Profile

**Component:** All dashboards (profile editing)  
**API Endpoint:** `PATCH /make-server-fc8eb847/user/profile`  
**Flow:**

1. User edits profile fields
2. Frontend sends: `{ updates: { name: "New Name", ... } }`
3. Backend reads current `user:{userId}`
4. Backend merges updates
5. Backend writes updated `user:{userId}`
6. Returns: `{ success: true, profile }`

**Components:** `StudentDashboard`, `TeacherDashboard`, etc.  
**Files:** `/supabase/functions/server/index.tsx` (lines 336-365)

##### Process 1.5: Admin Get All Users

**Component:** `AdminPanel`  
**API Endpoint:** `GET /make-server-fc8eb847/admin/users`  
**Flow:**

1. Admin clicks "View All Users"
2. Backend verifies admin auth
3. Backend calls `kv.getByPrefix('user:')`
4. Returns array of all user objects
5. Frontend displays in table

**Components:** `AdminPanel`  
**Files:** `/supabase/functions/server/index.tsx` (lines 636-656)

##### Process 1.6: Admin Get User Details

**Component:** `AdminPanel`  
**API Endpoint:** `GET /make-server-fc8eb847/admin/user/:userId`  
**Flow:**

1. Admin clicks on a user
2. Backend reads `user:{userId}`
3. Backend reads all `result:{userId}:*` (assessments)
4. Returns: `{ user, results }`
5. Frontend displays user details + all assessments

**Components:** `AdminPanel`  
**Files:** `/supabase/functions/server/index.tsx` (lines 718-744)

##### Process 1.7: Teacher Get Students

**Component:** `TeacherDashboard`  
**Flow:**

1. Teacher logs in
2. Frontend gets teacher's `school` from user profile
3. Frontend calls `GET /make-server-fc8eb847/admin/users`
4. Backend returns all users
5. Frontend filters: `users.filter(u => u.school === teacherSchool && u.role === 'student')`
6. Displays student roster

**Components:** `TeacherDashboard`, `TeacherClassOverview`  
**Files:** `/components/TeacherDashboardNew.tsx`

##### Process 1.8: Parent Get Linked Children

**Component:** `ParentDashboard`  
**API Endpoint:** `GET /make-server-fc8eb847/parent/children`  
**Flow:**

1. Parent views dashboard
2. Backend reads `user:{parentId}`
3. Backend gets `linkedChildren` array
4. Backend calls `kv.getByPrefix('user:')`
5. Backend filters users by IDs in `linkedChildren`
6. Returns array of child user objects

**Components:** `ParentDashboard`  
**Files:** `/supabase/functions/server/index.tsx` (lines 748-774)

---

### 2. Organization Data

**Key Pattern:** `organization:{organizationCode}`  
**Example:** `organization:JOTM-ABC123`  
**Storage:** Supabase KV Store  
**Count:** ~100s of records

#### Value Structure

```json
{
  "code": "JOTM-ABC123",
  "name": "Accra Secondary Schools District",
  "type": "School",
  "industrySector": "Education",
  "createdAt": "2026-01-01T00:00:00Z",
  "createdBy": "supervisor@school.edu.gh"
}
```

#### Processes Using This Key

##### Process 2.1: Supervisor Creates Organization

**Component:** `OrganizationAuthForm`  
**API Endpoint:** `POST /make-server-fc8eb847/signup` (with role='organization')  
**Flow:**

1. Supervisor signs up
2. Backend generates unique org code: `JOTM-XXXXXX`
3. Backend creates `organization:{code}` key
4. Backend creates `user:{supervisorId}` with `organizationCode`
5. Returns code to supervisor for sharing

**Components:** `OrganizationAuthForm`, `SupervisorApp`  
**Files:** `/supabase/functions/server/index.tsx` (lines 141-153)

##### Process 2.2: Validate Organization Code

**Component:** `AuthForm` (Teacher/Professional signup)  
**API Endpoint:** `POST /make-server-fc8eb847/validate-org-code`  
**Flow:**

1. Teacher enters org code during signup
2. Frontend sends: `{ code: "JOTM-ABC123" }`
3. Backend reads `organization:{code}`
4. If exists: Returns `{ valid: true, organizationName, organizationType }`
5. If not exists: Returns `{ valid: false, error }`
6. Frontend displays org name or error

**Components:** `AuthForm`, `OrganizationCodeHelp`  
**Files:** `/supabase/functions/server/index.tsx` (lines 98-126)

##### Process 2.3: Link User to Organization

**Component:** `AuthForm` (Teacher/Professional signup)  
**API Endpoint:** `POST /make-server-fc8eb847/signup` (with organizationCode)  
**Flow:**

1. Teacher/Professional signs up with org code
2. Backend validates `organization:{code}` exists
3. Backend creates `user:{userId}` with `organizationCode` and `organizationName`
4. User is now linked to organization

**Components:** `AuthForm`  
**Files:** `/supabase/functions/server/index.tsx` (lines 154-163)

##### Process 2.4: Get Organization Members

**Component:** `OrganizationApp`, `SupervisorDashboard`  
**Flow:**

1. Supervisor views organization dashboard
2. Frontend gets supervisor's `organizationCode`
3. Frontend calls `GET /admin/users`
4. Backend returns all users
5. Frontend filters: `users.filter(u => u.organizationCode === supervisorOrgCode)`
6. Displays member roster

**Components:** `OrganizationApp`, `OrganizationManager`, `SupervisorDashboard`

---

### 3. Assessment Results

**Key Pattern:** `result:{userId}:{assessmentType}`  
**Examples:**

- `result:user123:jhs-thinking`
- `result:user123:shs-thinking`
- `result:user123:adult-thinking`
- `result:user123:kids-assessment`
- `result:user123:kolb:v1`
- `result:user123:sternberg:v1`
- `result:user123:decision:v1`

**Storage:** Supabase KV Store  
**Count:** ~10,000s of records

#### Value Structure

```json
{
  "id": "result:user123:jhs-thinking",
  "userId": "user123",
  "assessmentType": "jhs-thinking",
  "responses": [
    { "questionId": "q1", "answer": "A", "points": 3 },
    { "questionId": "q2", "answer": "B", "points": 5 }
  ],
  "results": {
    "analytical": 75,
    "creative": 85,
    "practical": 70,
    "dominantStyle": "creative",
    "balanceScore": 77
  },
  "completedAt": "2026-03-15T10:30:00Z"
}
```

#### Processes Using This Key

##### Process 3.1: Submit JHS Assessment

**Component:** `JHSThinkingAssessment`  
**API Endpoint:** `POST /make-server-fc8eb847/jhs-thinking/submit`  
**Flow:**

1. Student completes all questions
2. Frontend calculates scores
3. Frontend sends: `{ responses, results }`
4. Backend creates `result:{userId}:jhs-thinking` key
5. Backend updates `user:{userId}`:
   - Adds `"jhs-thinking"` to `assessmentsCompleted`
   - Sets `lastJHSAssessment` timestamp
6. Returns: `{ success: true, resultId }`

**Components:** `JHSThinkingAssessment`, `JHSThinkingContainer`  
**Files:** `/supabase/functions/server/index.tsx` (lines 367-406)

##### Process 3.2: Submit SHS Assessment

**Component:** `SHSThinkingAssessment`  
**API Endpoint:** `POST /make-server-fc8eb847/shs-thinking/submit`  
**Flow:** Same as JHS, but creates `result:{userId}:shs-thinking`

**Components:** `SHSThinkingAssessment`, `SHSThinkingContainer`  
**Files:** `/supabase/functions/server/index.tsx` (lines 408-446)

##### Process 3.3: Submit Adult Assessment

**Component:** `AdultThinkingAssessment`  
**API Endpoint:** `POST /make-server-fc8eb847/adult-thinking/submit`  
**Flow:** Same as JHS, but creates `result:{userId}:adult-thinking`

**Components:** `AdultThinkingAssessment`, `AdultThinkingContainer`  
**Files:** `/supabase/functions/server/index.tsx` (lines 488-526)

##### Process 3.4: Get Assessment Results

**Component:** All result viewers  
**API Endpoints:**

- `GET /make-server-fc8eb847/jhs-thinking/results`
- `GET /make-server-fc8eb847/shs-thinking/results`
- `GET /make-server-fc8eb847/adult-thinking/results`

**Flow:**

1. User clicks "View Results"
2. Backend reads `result:{userId}:{type}`
3. If exists: Returns result object
4. If not exists: Returns 404 error
5. Frontend displays charts and insights

**Components:** `JHSThinkingResults`, `SHSThinkingResults`, `AdultThinkingResults`, `CognitiveProfile`  
**Files:** `/supabase/functions/server/index.tsx` (lines 448-486, 528-548)

##### Process 3.5: Get All User Assessments

**Component:** `CognitiveProfile`, `AssessmentHistory`  
**Flow:**

1. User views cognitive profile
2. Frontend calls `GET /admin/user/:userId`
3. Backend reads all `result:{userId}:*` using prefix query
4. Returns array of all assessment results
5. Frontend aggregates scores, displays comprehensive profile

**Components:** `CognitiveProfile`, `CombinedCognitiveProfile`, `AssessmentHistory`

##### Process 3.6: Teacher Views Student Results

**Component:** `TeacherDashboard`  
**Flow:**

1. Teacher clicks on student
2. Frontend calls `GET /admin/user/:studentId`
3. Backend returns `user` + all `result:{studentId}:*`
4. Frontend displays student's assessment history

**Components:** `TeacherIndividualStudentView`, `StudentDetailView`

##### Process 3.7: Parent Views Child Results

**Component:** `ParentDashboard`  
**Flow:**

1. Parent clicks on linked child
2. Frontend checks `consent:{childId}:{parentId}` status
3. If approved, frontend calls `GET /admin/user/:childId`
4. Backend returns child's user + results
5. Frontend displays child's results

**Components:** `ParentDashboard`, `ParentChildCognitiveReport`

---

### 4. Assessment Progress (In-Progress Saves)

**Key Pattern:** `progress:{userId}:{assessmentType}`  
**Example:** `progress:user123:jhs-thinking`  
**Storage:** Supabase KV Store  
**Count:** ~100s of records (active assessments only)

#### Value Structure

```json
{
  "userId": "user123",
  "assessmentType": "jhs-thinking",
  "currentQuestion": 7,
  "totalQuestions": 30,
  "responses": [
    { "questionId": "q1", "answer": "A" },
    { "questionId": "q2", "answer": "B" }
  ],
  "startedAt": "2026-03-15T10:00:00Z",
  "lastSavedAt": "2026-03-15T10:15:00Z"
}
```

#### Processes Using This Key

##### Process 4.1: Auto-Save Assessment Progress

**Component:** All assessment components  
**API Endpoint:** `POST /make-server-fc8eb847/assessment/progress/:type`  
**Flow:**

1. Student answers a question
2. Frontend auto-saves every answer OR every 30 seconds
3. Frontend sends: `{ currentQuestion, responses }`
4. Backend creates/updates `progress:{userId}:{type}`
5. Returns: `{ success: true }`

**Components:** All assessment components  
**Files:** `/supabase/functions/server/assessment-routes.tsx`

##### Process 4.2: Resume Assessment

**Component:** All assessment components  
**API Endpoint:** `GET /make-server-fc8eb847/assessment/progress/:type`  
**Flow:**

1. Student starts assessment
2. Frontend calls `GET /assessment/progress/{type}`
3. Backend reads `progress:{userId}:{type}`
4. If exists: Returns progress object
5. Frontend asks: "Resume where you left off?"
6. If yes: Loads responses and question index
7. If no: Starts fresh

**Components:** All assessment components

##### Process 4.3: Clear Progress on Completion

**Component:** All assessment components  
**API Endpoint:** `DELETE /make-server-fc8eb847/assessment/progress/:type`  
**Flow:**

1. Student completes assessment
2. Backend creates `result:{userId}:{type}`
3. Backend deletes `progress:{userId}:{type}`
4. Prevents stale progress data

**Components:** All assessment components

---

### 5. Question Banks (Versioned)

**Key Pattern:** `questions:{framework}:{version}`  
**Examples:**

- `questions:kolb:v1`
- `questions:sternberg:v1`
- `questions:decision:v1`

**Storage:** Supabase KV Store  
**Count:** ~10 records (one per framework version)

#### Value Structure

```json
{
  "version": "v1",
  "framework": "sternberg",
  "createdAt": "2024-12-01T00:00:00Z",
  "description": "Full Sternberg Thinking Styles Assessment - 100 Questions",
  "totalQuestions": 100,
  "distribution": {
    "Analytical": 34,
    "Creative": 33,
    "Practical": 33
  },
  "questions": [
    {
      "id": "sternberg-1",
      "question": "When solving a problem, I prefer to...",
      "options": [
        { "text": "Analyze data systematically", "value": "analytical" },
        { "text": "Think of creative solutions", "value": "creative" },
        { "text": "Apply practical experience", "value": "practical" }
      ],
      "category": "problem-solving",
      "difficulty": "medium"
    }
    // ... 99 more questions
  ]
}
```

#### Processes Using This Key

##### Process 5.1: Initialize Question Banks

**Component:** Edge Function Server Startup  
**Flow:**

1. Edge function deploys
2. Server checks if `questions:kolb:v1` exists
3. If not exists:
   - Loads questions from `/supabase/functions/server/full-question-bank.tsx`
   - Creates `questions:kolb:v1` with 100 Kolb questions
   - Creates `questions:sternberg:v1` with 100 Sternberg questions
   - Creates `questions:decision:v1` with 100 Decision questions
4. If exists: Skips initialization

**Files:** `/supabase/functions/server/assessment-routes.tsx` (lines 54-146)

##### Process 5.2: Load Questions for Assessment

**Component:** All assessment components  
**API Endpoint:** `GET /make-server-fc8eb847/questions/:framework/:version`  
**Flow:**

1. Assessment starts
2. Frontend requests questions
3. Backend reads `questions:{framework}:{version}`
4. Returns question array
5. Frontend randomizes order
6. Frontend displays first question

**Components:** All assessment components

##### Process 5.3: Version Question Banks (Future)

**Flow:**

1. Admin updates questions
2. Backend creates `questions:{framework}:v2`
3. Old assessments still use v1 (historical consistency)
4. New assessments use v2
5. No data migration needed

---

### 6. Reflections

**Key Pattern:** `reflection:{userId}:{timestamp}`  
**Example:** `reflection:user123:1711358400000`  
**Storage:** Supabase KV Store  
**Count:** ~1000s of records

#### Value Structure

```json
{
  "id": "reflection:user123:1711358400000",
  "userId": "user123",
  "content": "I realized that I approach problems more creatively than I thought. This assessment helped me understand why I sometimes struggle with purely analytical tasks...",
  "assessmentResultId": "result:user123:jhs-thinking",
  "createdAt": "2026-03-15T10:40:00Z"
}
```

#### Processes Using This Key

##### Process 6.1: Save Reflection

**Component:** `AssessmentSummary`, `GuidedReflection`  
**API Endpoint:** `POST /make-server-fc8eb847/reflection`  
**Flow:**

1. Student completes assessment
2. Optional reflection prompt appears
3. Student writes reflection
4. Frontend sends: `{ content, assessmentResultId }`
5. Backend creates `reflection:{userId}:{timestamp}`
6. Returns: `{ success: true, reflection }`

**Components:** `AssessmentSummary`, `GuidedReflection`, `FeedbackPrompt`  
**Files:** `/supabase/functions/server/index.tsx` (lines 552-582)

##### Process 6.2: Get User Reflections

**Component:** `ReflectionsViewer`  
**API Endpoint:** `GET /make-server-fc8eb847/reflection`  
**Flow:**

1. User clicks "View My Reflections"
2. Backend calls `kv.getByPrefix('reflection:{userId}:')`
3. Backend sorts by `createdAt` descending
4. Returns array of reflection objects
5. Frontend displays in chronological order

**Components:** `ReflectionsViewer`  
**Files:** `/supabase/functions/server/index.tsx` (lines 584-604)

##### Process 6.3: Admin Views User Reflections

**Component:** `AdminPanel`  
**API Endpoint:** `GET /make-server-fc8eb847/admin/user/:userId/reflections`  
**Flow:**

1. Admin clicks on user
2. Backend verifies admin auth
3. Backend calls `kv.getByPrefix('reflection:{userId}:')`
4. Returns reflection array
5. Frontend displays in admin panel

**Components:** `AdminPanel`, `AdminDiagnostic`  
**Files:** `/supabase/functions/server/index.tsx` (lines 606-632)

---

### 7. Parent-Child Consent

**Key Pattern:** `consent:{childId}:{parentId}`  
**Example:** `consent:child-123:parent-456`  
**Storage:** Supabase KV Store  
**Count:** ~100s of records

#### Value Structure

```json
{
  "childId": "child-123",
  "parentId": "parent-456",
  "status": "approved",
  "requestedAt": "2026-03-01T10:00:00Z",
  "approvedAt": "2026-03-01T14:30:00Z",
  "consentType": "view_profile",
  "expiresAt": null
}
```

#### Processes Using This Key

##### Process 7.1: Parent Links Child

**Component:** `ParentDashboard`  
**API Endpoint:** `POST /make-server-fc8eb847/parent/link-child`  
**Flow:**

1. Parent enters child's email
2. Backend finds child user by email
3. Backend checks child's age:
   - **Age < 13:** Auto-approve (COPPA - parent has authority)
   - **Age 13-17:** Create pending consent request
   - **Age 18+:** Require explicit consent
4. Backend creates `consent:{childId}:{parentId}` with appropriate status
5. Backend updates `user:{parentId}` - adds child to `linkedChildren` array
6. Returns: `{ success: true, child }`

**Components:** `ParentDashboard`  
**Files:** `/supabase/functions/server/index.tsx` (lines 776-855)

##### Process 7.2: Child Approves/Denies Access (Age 13+)

**Component:** `StudentDashboard`, `ParentAccessRequests`  
**Flow:**

1. Child logs in, sees access request notification
2. Child reviews request details
3. Child clicks "Approve" or "Deny"
4. Frontend sends: `{ status: "approved" | "denied" }`
5. Backend updates `consent:{childId}:{parentId}` status
6. Backend sets `approvedAt` or `deniedAt` timestamp
7. Parent gets notification

**Components:** `StudentDashboard`, `ParentAccessRequests`

##### Process 7.3: Check Consent Before Access

**Component:** `ParentDashboard`  
**Flow:**

1. Parent clicks "View Child Profile"
2. Frontend reads `consent:{childId}:{parentId}` (cached)
3. If status === 'approved': Allow access
4. If status === 'pending': Show "Waiting for approval"
5. If status === 'denied': Show "Access denied"
6. If not exists: Show "Link child first"

**Components:** `ParentDashboard`

##### Process 7.4: Revoke Consent

**Component:** `StudentDashboard`, `AgePrivacySettings`  
**Flow:**

1. Child clicks "Revoke Parent Access"
2. Frontend sends: `{ parentId }`
3. Backend updates `consent:{childId}:{parentId}` status to "revoked"
4. Backend removes child from parent's `linkedChildren` array
5. Parent loses access immediately

**Components:** `StudentDashboard`, `AgePrivacySettings`, `PrivacyProtectionBanner`

---

### 8. Admin Identifier

**Key Pattern:** `admin:user`  
**Value:** `"admin-001"` (user ID string)  
**Storage:** Supabase KV Store  
**Count:** 1 record

#### Value

```
"admin-001"
```

#### Process Using This Key

##### Process 8.1: Identify Admin User

**Flow:**

1. During signup, if email === `Alex.Attachey@gmail.com`
2. Backend sets `admin:user` to that user's ID
3. Admin authentication uses special token: `admin-token-{timestamp}`
4. verifyAuth function checks for admin token in header
5. If admin token present, returns hardcoded admin user object
6. Bypasses normal Supabase JWT validation

**Files:** `/supabase/functions/server/index.tsx` (lines 27-83, 204-206)

---

### 9. Daily Challenges

**Key Pattern:** `challenge:daily:{date}`  
**Example:** `challenge:daily:2026-03-23`  
**Storage:** Supabase KV Store  
**Count:** ~365 per year

#### Value Structure

```json
{
  "date": "2026-03-23",
  "challenge": "Name three things you learned this week",
  "category": "reflection",
  "difficulty": "easy",
  "points": 50
}
```

#### Processes Using This Key

##### Process 9.1: Get Today's Challenge

**Component:** `DailyChallengeTab`, `ChildrenDailyChallenges`  
**API Endpoint:** `GET /make-server-fc8eb847/daily-challenge`  
**Flow:**

1. User opens dashboard
2. Frontend gets today's date: `2026-03-23`
3. Backend reads `challenge:daily:2026-03-23`
4. If exists: Returns challenge
5. If not exists: Generates new challenge, stores it, returns it

**Components:** `DailyChallengeTab`, `ChildrenDailyChallenges`, `GamificationDashboard`  
**Files:** `/supabase/functions/server/daily-challenge-routes.tsx`

##### Process 9.2: Create Challenge (Admin)

**Component:** Admin panel  
**API Endpoint:** `POST /make-server-fc8eb847/daily-challenge`  
**Flow:**

1. Admin creates challenge for specific date
2. Backend creates `challenge:daily:{date}`
3. Returns: `{ success: true }`

---

### 10. Challenge Completions

**Key Pattern:** `challenge-completion:{userId}:{date}`  
**Example:** `challenge-completion:user123:2026-03-23`  
**Storage:** Supabase KV Store  
**Count:** ~10,000s of records

#### Value Structure

```json
{
  "userId": "user123",
  "challengeDate": "2026-03-23",
  "completed": true,
  "completedAt": "2026-03-23T15:30:00Z",
  "points": 50,
  "response": "1. Spanish verbs, 2. Photosynthesis, 3. Quadratic equations"
}
```

#### Processes Using This Key

##### Process 10.1: Complete Challenge

**Component:** `DailyChallengeTab`  
**API Endpoint:** `POST /make-server-fc8eb847/daily-challenge/complete`  
**Flow:**

1. User completes today's challenge
2. Frontend sends: `{ date, response }`
3. Backend creates `challenge-completion:{userId}:{date}`
4. Backend updates `user:{userId}` - adds points
5. Returns: `{ success: true, points }`

**Components:** `DailyChallengeTab`, `ChildrenDailyChallenges`  
**Files:** `/supabase/functions/server/daily-challenge-routes.tsx`

##### Process 10.2: Get Challenge History

**Component:** `GamificationDashboard`  
**API Endpoint:** `GET /make-server-fc8eb847/daily-challenge/history`  
**Flow:**

1. User views challenge history
2. Backend calls `kv.getByPrefix('challenge-completion:{userId}:')`
3. Backend sorts by date descending
4. Returns array of completions
5. Frontend displays streak, total completed

**Components:** `GamificationDashboard`, `ProfileBadge`

##### Process 10.3: Calculate Streak

**Component:** `GamificationDashboard`  
**Flow:**

1. Frontend gets all completions from history API
2. Frontend sorts by date descending
3. Frontend checks consecutive days:
   - Start from today
   - Count backwards while completions exist
   - Stop at first missing day
4. Frontend displays streak number

**Components:** `GamificationDashboard`

---

### 11. Teaching Style Assessments

**Key Pattern:** `teaching-style:{userId}`  
**Example:** `teaching-style:teacher-123`  
**Storage:** Supabase KV Store  
**Count:** ~100s of records

#### Value Structure

```json
{
  "userId": "teacher-123",
  "assessmentType": "teaching-style",
  "results": {
    "teachingStyle": "Facilitator",
    "studentInteractionStyle": "Collaborative",
    "classroomManagement": "Democratic",
    "assessmentApproach": "Formative"
  },
  "responses": [
    { "questionId": "ts1", "answer": "A" }
  ],
  "completedAt": "2026-03-10T11:00:00Z"
}
```

#### Processes Using This Key

##### Process 11.1: Submit Teaching Style Assessment

**Component:** `TeachingStyleAssessment`  
**API Endpoint:** `POST /make-server-fc8eb847/teaching-style/submit`  
**Flow:**

1. Teacher completes teaching style quiz
2. Frontend calculates teaching style categories
3. Frontend sends: `{ responses, results }`
4. Backend creates `teaching-style:{userId}`
5. Returns: `{ success: true }`

**Components:** `TeachingStyleAssessment`

##### Process 11.2: Get Teaching Style Results

**Component:** `TeachingStyleResults`, `ProfessionalDashboard`  
**API Endpoint:** `GET /make-server-fc8eb847/teaching-style/results`  
**Flow:**

1. Teacher views results
2. Backend reads `teaching-style:{userId}`
3. If exists: Returns results
4. If not exists: Returns 404
5. Frontend displays teaching style breakdown

**Components:** `TeachingStyleResults`, `ProfessionalDashboard`

---

### 12. Parent Observation Assessments

**Key Pattern:** `observation:{parentId}:{childId}:{timestamp}`  
**Example:** `observation:parent-123:child-456:1711358400000`  
**Storage:** Supabase KV Store  
**Count:** ~1000s of records

#### Value Structure

```json
{
  "id": "observation:parent-123:child-456:1711358400000",
  "parentId": "parent-123",
  "childId": "child-456",
  "childAge": 8,
  "observationType": "behavioral",
  "responses": [
    { "questionId": "obs1", "answer": "Often", "category": "analytical" },
    { "questionId": "obs2", "answer": "Sometimes", "category": "creative" }
  ],
  "results": {
    "analytical": 70,
    "creative": 85,
    "practical": 75,
    "dominantStyle": "creative"
  },
  "notes": "Child shows strong creative problem-solving...",
  "completedAt": "2026-03-15T16:00:00Z"
}
```

#### Processes Using This Key

##### Process 12.1: Submit Parent Observation

**Component:** `ParentObservationAssessment`  
**API Endpoint:** `POST /make-server-fc8eb847/parent-observation/submit`  
**Flow:**

1. Parent completes behavioral observation questionnaire
2. Frontend scores responses by category
3. Frontend sends: `{ childId, responses, results, notes }`
4. Backend creates `observation:{parentId}:{childId}:{timestamp}`
5. Returns: `{ success: true, observationId }`

**Components:** `ParentObservationAssessment`

##### Process 12.2: Get Child Observations

**Component:** `ParentObservationResults`, `ParentDashboard`  
**API Endpoint:** `GET /make-server-fc8eb847/parent-observation/results/:childId`  
**Flow:**

1. Parent views child's observations
2. Backend calls `kv.getByPrefix('observation:{parentId}:{childId}:')`
3. Backend sorts by timestamp descending
4. Returns array of observation objects
5. Frontend displays observation history

**Components:** `ParentObservationResults`, `ParentDashboard`

##### Process 12.3: Generate PDF Report

**Component:** `ParentObservationResults`  
**Flow:**

1. Parent clicks "Download PDF"
2. Frontend gets observation data (already loaded)
3. Frontend calls `parentObservationPdfGenerator.ts`
4. Generates PDF with charts and insights
5. Downloads PDF file

**Components:** `ParentObservationResults`  
**Files:** `/utils/parentObservationPdfGenerator.ts`

---

## API Endpoints Mapped to Keys

### Complete API Reference

**Base URL:** `/make-server-fc8eb847`

| Endpoint                               | Method | Keys Read                                     | Keys Written                                            | Keys Deleted                       |
| -------------------------------------- | ------ | --------------------------------------------- | ------------------------------------------------------- | ---------------------------------- |
| `/signup`                              | POST   | `organization:{code}`                         | `user:{userId}`, `organization:{code}`, `admin:user`    | -                                  |
| `/signin`                              | POST   | `user:{userId}`                               | -                                                       | -                                  |
| `/session`                             | GET    | `user:{userId}`                               | -                                                       | -                                  |
| `/user/profile`                        | PATCH  | `user:{userId}`                               | `user:{userId}`                                         | -                                  |
| `/validate-org-code`                   | POST   | `organization:{code}`                         | -                                                       | -                                  |
| `/jhs-thinking/submit`                 | POST   | `user:{userId}`                               | `result:{userId}:jhs-thinking`, `user:{userId}`         | `progress:{userId}:jhs-thinking`   |
| `/jhs-thinking/results`                | GET    | `result:{userId}:jhs-thinking`                | -                                                       | -                                  |
| `/shs-thinking/submit`                 | POST   | `user:{userId}`                               | `result:{userId}:shs-thinking`, `user:{userId}`         | `progress:{userId}:shs-thinking`   |
| `/shs-thinking/results`                | GET    | `result:{userId}:shs-thinking`                | -                                                       | -                                  |
| `/adult-thinking/submit`               | POST   | `user:{userId}`                               | `result:{userId}:adult-thinking`, `user:{userId}`       | `progress:{userId}:adult-thinking` |
| `/adult-thinking/results`              | GET    | `result:{userId}:adult-thinking`              | -                                                       | -                                  |
| `/assessment/submit`                   | POST   | `user:{userId}`                               | `result:{userId}:{type}`, `user:{userId}`               | `progress:{userId}:{type}`         |
| `/assessment/results/:type`            | GET    | `result:{userId}:{type}`                      | -                                                       | -                                  |
| `/assessment/progress/:type`           | POST   | -                                             | `progress:{userId}:{type}`                              | -                                  |
| `/assessment/progress/:type`           | GET    | `progress:{userId}:{type}`                    | -                                                       | -                                  |
| `/assessment/progress/:type`           | DELETE | -                                             | -                                                       | `progress:{userId}:{type}`         |
| `/questions/:framework/:version`       | GET    | `questions:{framework}:{version}`             | -                                                       | -                                  |
| `/cognitive-profile`                   | POST   | `user:{userId}`                               | `user:{userId}`                                         | -                                  |
| `/reflection`                          | POST   | -                                             | `reflection:{userId}:{timestamp}`                       | -                                  |
| `/reflection`                          | GET    | `reflection:{userId}:*` (prefix)              | -                                                       | -                                  |
| `/parent/children`                     | GET    | `user:{parentId}`, `user:*` (prefix)          | -                                                       | -                                  |
| `/parent/link-child`                   | POST   | `user:{parentId}`, `user:*` (search by email) | `consent:{childId}:{parentId}`, `user:{parentId}`       | -                                  |
| `/daily-challenge`                     | GET    | `challenge:daily:{date}`                      | `challenge:daily:{date}` (if not exists)                | -                                  |
| `/daily-challenge/complete`            | POST   | `user:{userId}`                               | `challenge-completion:{userId}:{date}`, `user:{userId}` | -                                  |
| `/daily-challenge/history`             | GET    | `challenge-completion:{userId}:*` (prefix)    | -                                                       | -                                  |
| `/teaching-style/submit`               | POST   | -                                             | `teaching-style:{userId}`                               | -                                  |
| `/teaching-style/results`              | GET    | `teaching-style:{userId}`                     | -                                                       | -                                  |
| `/parent-observation/submit`           | POST   | -                                             | `observation:{parentId}:{childId}:{timestamp}`          | -                                  |
| `/parent-observation/results/:childId` | GET    | `observation:{parentId}:{childId}:*` (prefix) | -                                                       | -                                  |
| `/admin/users`                         | GET    | `user:*` (prefix)                             | -                                                       | -                                  |
| `/admin/stats`                         | GET    | `user:*` (prefix), `result:*` (prefix)        | -                                                       | -                                  |
| `/admin/user/:userId`                  | GET    | `user:{userId}`, `result:{userId}:*` (prefix) | -                                                       | -                                  |
| `/admin/user/:userId/reflections`      | GET    | `reflection:{userId}:*` (prefix)              | -                                                       | -                                  |

---

## Data Flow Examples

### Example 1: Complete Student Journey

```
┌─────────────────────────────────────────────────────────┐
│ STUDENT SIGNUP TO ASSESSMENT COMPLETION                │
└─────────────────────────────────────────────────────────┘

1. Student Signs Up
   Component: AuthForm
   → POST /signup
   → Reads: Nothing
   → Writes: user:{studentId}
   → Returns: { userId, user }

2. Student Logs In
   Component: AuthForm
   → POST /signin
   → Reads: user:{studentId}
   → Writes: Nothing
   → Returns: { session, user }

3. Dashboard Loads
   Component: StudentDashboard
   → GET /session
   → Reads: user:{studentId}
   → Determines age: 15 (JHS age group)
   → Shows JHS Dashboard

4. Student Starts Assessment
   Component: JHSThinkingAssessment
   → GET /questions/sternberg/v1
   → Reads: questions:sternberg:v1
   → Returns: 100 questions
   → Frontend randomizes order

5. Student Answers Question 1
   Component: JHSThinkingAssessment
   → Auto-save triggered
   → POST /assessment/progress/jhs-thinking
   → Writes: progress:{studentId}:jhs-thinking
   → Stores: { currentQuestion: 1, responses: [...] }

6. Student Answers Questions 2-29 (same auto-save flow)

7. Student Completes Assessment
   Component: JHSThinkingAssessment
   → POST /jhs-thinking/submit
   → Writes: result:{studentId}:jhs-thinking
   → Updates: user:{studentId}.assessmentsCompleted
   → Deletes: progress:{studentId}:jhs-thinking
   → Returns: { success: true, resultId }

8. Student Views Results
   Component: JHSThinkingResults
   → GET /jhs-thinking/results
   → Reads: result:{studentId}:jhs-thinking
   → Returns: { analytical: 75, creative: 85, practical: 70 }
   → Displays charts and insights

9. Student Writes Reflection
   Component: GuidedReflection
   → POST /reflection
   → Writes: reflection:{studentId}:{timestamp}
   → Links to result:{studentId}:jhs-thinking
   → Returns: { success: true }
```

### Example 2: Teacher Monitors Class

```
┌─────────────────────────────────────────────────────────┐
│ TEACHER SIGNUP TO STUDENT MONITORING                   │
└─────────────────────────────────────────────────────────┘

1. Teacher Signs Up with Org Code
   Component: AuthForm
   → POST /validate-org-code { code: "JOTM-ABC123" }
   → Reads: organization:JOTM-ABC123
   → Returns: { valid: true, organizationName: "Accra Schools" }

   → POST /signup { ..., organizationCode: "JOTM-ABC123" }
   → Reads: organization:JOTM-ABC123 (validates again)
   → Writes: user:{teacherId} with organizationCode field
   → Returns: { userId, user }

2. Teacher Views Dashboard
   Component: TeacherDashboard
   → GET /session
   → Reads: user:{teacherId}
   → Gets: school = "Accra Secondary"

   → GET /admin/users
   → Reads: user:* (all users via prefix)
   → Frontend filters: users.filter(u =>
       u.school === "Accra Secondary" &&
       u.role === "student"
     )
   → Displays: 30 students

3. Teacher Clicks on Student
   Component: StudentDetailView
   → GET /admin/user/{studentId}
   → Reads: user:{studentId}
   → Reads: result:{studentId}:* (all assessments)
   → Returns: { user, results: [jhs-thinking, shs-thinking] }

   → Displays:
     - Student profile
     - Assessment scores
     - Cognitive strengths
     - Recommended interventions

4. Teacher Views Student Reflection
   Component: StudentDetailView
   → GET /admin/user/{studentId}/reflections
   → Reads: reflection:{studentId}:* (prefix)
   → Returns: [reflection1, reflection2, ...]
   → Displays reflection history
```

### Example 3: Parent Links and Monitors Child

```
┌─────────────────────────────────────────────────────────┐
│ PARENT LINKS CHILD AND VIEWS PROGRESS                  │
└─────────────────────────────────────────────────────────┘

1. Parent Signs Up
   Component: AuthForm
   → POST /signup { role: "parent", ... }
   → Writes: user:{parentId}
   → Returns: { userId, user }

2. Parent Links Child
   Component: ParentDashboard
   → Parent enters child email: "student@example.com"

   → POST /parent/link-child { childEmail: "student@example.com" }
   → Reads: user:* (prefix) to find child by email
   → Finds: user:{childId}
   → Reads: user:{childId} to get age
   → Age check:
     - If age < 13: Auto-approve (COPPA)
     - If age 13-17: Create pending consent
     - If age 18+: Require explicit consent

   → Child is 8 years old (< 13)
   → Writes: consent:{childId}:{parentId} with status="approved"
   → Updates: user:{parentId}.linkedChildren = [childId]
   → Returns: { success: true, child }

3. Parent Views Child Dashboard
   Component: ParentDashboard
   → GET /parent/children
   → Reads: user:{parentId} (gets linkedChildren array)
   → Reads: user:* (prefix) to get all users
   → Filters users by IDs in linkedChildren
   → Returns: [childUser]

   → For each child:
     → GET /admin/user/{childId}
     → Reads: user:{childId}
     → Reads: result:{childId}:* (all assessments)
     → Returns: { user, results }

   → Displays:
     - Child profile
     - Assessment completion status
     - Cognitive profile
     - Learning recommendations

4. Parent Completes Observation Assessment
   Component: ParentObservationAssessment
   → Parent answers behavioral questions about child

   → POST /parent-observation/submit
   → Writes: observation:{parentId}:{childId}:{timestamp}
   → Returns: { success: true, observationId }

5. Parent Views Observation Results
   Component: ParentObservationResults
   → GET /parent-observation/results/{childId}
   → Reads: observation:{parentId}:{childId}:* (prefix)
   → Returns: [observation1, observation2, ...]
   → Displays observation history + PDF download option
```

### Example 4: Supervisor Manages Organization

```
┌─────────────────────────────────────────────────────────┐
│ SUPERVISOR CREATES ORG AND MANAGES MEMBERS             │
└─────────────────────────────────────────────────────────┘

1. Supervisor Signs Up
   Component: OrganizationAuthForm
   → POST /signup {
       role: "organization",
       organizationName: "Accra Schools District",
       organizationType: "School"
     }

   → Backend generates org code: "JOTM-ABC123"
   → Writes: organization:JOTM-ABC123
   → Writes: user:{supervisorId} with organizationCode
   → Returns: {
       userId,
       user,
       organizationCode: "JOTM-ABC123"
     }

   → Frontend displays: "Your code: JOTM-ABC123"

2. Teachers Sign Up with Code
   (Multiple teachers repeat this)
   → POST /validate-org-code { code: "JOTM-ABC123" }
   → POST /signup { ..., organizationCode: "JOTM-ABC123" }
   → Writes: user:{teacherId} with organizationCode="JOTM-ABC123"

3. Supervisor Views Organization Dashboard
   Component: SupervisorDashboard
   → GET /session
   → Reads: user:{supervisorId}
   → Gets: organizationCode = "JOTM-ABC123"

   → GET /admin/users
   → Reads: user:* (all users via prefix)
   → Frontend filters: users.filter(u =>
       u.organizationCode === "JOTM-ABC123"
     )
   → Displays:
     - 15 teachers
     - 3 professionals
     - 200 students (indirectly via schools)

4. Supervisor Reviews Member
   Component: OrganizationManager
   → Click on teacher: "John Smith"
   → GET /admin/user/{teacherId}
   → Reads: user:{teacherId}
   → Reads: result:{teacherId}:* (if any assessments)
   → Displays member details
```

---

## Storage Location Reference

### Where is Each Type of Data Stored?

| Data Type                                  | Storage Location     | Access Method                                  | Persistence                      |
| ------------------------------------------ | -------------------- | ---------------------------------------------- | -------------------------------- |
| **User Profiles**                          | Supabase KV Store    | `user:{userId}`                                | Permanent                        |
| **Authentication Tokens**                  | Supabase Auth        | Session API                                    | Temporary (expires)              |
| **Admin Token**                            | Browser localStorage | `admin_token`                                  | Session (clears on logout)       |
| **Admin User**                             | Browser localStorage | `admin_user`                                   | Session (clears on logout)       |
| **Organizations**                          | Supabase KV Store    | `organization:{code}`                          | Permanent                        |
| **Assessment Results**                     | Supabase KV Store    | `result:{userId}:{type}`                       | Permanent                        |
| **Assessment Progress**                    | Supabase KV Store    | `progress:{userId}:{type}`                     | Temporary (clears on completion) |
| **Question Banks**                         | Supabase KV Store    | `questions:{framework}:{version}`              | Permanent (versioned)            |
| **Reflections**                            | Supabase KV Store    | `reflection:{userId}:{timestamp}`              | Permanent                        |
| **Consent Records**                        | Supabase KV Store    | `consent:{childId}:{parentId}`                 | Permanent                        |
| **Daily Challenges**                       | Supabase KV Store    | `challenge:daily:{date}`                       | Permanent                        |
| **Challenge Completions**                  | Supabase KV Store    | `challenge-completion:{userId}:{date}`         | Permanent                        |
| **Teaching Assessments**                   | Supabase KV Store    | `teaching-style:{userId}`                      | Permanent                        |
| **Parent Observations**                    | Supabase KV Store    | `observation:{parentId}:{childId}:{timestamp}` | Permanent                        |
| **User Consent (Client)**                  | Browser localStorage | `jotminds_consent`                             | Session                          |
| **Parent PIN**                             | Browser localStorage | `kidsMode_parentPIN`                           | Session                          |
| **Assessment In-Progress (Client Backup)** | Browser localStorage | `assessment_progress_{type}`                   | Session                          |

### Data Backup Strategy

**Server-Side (Supabase):**

- All critical data stored in Supabase KV Store
- Automatic Supabase backups (platform-level)
- Point-in-time recovery available

**Client-Side (localStorage):**

- Only for performance (caching) and offline UX
- Not authoritative - server data always wins
- Clears on logout or browser clear

---

## Performance Considerations

### Fast Operations (O(1))

- Get user by ID: `kv.get('user:{userId}')`
- Get specific assessment: `kv.get('result:{userId}:jhs-thinking')`
- Get org by code: `kv.get('organization:JOTM-ABC123')`
- Get consent status: `kv.get('consent:{childId}:{parentId}')`

### Slower Operations (O(n))

- Get all users: `kv.getByPrefix('user:')` - scans all user keys
- Get all user's assessments: `kv.getByPrefix('result:{userId}:')` - scans user's results
- Get org members: `kv.getByPrefix('user:')` + filter - scans all users

### Optimization Strategies

1. **Cache frequently accessed data** (e.g., current user profile)
2. **Limit prefix queries** on large datasets
3. **Use specific keys** when possible (not prefix)
4. **Filter client-side** after fetching (acceptable for MVP scale)
5. **Future:** Add indexes if needed (e.g., `org-members:{code}` array)

---

## Data Migration & Versioning

### Question Bank Versioning

- Old assessments reference specific versions: `questions:sternberg:v1`
- New questions created as: `questions:sternberg:v2`
- No data migration needed - historical consistency maintained
- Users can retake with new questions, old results preserved

### User Data Updates

- No migrations - just add new fields to existing keys
- Backend handles missing fields gracefully (defaults)
- Example: Adding `phoneNumber` field
  - Old users: Field undefined or null
  - New users: Field populated
  - Frontend: Checks if field exists before using

### Schema Evolution

- KV store allows flexible schema evolution
- Add new key patterns as needed
- Old keys remain compatible
- No downtime for schema changes

---

## Security Considerations

### Access Control

- All API endpoints verify authentication
- Admin routes check `email === 'Alex.Attachey@gmail.com'`
- Parent access requires consent record
- Teacher access filtered by school
- Organization access filtered by organizationCode

### Data Privacy

- Parent-child consent tracked in `consent:{childId}:{parentId}`
- Age-based privacy controls (COPPA compliance)
- Children under 13: Parent has authority
- Children 13-17: Dual consent required
- Children 18+: Full autonomy

### PII Protection

- All data encrypted in transit (HTTPS)
- Supabase encrypts data at rest
- No third-party analytics on PII
- COPPA-compliant data handling

---

**Document End**

_This database schema documentation is complete as of March 23, 2026. All key patterns, processes, and data flows are documented._