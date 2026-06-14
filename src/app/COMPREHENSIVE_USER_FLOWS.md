# JotMinds - Comprehensive User Flow Documentation

**Last Updated:** April 6, 2026  
**Purpose:** Complete visualization of all user journeys, authentication flows, and system interactions

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Authentication & Onboarding Flows](#authentication--onboarding-flows)
3. [Role-Based User Journeys](#role-based-user-journeys)
4. [Password Reset & Deep Link Flow](#password-reset--deep-link-flow)
5. [OAuth Consent Flow](#oauth-consent-flow)
6. [Organization Invitation Code Flow](#organization-invitation-code-flow)
7. [Mobile App User Flow](#mobile-app-user-flow)
8. [Kids Mode User Flow](#kids-mode-user-flow)
9. [Cross-Platform Navigation](#cross-platform-navigation)
10. [Error States & Recovery](#error-states--recovery)

---

## System Architecture Overview

### Platform Entry Points

```
┌─────────────────────────────────────────────────────────────┐
│                    JotMinds Platform                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Entry Points:                                               │
│  ├─ Main Platform      → /App.tsx (State-based routing)     │
│  ├─ Mobile App         → /mobile (React Router)             │
│  ├─ Supervisor Portal  → /organization (Separate auth)      │
│  └─ Admin Panel        → /admin (Special credentials)       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Backend Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Backend                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Authentication:    Supabase Auth (JWT tokens)               │
│  Database:          Key-Value Store (Single table)           │
│  Edge Functions:    /supabase/functions/server/              │
│  Storage Pattern:   12 Key Patterns (see below)              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Storage Patterns

| Pattern | Example | Purpose |
|---------|---------|---------|
| `user:{userId}` | `user:abc-123` | User profiles |
| `organization:{code}` | `organization:JOTM-ABC123` | Organizations |
| `result:{userId}:{type}` | `result:abc-123:jhs-thinking` | Assessment results |
| `progress:{userId}:{type}` | `progress:abc-123:jhs-thinking` | In-progress assessments |
| `questions:{framework}:{version}` | `questions:sternberg:v1` | Question banks |
| `reflection:{userId}:{timestamp}` | `reflection:abc-123:1711358400000` | User reflections |
| `consent:{childId}:{parentId}` | `consent:child-123:parent-456` | Parental consent |
| `admin:user` | `admin:user` | Admin user ID |
| `challenge:daily:{date}` | `challenge:daily:2026-03-23` | Daily challenges |
| `challenge-completion:{userId}:{date}` | `challenge-completion:abc-123:2026-03-23` | Challenge tracking |
| `teaching-style:{userId}` | `teaching-style:teacher-123` | Teaching assessments |
| `observation:{parentId}:{childId}:{timestamp}` | `observation:p-123:c-456:1711358400000` | Parent observations |

---

## Authentication & Onboarding Flows

### Complete User Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Landing Page                                │
│                  /LandingPage.tsx                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Click "Get Started" │
          └──────────┬───────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│             User Agreement & Privacy Acceptance              │
│             /oauth/consent                                   │
│             Component: UserConsentFlow                       │
├─────────────────────────────────────────────────────────────┤
│  [ ] I agree to Terms of Service                            │
│  [ ] I agree to Privacy Policy                              │
│  [ ] I am at least 6 years old                              │
│                                                              │
│  [View Full Terms] [View Full Privacy Policy]               │
│  [Continue]                                                  │
└────────────────────┬────────────────────────────────────────┘
                     │ (Consent accepted)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Age Verification                             │
│                 Component: AgeVerification                   │
├─────────────────────────────────────────────────────────────┤
│  What is your date of birth?                                │
│  [MM] / [DD] / [YYYY]                                        │
│                                                              │
│  This determines your dashboard experience                  │
└────────────────────┬────────────────────────────────────────┘
                     │ (Age determined)
                     ▼
         ┌───────────────────────┐
         │   Age-Based Routing   │
         └───────┬───────────────┘
                 │
     ┌───────────┼───────────┬──────────┐
     │           │           │          │
     ▼           ▼           ▼          ▼
  Ages 6-12   Ages 13-17   Ages 18+   Organization
  (Child)     (Teen)       (Adult)    (Supervisor)
     │           │           │          │
     ▼           ▼           ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐
│Parental │ │Parental │ │Independent│ │Organization│
│Consent  │ │Consent  │ │  Consent  │ │  Consent   │
│Required │ │Required │ │           │ │            │
│+Student │ │+Student │ │           │ │            │
│Assent   │ │Consent  │ │           │ │            │
└────┬────┘ └────┬────┘ └─────┬─────┘ └──────┬─────┘
     │           │            │              │
     │           │            │              │
     └───────────┴────────────┴──────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Role Selection                            │
│                    Component: AuthForm                       │
├─────────────────────────────────────────────────────────────┤
│  Select your role:                                           │
│  ○ Student     ○ Parent                                      │
│  ○ Teacher     ○ Professional/Organization                   │
│                                                              │
│  Your role determines your dashboard and features           │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        │            │            │              │
        ▼            ▼            ▼              ▼
   Student      Teacher      Parent       Professional
   Signup       Signup       Signup        Signup
        │            │            │              │
        └────────────┴────────────┴──────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Registration Form                               │
│              (Role-specific fields)                          │
├─────────────────────────────────────────────────────────────┤
│  Common Fields:                                              │
│  • Full Name                                                 │
│  • Email Address                                             │
│  • Password (with strength indicator)                        │
│  • Phone Number (optional)                                   │
│                                                              │
│  Student-Specific:                                           │
│  • School Name                                               │
│  • Education Level (JHS/SHS/Tertiary)                        │
│  • Organization Code (optional)                              │
│                                                              │
│  Teacher-Specific:                                           │
│  • School Name                                               │
│  • Organization Invitation Code (REQUIRED)                   │
│  • [Verify Code] button                                      │
│                                                              │
│  Professional-Specific:                                      │
│  • Organization Name                                         │
│  • Position/Role                                             │
│  • Organization Invitation Code (optional)                   │
│  • [Verify Code] button                                      │
│                                                              │
│  Parent-Specific:                                            │
│  • (Minimal - just name, email, password, phone)            │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (Form submitted)
                     ▼
         ┌───────────────────────┐
         │  Organization Code    │
         │  Verification         │
         │  (if provided)        │
         └───────┬───────────────┘
                 │
                 ▼
         API: POST /validate-org-code
         ├─ Valid: Show org name ✓
         └─ Invalid: Show error ✗
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Account Creation                       │
│              API: POST /signup                               │
├─────────────────────────────────────────────────────────────┤
│  1. Create Supabase Auth user                                │
│  2. Generate unique userId                                   │
│  3. Create user:{userId} in KV store                         │
│  4. Link to organization (if code provided)                  │
│  5. Set consent records                                      │
│  6. Initialize user profile                                  │
│  7. Return JWT token + user object                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Email Verification   │
         │  (Optional)           │
         └───────┬───────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Role-Based Dashboard Routing                    │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        │            │            │              │
        ▼            ▼            ▼              ▼
   Student      Teacher      Parent       Professional
   Dashboard    Dashboard    Dashboard     Dashboard
```

---

## Role-Based User Journeys

### 1. Student User Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Student Dashboard Landing                       │
│              Component: StudentDashboard                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Welcome, [Student Name]!                                    │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  Your Learning Journey                       │          │
│  ├──────────────────────────────────────────────┤          │
│  │  🧠 Assessments Completed: 2/3               │          │
│  │  ⭐ Points Earned: 250                       │          │
│  │  🔥 Current Streak: 5 days                   │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  Available Assessments:                                      │
│  ┌──────────────────────────────────────┐                  │
│  │  📚 Your Learning Style (Kolb)       │                  │
│  │  ✅ Completed - [View Results]       │                  │
│  └──────────────────────────────────────┘                  │
│                                                              │
│  ┌──────────────────────────────────────┐                  │
│  │  💡 Your Thinking Style (Sternberg)  │                  │
│  │  ⏸️  In Progress (7/30 questions)     │                  │
│  │  [Continue Assessment]               │                  │
│  └──────────────────────────────────────┘                  │
│                                                              │
│  ┌──────────────────────────────────────┐                  │
│  │  🎯 Decision Making (Dual-Process)   │                  │
│  │  ⚪ Not Started                       │                  │
│  │  [Start Assessment]                  │                  │
│  └──────────────────────────────────────┘                  │
│                                                              │
│  Navigation Tabs:                                            │
│  [Assessments] [Results] [Reflections] [Daily Challenge]    │
│  [Profile] [Resources]                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼ (Student clicks "Start Assessment")
                     │
┌─────────────────────────────────────────────────────────────┐
│              Age-Based Assessment Routing                    │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        │            │            │              │
        ▼            ▼            ▼              ▼
   Ages 6-10     Ages 11-14   Ages 15-18     Ages 18+
   Kids          JHS          SHS            Adult
   Assessment    Assessment   Assessment     Assessment
        │            │            │              │
        ▼            ▼            ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│Interactive│  │Card-Based│  │Advanced  │  │Professional│
│Game-Like │  │Scenarios │  │Problem   │  │Career    │
│Questions │  │Questions │  │Solving   │  │Scenarios │
│          │  │          │  │Questions │  │Questions │
│15 Qs     │  │Teen Qs   │  │Academic  │  │Workplace │
│Audio     │  │School    │  │Career    │  │Leadership│
│Narration │  │Context   │  │Focus     │  │Focus     │
│Mascot    │  │Feedback  │  │Guidance  │  │Industry  │
│Stickers  │  │          │  │          │  │Insights  │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │            │            │              │
     └────────────┴────────────┴──────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Assessment Taking Flow                          │
│              Component: AssessmentTaking                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Progress: ████████░░░░░░░░░░░ 7/30 questions                │
│                                                              │
│  Question 7:                                                 │
│  "When solving a problem, I prefer to..."                    │
│                                                              │
│  ┌──────────────────────────────────────┐                  │
│  │ A) Analyze data systematically       │                  │
│  │    (Analytical approach)             │                  │
│  └──────────────────────────────────────┘                  │
│                                                              │
│  ┌──────────────────────────────────────┐                  │
│  │ B) Think of creative solutions       │                  │
│  │    (Creative approach)               │                  │
│  └──────────────────────────────────────┘                  │
│                                                              │
│  ┌──────────────────────────────────────┐                  │
│  │ C) Apply practical experience        │                  │
│  │    (Practical approach)              │                  │
│  └──────────────────────────────────────┘                  │
│                                                              │
│  [Skip] [Previous] [Next]                                    │
│  Auto-saving...                                              │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (Answer selected)
                     ▼
         API: POST /assessment/progress/:type
         (Save progress: every answer + every 30 sec)
                     │
                     ▼
         Question 8... 9... 10... ... 30
                     │
                     ▼ (All questions completed)
┌─────────────────────────────────────────────────────────────┐
│              Calculating Results...                          │
│              (Client-side scoring)                           │
├─────────────────────────────────────────────────────────────┤
│  Analyzing your responses...                                 │
│  ✓ Analytical dimension                                      │
│  ✓ Creative dimension                                        │
│  ✓ Practical dimension                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         API: POST /jhs-thinking/submit
         (or /shs-thinking/submit, /adult-thinking/submit)
         • Create result:{userId}:{type}
         • Update user:{userId} assessmentsCompleted
         • Delete progress:{userId}:{type}
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Assessment Results                              │
│              Component: AssessmentReport                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🎉 Congratulations! You've completed the assessment!        │
│                                                              │
│  Your Cognitive Profile:                                     │
│  ┌──────────────────────────────────────┐                  │
│  │     Analytical: 75/100 ██████▓       │                  │
│  │     Creative:   85/100 ████████▓     │                  │
│  │     Practical:  70/100 █████▓        │                  │
│  └──────────────────────────────────────┘                  │
│                                                              │
│  Dominant Style: Creative Thinker 💡                         │
│  Balance Score: 77/100                                       │
│                                                              │
│  Personalized Insights:                                      │
│  • You excel at generating novel solutions                   │
│  • Consider balancing with analytical approaches             │
│  • Your practical skills are developing well                 │
│                                                              │
│  Ghana Education Recommendations:                            │
│  • Recommended SHS Track: General Arts                       │
│  • Suggested Career Paths: Design, Marketing, Innovation     │
│                                                              │
│  [View Detailed Report] [Add Reflection] [Print PDF]        │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (Student clicks "Add Reflection")
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Reflection Prompt                               │
│              Component: GuidedReflection                     │
├─────────────────────────────────────────────────────────────┤
│  How do you feel about these results?                        │
│  ┌──────────────────────────────────────────────┐          │
│  │ I was surprised to learn that I'm more       │          │
│  │ creative than I thought. This explains       │          │
│  │ why I sometimes struggle with purely         │          │
│  │ analytical tasks...                          │          │
│  │                                              │          │
│  │                                              │          │
│  └──────────────────────────────────────────────┘          │
│  [Save Reflection] [Skip]                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         API: POST /reflection
         Create reflection:{userId}:{timestamp}
                     │
                     ▼
         Return to Student Dashboard
         → Next assessment or View Results tab
```

### 2. Teacher User Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Teacher Dashboard Landing                       │
│              Component: TeacherDashboard                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Welcome, [Teacher Name]!                                    │
│  School: [School Name]                                       │
│  Organization: [Organization Name] (Code: JOTM-ABC123)      │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  Class Overview                              │          │
│  ├──────────────────────────────────────────────┤          │
│  │  👥 Total Students: 42                       │          │
│  │  ✅ Assessments Completed: 35/42 (83%)       │          │
│  │  📊 Average Completion Rate: 2.1 assessments │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  Navigation Tabs:                                            │
│  [Class Overview] [Individual Students] [Resources]         │
│  [Organization] [Profile]                                    │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼ (Teacher on "Class Overview" tab)
┌─────────────────────────────────────────────────────────────┐
│              Class-Wide Analytics                            │
│              Component: TeacherClassOverview                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Learning Styles Distribution (Kolb):                        │
│  ┌──────────────────────────────────────┐                  │
│  │     🔵 Diverging:    12 students     │                  │
│  │     🟢 Assimilating: 10 students     │                  │
│  │     🟡 Converging:    8 students     │                  │
│  │     🔴 Accommodating: 5 students     │                  │
│  │     ⚪ Not tested:     7 students     │                  │
│  │                                      │                  │
│  │  [Pie Chart Visualization]           │                  │
│  └──────────────────────────────────────┘                  │
│                                                              │
│  Thinking Styles Distribution (Sternberg):                   │
│  ┌──────────────────────────────────────┐                  │
│  │  Analytical:  ████████ 15 students   │                  │
│  │  Creative:    ████████████ 18        │                  │
│  │  Practical:   ██████ 9 students      │                  │
│  │                                      │                  │
│  │  [Bar Chart Visualization]           │                  │
│  └──────────────────────────────────────┘                  │
│                                                              │
│  Education Level Distribution:                               │
│  • JHS 1: 14 students  • JHS 2: 16 students                 │
│  • JHS 3: 12 students                                        │
│                                                              │
│  Class-Wide Teaching Insights:                               │
│  • 43% of students are creative learners                     │
│  • Consider incorporating more creative activities           │
│  • Balance analytical rigor with practical application       │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼ (Teacher clicks "Individual Students" tab)
┌─────────────────────────────────────────────────────────────┐
│              Student Roster View                             │
│              Component: TeacherIndividualStudentView         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Your Students (from [School Name]):                         │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │ 👤 Kwame Mensah - JHS 2                      │          │
│  │ Learning: Diverging | Thinking: Creative     │          │
│  │ Assessments: 3/3 ✅                          │          │
│  │ [View Full Profile]                          │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │ 👤 Ama Osei - JHS 2                          │          │
│  │ Learning: Assimilating | Thinking: Analytical│          │
│  │ Assessments: 2/3 ⏸️                          │          │
│  │ [View Full Profile]                          │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  ... (40 more students)                                      │
│                                                              │
│  [Search Students] [Filter by Level] [Export CSV]           │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼ (Teacher clicks "View Full Profile" for Kwame)
┌─────────────────────────────────────────────────────────────┐
│              Student Detail Modal                            │
│              Component: StudentDetailView                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Student: Kwame Mensah                                       │
│  Level: JHS 2 | Age: 13                                      │
│                                                              │
│  Tabs: [Cognitive Profile] [Teaching Strategies] [Progress] │
│                                                              │
│  ┌─ Cognitive Profile Tab ─────────────────────┐           │
│  │                                              │           │
│  │  Complete Cognitive Profile:                 │           │
│  │  • Learning Style: Diverging                 │           │
│  │    (Prefers feeling + watching)              │           │
│  │  • Thinking Style: Creative (85/100)         │           │
│  │  • Decision Style: Intuitive                 │           │
│  │                                              │           │
│  │  [Radar Chart Visualization]                 │           │
│  │                                              │           │
│  │  Quick Insights:                             │           │
│  │  • Excels in group discussions               │           │
│  │  • Prefers open-ended questions              │           │
│  │  • Responds well to storytelling             │           │
│  │  • May need structure for analytical tasks   │           │
│  │                                              │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  ┌─ Teaching Strategies Tab ───────────────────┐           │
│  │                                              │           │
│  │  Top 3 Strategies for Kwame:                 │           │
│  │                                              │           │
│  │  1. Use Group Work & Brainstorming           │           │
│  │     Kwame thrives when collaborating         │           │
│  │     with peers and generating ideas          │           │
│  │                                              │           │
│  │  2. Connect Lessons to Real-Life Stories     │           │
│  │     Frame concepts through narratives        │           │
│  │     and personal experiences                 │           │
│  │                                              │           │
│  │  3. Provide Creative Expression Options      │           │
│  │     Allow alternative assessment formats     │           │
│  │     (presentations, projects, art)           │           │
│  │                                              │           │
│  │  Areas for Additional Support:               │           │
│  │  • Analytical problem-solving structure      │           │
│  │  • Time management for creative projects     │           │
│  │                                              │           │
│  │  [View Full Strategies] [Print Guide]       │           │
│  │                                              │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  ┌─ Progress & Notes Tab ──────────────────────┐           │
│  │                                              │           │
│  │  Assessment History:                         │           │
│  │  ✅ Learning Style - Completed Mar 10, 2026  │           │
│  │  ✅ Thinking Style - Completed Mar 15, 2026  │           │
│  │  ✅ Decision Making - Completed Mar 20, 2026 │           │
│  │                                              │           │
│  │  Teacher Notes:                              │           │
│  │  ┌────────────────────────────────────────┐ │           │
│  │  │ Mar 22: Great participation in group  │ │           │
│  │  │ discussion about creative problem     │ │           │
│  │  │ solving. Consider pairing with Ama    │ │           │
│  │  │ for balance.                          │ │           │
│  │  │                                        │ │           │
│  │  │ [Add Note]                             │ │           │
│  │  └────────────────────────────────────────┘ │           │
│  │                                              │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  [Close] [Print Full Profile]                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘

TEACHER LINKING MECHANISM:
• Automatic by school name
• Students who register with same school name appear automatically
• No manual email linking required
• School name = trusted institution boundary
```

### 3. Parent User Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Parent Dashboard Landing                        │
│              Component: ParentDashboard                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Welcome, [Parent Name]!                                     │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  Your Children                               │          │
│  ├──────────────────────────────────────────────┤          │
│  │  👶 Linked Children: 2                       │          │
│  │  📊 Total Assessments: 5                     │          │
│  │  📝 Pending Access Requests: 0               │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  Linked Children:                                            │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │ 👧 Ama Osei (Age 8)                          │          │
│  │ Access: ✅ Approved (Auto - under 13)        │          │
│  │ Assessments: 1/1 Kids Assessment             │          │
│  │ [View Profile] [View Assessment Results]     │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │ 👦 Kofi Osei (Age 15)                        │          │
│  │ Access: ⏳ Pending Approval                  │          │
│  │ Request sent: Mar 20, 2026                   │          │
│  │ [View Request Status]                        │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  Link Another Child:                                         │
│  ┌──────────────────────────────────────────────┐          │
│  │ Enter child's email:                         │          │
│  │ [________________________] [Send Request]    │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  Navigation Tabs:                                            │
│  [Children] [Observation Assessment] [Resources] [Profile]  │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼ (Parent enters child email & clicks "Send Request")
┌─────────────────────────────────────────────────────────────┐
│              Link Child Process                              │
│              API: POST /parent/link-child                    │
├─────────────────────────────────────────────────────────────┤
│  1. Backend finds child by email                             │
│  2. Check child's age:                                       │
│     • Age < 13: Auto-approve (COPPA compliance)              │
│     • Age 13-17: Create pending consent request              │
│     • Age 18+: Require explicit consent                      │
│  3. Create consent:{childId}:{parentId} with status          │
│  4. Update user:{parentId} linkedChildren array              │
│  5. Notify child (if age 13+)                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Child's Perspective  │
         │  (if age 13+)         │
         └───────┬───────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Child Receives Notification                     │
│              Component: ParentAccessRequests                 │
├─────────────────────────────────────────────────────────────┤
│  (In Student Dashboard)                                      │
│                                                              │
│  🔔 New Access Request                                       │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  Your parent wants to view your profile      │          │
│  │                                              │          │
│  │  Parent: [Parent Name]                       │          │
│  │  Email: parent@example.com                   │          │
│  │  Requested: Mar 20, 2026                     │          │
│  │                                              │          │
│  │  They will be able to see:                   │          │
│  │  • Your assessment results                   │          │
│  │  • Your cognitive profile                    │          │
│  │  • Your progress and reflections             │          │
│  │                                              │          │
│  │  [Approve] [Deny]                            │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (Child clicks "Approve")
                     ▼
         API: Update consent:{childId}:{parentId}
         • Set status: "approved"
         • Set approvedAt timestamp
         • Notify parent
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Parent Can Now View Child Profile               │
│              Component: ParentChildCognitiveReport           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Kofi Osei's Cognitive Profile                               │
│  Age: 15 | Level: SHS 1                                      │
│                                                              │
│  Assessment Results:                                         │
│  • Learning Style: Assimilating                              │
│  • Thinking Style: Analytical (78/100)                       │
│  • Decision Making: Rational                                 │
│                                                              │
│  [Full Cognitive Profile Visualization]                      │
│                                                              │
│  How to Support Kofi at Home:                                │
│  ┌──────────────────────────────────────────────┐          │
│  │ 1. Provide quiet study space                 │          │
│  │    Kofi needs focused time for analysis      │          │
│  │                                              │          │
│  │ 2. Encourage logical reasoning discussions   │          │
│  │    Ask "why" and "how" questions             │          │
│  │                                              │          │
│  │ 3. Support systematic planning               │          │
│  │    Help create structured study schedules    │          │
│  │                                              │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  Ghana Education Guidance:                                   │
│  • Recommended for Science/Math track in SHS                 │
│  • Consider careers: Engineering, Research, Analysis         │
│                                                              │
│  [Print Report] [Email Report] [Revoke Access]              │
│                                                              │
└─────────────────────────────────────────────────────────────┘

PARENT LINKING MECHANISM:
• Parent enters child's email address
• Age-based consent logic:
  - Under 13: Auto-approve (parent authority per COPPA)
  - 13-17: Requires child approval
  - 18+: Requires explicit consent
• Child can revoke access anytime
• Parent can link multiple children
```

### 4. Professional/Organization User Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Professional Dashboard Landing                  │
│              Component: ProfessionalDashboard                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Welcome, [Professional Name]!                               │
│  Organization: [Organization Name]                           │
│  Position: [Position]                                        │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  Professional Overview                       │          │
│  ├──────────────────────────────────────────────┤          │
│  │  🎯 Personal Assessments: 2/3                │          │
│  │  👥 Organization Members: 15                 │          │
│  │  📊 Team Assessments: 12/15                  │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  Your Professional Assessments:                              │
│  ┌──────────────────────────────────────────────┐          │
│  │ 💼 Professional Cognitive Assessment          │          │
│  │ ✅ Completed - [View Results]                │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │ 👨‍🏫 Teaching Style Assessment                 │          │
│  │ ⚪ Not Started - [Start Assessment]          │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  Team Dashboard:                                             │
│  [Organization Analytics] [Team Members] [Hiring Insights]  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

(Similar assessment flow as Student, but with professional context)
(Results show workplace applications, team fit, leadership style)
```

---

## Password Reset & Deep Link Flow

```
┌─────────────────────────────────────────────────────────────┐
│              User Forgot Password                            │
│              Entry: Login Page → "Forgot Password?"          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Forgot Password Form                            │
│              Component: ForgotPasswordForm                   │
│              View: forgot-password                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Reset Your Password                                         │
│                                                              │
│  Enter your email address and we'll send you a              │
│  link to reset your password.                                │
│                                                              │
│  Email Address:                                              │
│  [________________________________]                          │
│                                                              │
│  [Send Reset Link] [Back to Login]                          │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (User enters email and clicks "Send Reset Link")
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Process                                 │
│              API: POST /auth/reset-password                  │
├─────────────────────────────────────────────────────────────┤
│  1. Validate email exists in system                          │
│  2. Generate secure reset token (JWT)                        │
│  3. Create password reset record with:                       │
│     • userId                                                 │
│     • resetToken (hashed)                                    │
│     • expiresAt (24 hours from now)                          │
│  4. Generate deep link:                                      │
│     https://jotminds.com/reset-password?token={token}        │
│  5. Send email with reset link                               │
│  6. Return success message                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Email Sent Confirmation                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Check Your Email                                         │
│                                                              │
│  We've sent a password reset link to:                        │
│  user@example.com                                            │
│                                                              │
│  The link will expire in 24 hours.                           │
│                                                              │
│  Didn't receive the email?                                   │
│  [Resend Reset Link]                                         │
│                                                              │
│  [Back to Login]                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  User checks email    │
         │  and clicks link      │
         └───────┬───────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Deep Link Redirect                              │
│              URL: /reset-password?token=xyz123               │
├─────────────────────────────────────────────────────────────┤
│  1. App.tsx detects reset-password view                      │
│  2. Extracts token from URL params                           │
│  3. Validates token with backend                             │
│  4. If valid: Show reset form                                │
│  5. If invalid/expired: Show error + resend option           │
└────────────────────┬────────────────────────────────────────┘
                     │ (Token valid)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Reset Password Form                             │
│              Component: ResetPasswordForm                    │
│              View: reset-password                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Create New Password                                         │
│                                                              │
│  New Password:                                               │
│  [________________________________]                          │
│  ▓▓▓▓▓░░░░░ Strength: Medium                                 │
│                                                              │
│  Confirm Password:                                           │
│  [________________________________]                          │
│                                                              │
│  Password Requirements:                                      │
│  ✅ At least 8 characters                                    │
│  ✅ Contains uppercase letter                                │
│  ⚪ Contains number                                          │
│  ⚪ Contains special character                               │
│                                                              │
│  [Reset Password]                                            │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (User enters matching passwords)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Password Update                         │
│              API: POST /auth/update-password                 │
├─────────────────────────────────────────────────────────────┤
│  1. Validate reset token                                     │
│  2. Check token not expired                                  │
│  3. Validate password strength                               │
│  4. Hash new password (bcrypt)                               │
│  5. Update user password in Supabase Auth                    │
│  6. Invalidate reset token                                   │
│  7. Clear all existing sessions (security)                   │
│  8. Send confirmation email                                  │
│  9. Return success                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Success Confirmation                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Password Reset Successful!                               │
│                                                              │
│  Your password has been updated.                             │
│  You can now log in with your new password.                  │
│                                                              │
│  Redirecting to login in 3 seconds...                        │
│                                                              │
│  [Login Now]                                                 │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         Redirect to Login Page (view: 'auth')
```

**Deep Link Structure:**
- URL Format: `https://jotminds.com/reset-password?token={JWT_TOKEN}`
- Token expires in 24 hours
- Token is single-use only
- App.tsx routes to ResetPasswordForm based on view state

---

## OAuth Consent Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Landing Page                                    │
│              Component: LandingPage                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼ (User clicks "Get Started" or "Sign Up")
┌─────────────────────────────────────────────────────────────┐
│              OAuth Consent Screen                            │
│              Route: /oauth/consent                           │
│              Component: UserConsentFlow                      │
│              View: consent                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────┐              │
│  │  🧠 JotMinds                             │              │
│  │                                          │              │
│  │  Welcome to JotMinds!                    │              │
│  │  Before you begin, please review and     │              │
│  │  accept our terms.                       │              │
│  └──────────────────────────────────────────┘              │
│                                                              │
│  User Agreement & Privacy                                    │
│                                                              │
│  ┌────────────────────────────────────────────────┐        │
│  │ ☑️ I agree to the Terms of Service            │        │
│  │   [View Full Terms of Service →]              │        │
│  │                                                │        │
│  │ ☑️ I agree to the Privacy Policy              │        │
│  │   [View Full Privacy Policy →]                │        │
│  │                                                │        │
│  │ ☑️ I confirm that I am at least 6 years old   │        │
│  │                                                │        │
│  └────────────────────────────────────────────────┘        │
│                                                              │
│  What We'll Do With Your Data:                               │
│  • 📊 Store your assessment results securely                 │
│  • 🔒 Never share with third parties                         │
│  • 👁️ Parents/teachers can view (with permission)            │
│  • 🗑️ You can delete your account anytime                    │
│                                                              │
│  Ghana Data Protection Compliance:                           │
│  This service complies with Ghana Data Protection Act        │
│  and international privacy standards.                        │
│                                                              │
│  [Continue] [Cancel]                                         │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (All checkboxes selected + Continue clicked)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Consent Record Creation                         │
│              (Client-side, stored in localStorage)           │
├─────────────────────────────────────────────────────────────┤
│  localStorage.setItem('jotminds_consent', {                  │
│    termsAccepted: true,                                      │
│    privacyAccepted: true,                                    │
│    ageConfirmed: true,                                       │
│    timestamp: '2026-04-06T10:30:00Z',                        │
│    ipAddress: '192.168.1.1',                                 │
│    version: 'v1.0'                                           │
│  });                                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         Redirect to Age Verification
         (Then continues to Registration Flow)
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              On Account Creation                             │
│              API: POST /signup                               │
├─────────────────────────────────────────────────────────────┤
│  Backend stores consent record:                              │
│                                                              │
│  • Reads consent data from request                           │
│  • Creates consent_records entry in database                 │
│  • Associates with new user account                          │
│  • Timestamps for legal compliance                           │
│  • Stores policy version numbers                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘

**Consent Bypass Check:**
- On every page load, App.tsx checks for 'jotminds_consent' in localStorage
- If not present and user not logged in → Redirect to /oauth/consent
- If present → Allow access to registration/login
- Consent is permanent unless user clears browser data
```

**Key Features:**
- ✅ OAuth-style consent flow (similar to Google/Facebook login)
- ✅ Checkbox acceptance required
- ✅ Links to full policy documents
- ✅ Age confirmation
- ✅ Ghana GDPR compliance notice
- ✅ Stored in localStorage + backend database
- ✅ Version tracking for policy updates

---

## Organization Invitation Code Flow

```
┌──────────────────────────────────────���──────────────────────┐
│              Admin Creates Organization                      │
│              Component: OrganizationManager                  │
│              Access: Admin Panel Only                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Admin Panel - Organizations Tab                 │
│              Component: AdminPanel → OrganizationManager     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Organization Management                                     │
│                                                              │
│  Create New Organization:                                    │
│  ┌──────────────────────────────────────────────┐          │
│  │ Organization Name:                           │          │
│  │ [Accra Secondary Schools District]           │          │
│  │                                              │          │
│  │ Organization Type:                           │          │
│  │ ○ School  ○ Company  ○ NGO  ○ Government     │          │
│  │                                              │          │
│  │ Industry Sector (if company):                │          │
│  │ [Select...]                                  │          │
│  │                                              │          │
│  │ [Create Organization]                        │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (Admin clicks "Create Organization")
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Organization Creation                   │
│              API: POST /admin/create-organization            │
├─────────────────────────────────────────────────────────────┤
│  1. Verify admin authentication                              │
│  2. Generate unique organization code:                       │
│     Format: JOTM-{6 random alphanumeric chars}              │
│     Example: JOTM-A4X9K2                                     │
│  3. Check code uniqueness (retry if collision)               │
│  4. Create organization:{code} in KV store:                  │
│     {                                                        │
│       code: "JOTM-A4X9K2",                                   │
│       name: "Accra Secondary Schools District",             │
│       type: "School",                                        │
│       createdAt: "2026-04-06T10:30:00Z",                    │
│       createdBy: "Alex.Attachey@gmail.com"                  │
│     }                                                        │
│  5. Return organization object                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Organization Created Success                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Organization Created Successfully!                       │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │ Organization: Accra Secondary Schools        │          │
│  │                                              │          │
│  │ Invitation Code: JOTM-A4X9K2                 │          │
│  │ [Copy to Clipboard] 📋                       │          │
│  │                                              │          │
│  │ Share this code with teachers and            │          │
│  │ professionals to link their accounts.        │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  Existing Organizations:                                     │
│  ┌──────────────────────────────────────────────┐          │
│  │ 🏫 Accra Secondary Schools                   │          │
│  │    Code: JOTM-A4X9K2                         │          │
│  │    Created: Apr 6, 2026                      │          │
│  │    [Copy Code] [Delete]                      │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼ (Admin shares code with teacher/professional)
                     │
┌─────────────────────────────────────────────────────────────┐
│              Teacher/Professional Registration               │
│              Component: AuthForm                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Registration Form with Org Code                 │
│              (Teacher or Professional selected)              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Create Your Account - Teacher                               │
│                                                              │
│  Full Name: [____________________________]                   │
│  Email:     [____________________________]                   │
│  Password:  [____________________________]                   │
│  Phone:     [____________________________]                   │
│  School:    [____________________________]                   │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │ Organization Invitation Code (REQUIRED):     │          │
│  │ [JOTM-A4X9K2______] [Verify Code]            │          │
│  │                                              │          │
│  │ Don't have a code? [Learn More]              │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (Teacher enters code & clicks "Verify Code")
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Organization Code Validation                    │
│              API: POST /validate-org-code                    │
├─────────────────────────────────────────────────────────────┤
│  Request:                                                    │
│  { code: "JOTM-A4X9K2" }                                     │
│                                                              │
│  Backend Process:                                            │
│  1. Normalize code (uppercase, trim)                         │
│  2. Read organization:{code} from KV store                   │
│  3. If exists:                                               │
│     Return {                                                 │
│       valid: true,                                           │
│       organizationName: "Accra Secondary Schools",          │
│       organizationType: "School"                            │
│     }                                                        │
│  4. If not exists:                                           │
│     Return {                                                 │
│       valid: false,                                          │
│       error: "Invalid organization code"                    │
│     }                                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼ (Valid)                 ▼ (Invalid)
┌──────────────────┐      ┌──────────────────┐
│  Show Success    │      │  Show Error      │
│  ✅ Verified     │      │  ❌ Invalid Code │
│  Organization:   │      │  Please check    │
│  Accra Secondary │      │  and try again   │
│  Schools         │      └──────────────────┘
│                  │
│  [Field disabled]│
└────────┬─────────┘
         │ (Teacher completes registration)
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Account Creation with Organization              │
│              API: POST /signup                               │
├─────────────────────────────────────────────────────────────┤
│  1. Create Supabase Auth user                                │
│  2. Validate organization code again (security)              │
│  3. Create user:{userId} with:                               │
│     {                                                        │
│       id: "user-123",                                        │
│       email: "teacher@school.edu.gh",                       │
│       role: "teacher",                                       │
│       school: "Accra Secondary School",                     │
│       organizationCode: "JOTM-A4X9K2",                      │
│       organizationName: "Accra Secondary Schools",          │
│       organizationType: "School",                           │
│       ...                                                    │
│     }                                                        │
│  4. User is now linked to organization                       │
│  5. Return success + JWT token                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Teacher Dashboard                               │
│              (Now linked to organization)                    │
├─────────────────────────────────────────────────────────────┤
│  Header shows:                                               │
│  Organization: Accra Secondary Schools (JOTM-A4X9K2)        │
│                                                              │
│  Can see other teachers from same organization               │
│  Shares organization-wide analytics                          │
└─────────────────────────────────────────────────────────────┘
```

**Validation Error States:**

| Scenario | Error Message | Action |
|----------|---------------|--------|
| Empty code | "Please enter an organization code" | Show inline error |
| Invalid code | "Invalid organization code" | Allow retry |
| Code doesn't exist | "Invalid organization code" | Check with admin |
| Network error | "Failed to validate code. Try again." | Retry button |
| 403 Forbidden | "Supabase connection error. Please reconnect." | Admin action needed |

**Organization Code Features:**
- ✅ Required for teachers
- ✅ Optional for professionals and students
- ✅ Real-time validation with visual feedback
- ✅ Auto-uppercase formatting
- ✅ Disabled field after successful verification
- ✅ Copy to clipboard for easy sharing
- ✅ Admin-only creation and management

---

## Mobile App User Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Mobile App Entry                                │
│              Route: /mobile                                  │
│              Uses: React Router (separate from main)         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Mobile Landing / Onboarding                     │
│              Component: MobileOnboarding                     │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────┐                         │
│  │        📱                      │                         │
│  │                                │                         │
│  │    Welcome to JotMinds         │                         │
│  │    Mobile                      │                         │
│  │                                │                         │
│  │    Discover your cognitive     │                         │
│  │    strengths on the go         │                         │
│  │                                │                         │
│  │    [Get Started] [Sign In]     │                         │
│  │                                │                         │
│  │    ⚫⚪⚪ (Swipe indicators)     │                         │
│  └────────────────────────────────┘                         │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (User swipes through onboarding or clicks "Get Started")
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Mobile Authentication                           │
│              Component: MobileAuth                           │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────┐                         │
│  │  Sign In                       │                         │
│  │                                │                         │
│  │  Email                         │                         │
│  │  [________________________]    │                         │
│  │                                │                         │
│  │  Password                      │                         │
│  │  [________________________]    │                         │
│  │                                │                         │
│  │  [Sign In]                     │                         │
│  │                                │                         │
│  │  Forgot password? · Sign up    │                         │
│  └────────────────────────────────┘                         │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (User signs in successfully)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Mobile Home Dashboard                           │
│              Component: MobileHome                           │
│              Route: /mobile/home                             │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────┐                         │
│  │  JotMinds                      │ [🔔] [⚙️]              │
│  ├────────────────────────────────┤                         │
│  │                                │                         │
│  │  Hi, John! 👋                  │                         │
│  │                                │                         │
│  │  Your Progress                 │                         │
│  │  ▓▓▓▓▓▓░░░░ 60%                │                         │
│  │                                │                         │
│  │  Recent Activity               │                         │
│  │  ┌──────────────────────────┐ │                         │
│  │  │ ✅ Completed Thinking    │ │                         │
│  │  │    Style Assessment      │ │                         │
│  │  │    2 hours ago           │ │                         │
│  │  └──────────────────────────┘ │                         │
│  │                                │                         │
│  │  Quick Actions                 │                         │
│  │  [Start Assessment] [Results]  │                         │
│  │                                │                         │
│  ├────────────────────────────────┤                         │
│  │  🏠  📝  📊  👤                 │  Bottom Navigation      │
│  │ Home Assess Results Profile    │                         │
│  └────────────────────────────────┘                         │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (User taps "Assessments" in bottom nav)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Mobile Assessments List                         │
│              Component: MobileAssessments                    │
│              Route: /mobile/assessments                      │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────┐                         │
│  │  Assessments         [Filter] │                          │
│  ├────────────────────────────────┤                         │
│  │                                │                         │
│  │  ┌──────────────────────────┐ │                         │
│  │  │ 💡 Thinking Style        │ │                         │
│  │  │ Discover how you think   │ │                         │
│  │  │ ⏱️ 20 min · Not started  │ │                         │
│  │  │ [Start]                  │ │                         │
│  │  └──────────────────────────┘ │                         │
│  │                                │                         │
│  │  ┌──────────────────────────┐ │                         │
│  │  │ 📚 Learning Style        │ │                         │
│  │  │ How you learn best       │ │                         │
│  │  │ ✅ Completed             │ │                         │
│  │  │ [View Results]           │ │                         │
│  │  └──────────────────────────┘ │                         │
│  │                                │                         │
│  │  ┌──────────────────────────┐ │                         │
│  │  │ 🎯 Decision Making       │ │                         │
│  │  │ Your decision style      │ │                         │
│  │  │ ⏸️ In progress (5/30)    │ │                         │
│  │  │ [Continue]               │ │                         │
│  │  └──────────────────────────┘ │                         │
│  │                                │                         │
│  ├────────────────────────────────┤                         │
│  │  🏠  📝  📊  👤                 │                         │
│  └────────────────────────────────┘                         │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (User taps "Start" on Thinking Style)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Mobile Assessment Taking                        │
│              Component: MobileAssessmentTake                 │
│              Route: /mobile/assessment/:type                 │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────┐                         │
│  │  [←] Thinking Style    [⋮]     │                         │
│  ├────────────────────────────────┤                         │
│  │                                │                         │
│  │  Question 1 of 30              │                         │
│  │  ▓░░░░░░░░░░░░░░░░░░░ 3%       │                         │
│  │                                │                         │
│  │  When solving a problem,       │                         │
│  │  I prefer to...                │                         │
│  │                                │                         │
│  │  ┌──────────────────────────┐ │  ← Swipeable cards      │
│  │  │                          │ │                         │
│  │  │  A) Analyze data         │ │                         │
│  │  │     systematically       │ │                         │
│  │  │                          │ │                         │
│  │  │     [Tap to select]      │ │                         │
│  │  │                          │ │                         │
│  │  └──────────────────────────┘ │                         │
│  │  ┌──────────────────────────┐ │                         │
│  │  │  B) Think creatively     │ │                         │
│  │  └──────────────────────────┘ │                         │
│  │  ┌──────────────────────────┐ │                         │
│  │  │  C) Use practical means  │ │                         │
│  │  └──────────────────────────┘ │                         │
│  │                                │                         │
│  │         [Skip] [Next]          │                         │
│  │                                │                         │
│  ├────────────────────────────────┤                         │
│  │  Auto-saving... ✓              │                         │
│  └────────────────────────────────┘                         │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (All questions completed)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Mobile Results View                             │
│              Component: MobileResults                        │
│              Route: /mobile/results/:type                    │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────┐                         │
│  │  [←] Results           [Share] │                         │
│  ├────────────────────────────────┤                         │
│  │                                │                         │
│  │  🎉 Assessment Complete!       │                         │
│  │                                │                         │
│  │  Your Thinking Style:          │                         │
│  │  Creative Thinker 💡           │                         │
│  │                                │                         │
│  │  [Circular Chart]              │  ← Touch-friendly      │
│  │    Analytical:  75             │     visualizations     │
│  │    Creative:    85             │                         │
│  │    Practical:   70             │                         │
│  │                                │                         │
│  │  ───────────────────────       │  ← Swipe to scroll      │
│  │                                │                         │
│  │  Key Insights:                 │                         │
│  │  • You excel at innovation     │                         │
│  │  • Strong creative thinking    │                         │
│  │  • Balance with analysis       │                         │
│  │                                │                         │
│  │  [View Full Report]            │                         │
│  │  [Share Results]               │                         │
│  │  [Download PDF]                │                         │
│  │                                │                         │
│  ├────────────────────────────────┤                         │
│  │  🏠  📝  📊  👤                 │                         │
│  └────────────────────────────────┘                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Mobile App Features:**
- ✅ Bottom navigation (Home, Assessments, Results, Profile)
- ✅ Touch-optimized UI (min 44px tap targets)
- ✅ Swipe gestures for cards and navigation
- ✅ Streamlined assessment flow
- ✅ Mobile-first responsive design
- ✅ Offline capability (planned)
- ✅ Share results via native share sheet
- ✅ React Router-based routing (separate from main app)

---

## Kids Mode User Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Student Login (Age 6-10)                        │
│              Component: KidsLogin                            │
└────────────────────┬────────────────────────────────────────┘
                     │ (Age check: 6-10 years)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Kids Mode Activation                            │
│              Component: KidsModeWrapper                      │
├─────────────────────────────────────────────────────────────┤
│  Automatically activates based on:                           │
│  • User role: "student"                                      │
│  • Age: 6-10 years (from dateOfBirth)                        │
│  • Special UI components loaded                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Kids Welcome Screen                             │
│              Component: KidsDashboard + Mascot               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│     ╭───────────────────────────╮                           │
│     │   🤖                      │  Jots the Robot            │
│     │  /  \                     │  Mascot                    │
│     │ |    |                    │                            │
│     │  \__/                     │                            │
│     ╰───────────────────────────╯                           │
│                                                              │
│  🔊 "Hi [Child Name]! I'm Jots! Ready to play and learn?"   │
│     (Audio narration auto-plays)                             │
│                                                              │
│  ┌──────────────────────────────────────┐  Large buttons    │
│  │  🎮 PLAY GAMES                       │  (min 60px)       │
│  │     Start fun brain games!           │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │  🧠 TAKE QUIZ                        │                   │
│  │     Answer fun questions!            │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │  ⭐ STICKER BOOK                     │                   │
│  │     See your sticker collection!     │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  🔒 Parent Settings (PIN required)                          │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (Child taps "TAKE QUIZ")
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Kids Assessment Intro                           │
│              Component: KidsAssessment                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ╭───────────╮                                               │
│  │   🤖      │  "Let's play a quiz game! I'll ask you       │
│  │  /  \     │   some fun questions. Just pick the          │
│  ╰───────────╯   answer that feels right to you!"           │
│                                                              │
│  🔊 (Audio narration)                                        │
│                                                              │
│  15 questions · About 10 minutes                             │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │  🚀 LET'S START!                     │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Kids Assessment Questions                       │
│              Component: KidsAssessment                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Progress: ⭐⭐⭐★★★★★★★★★★★★ (3/15)                          │
│                                                              │
│  ╭───────────╮                                               │
│  │   🤖      │  "What do you like to do when you            │
│  │  /  \     │   have free time?"                           │
│  ╰───────────╯                                               │
│  🔊 (Click to hear again)                                    │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │  🎨                                  │  Option A          │
│  │  Draw or make things                 │  (Large card)     │
│  │                                      │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │  📚                                  │  Option B          │
│  │  Read books or solve puzzles         │  (Large card)     │
│  │                                      │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │  ⚽                                  │  Option C          │
│  │  Play outside or build things        │  (Large card)     │
│  │                                      │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  [⏭️ Skip]                                                   │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (Child taps an option)
                     ▼
         🎉 Confetti animation!
         🔊 "Great choice!" (Audio feedback)
         ✅ Checkmark appears
         Auto-advances to next question
                     │
                     ▼
         Questions 4, 5, 6... ... 15
         • Audio narration for each
         • Visual feedback on selection
         • No repeating questions
         • Auto-save progress
                     │
                     ▼ (All 15 questions complete)
┌─────────────────────────────────────────────────────────────┐
│              Kids Results Celebration                        │
│              Component: KidsResults + Confetti               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│          🎉 🎊 🎉 🎊 🎉 🎊                                   │
│       (Confetti animation fills screen)                      │
│                                                              │
│  ╭───────────╮                                               │
│  │   🤖      │  "WOW! You did AMAZING! You finished          │
│  │  /  \     │   all the questions!"                        │
│  ╰───────────╯                                               │
│  🔊 (Enthusiastic audio)                                     │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │  ⭐ YOU EARNED A STICKER! ⭐          │                   │
│  │                                      │                   │
│  │         [🦁 Lion Sticker]            │  Animated          │
│  │                                      │                   │
│  │   "Brave Thinker"                    │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │  🎁 SEE YOUR RESULTS                 │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Kids Cognitive Profile                          │
│              Component: KidsCognitiveProfile                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ╭───────────╮                                               │
│  │   🤖      │  "Here's what I learned about how            │
│  │  /  \     │   your amazing brain works!"                 │
│  ╰───────────╯                                               │
│                                                              │
│  Your Thinking Style:                                        │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │  🎨 You're a CREATIVE thinker!       │  Simple language  │
│  │                                      │  Kid-friendly     │
│  │  You love:                           │  icons            │
│  │  • Making new things 🎨              │                   │
│  │  • Using your imagination 💭         │                   │
│  │  • Thinking of fun ideas 💡          │                   │
│  │                                      │                   │
│  │  [Colorful bar chart]                │  Visual results   │
│  │   Creative:    ████████████ 85       │                   │
│  │   Thinking:    ████████ 75           │                   │
│  │   Doing:       ███████ 70            │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │  🎮 PLAY MORE GAMES                  │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │  ⭐ GO TO STICKER BOOK               │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ (Child taps "PLAY MORE GAMES")
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Kids Games Grid                                 │
│              Component: KidsGamesGrid                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ╭───────────╮                                               │
│  │   🤖      │  "Choose a game to play!"                    │
│  ╰───────────╯                                               │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  🃏             │  │  🧩             │                  │
│  │  Memory Match   │  │  Pattern Puzzle │                  │
│  │  Find pairs!    │  │  Complete it!   │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  😊             │  │  ⚡             │                  │
│  │  Emoji Feelings │  │  Speed Sort     │                  │
│  │  Match emotions!│  │  Sort quickly!  │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                              │
│  ┌─────────────────┐                                         │
│  │  📖             │                                         │
│  │  Story Builder  │                                         │
│  │  Make a story!  │                                         │
│  └─────────────────┘                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Kids Mode Design Principles:**
- ✅ Large touch targets (minimum 60px)
- ✅ Bright, contrasting colors
- ✅ Simple, clear language
- ✅ Audio narration for all text
- ✅ Instant visual feedback
- ✅ Celebration moments (confetti, sounds)
- ✅ No text-heavy screens
- ✅ Progress visualization with stars/icons
- ✅ Parent PIN gate for settings
- ✅ No repeating questions
- ✅ Reward system (stickers, badges)
- ✅ Age-appropriate content (6-10 years)

---

## Cross-Platform Navigation

### Main Platform (State-Based)

```
Current View State Management in App.tsx:

views = [
  'landing',        // Landing page
  'consent',        // OAuth consent
  'privacy-policy', // Privacy policy
  'terms-of-use',   // Terms of service
  'contact',        // Contact page
  'auth',           // Login/signup
  'forgot-password', // Password recovery
  'reset-password', // Password reset (deep link)
  'organization',   // Supervisor portal
  'dashboard',      // Main dashboard (role-based)
  'assessment',     // Take assessment
  'summary',        // Assessment results
  'profile',        // User profile
  'admin'           // Admin panel
]

Navigation Method:
• useState('landing') for view management
• setView('auth') to change views
• No URL routing
• State persists in App.tsx
```

### Mobile App (React Router)

```
React Router Configuration:

routes = [
  { path: '/mobile', element: <MobileApp /> },
  { path: '/mobile/onboarding', element: <MobileOnboarding /> },
  { path: '/mobile/auth', element: <MobileAuth /> },
  { path: '/mobile/home', element: <MobileHome /> },
  { path: '/mobile/assessments', element: <MobileAssessments /> },
  { path: '/mobile/assessment/:type', element: <MobileAssessmentTake /> },
  { path: '/mobile/results', element: <MobileResults /> },
  { path: '/mobile/results/:type', element: <MobileResultsDetail /> },
  { path: '/mobile/profile', element: <MobileProfile /> },
]

Navigation Method:
• React Router <Link> and navigate()
• URL-based routing
• Browser back/forward works
• Shareable URLs
• Deep linking support
```

### Transition Between Platforms

```
Main → Mobile:
• User clicks "Open Mobile App" link
• Redirect to /mobile route
• React Router takes over
• Mobile-first UI loads

Mobile → Main:
• User clicks "Desktop Version" link
• Redirect to / (root)
• State-based routing takes over
• Full desktop UI loads

Shared Session:
• Both use same Supabase Auth
• JWT token shared via localStorage
• User data synced in real-time
• Seamless cross-platform experience
```

---

## Error States & Recovery

### Authentication Errors

| Error | Cause | Recovery |
|-------|-------|----------|
| Invalid credentials | Wrong email/password | "Try again" with forgot password link |
| Email not verified | Unverified email | Resend verification email button |
| Account locked | Too many failed attempts | Wait 15 minutes or contact support |
| Session expired | JWT token expired | Auto-redirect to login, preserve intended action |

### Assessment Errors

| Error | Cause | Recovery |
|-------|-------|----------|
| Progress not saved | Network failure | Auto-retry, local storage backup |
| Submission failed | Server error | Save progress, retry later |
| Questions not loading | API failure | Cached questions, reload button |

### Organization Code Errors

| Error | Cause | Recovery |
|-------|-------|----------|
| 403 Forbidden | Supabase not connected | Admin reconnects Supabase |
| Invalid code | Wrong/expired code | Clear error, allow retry |
| Code not found | Doesn't exist | Check with admin, help link |

### Network Errors

| Error | Cause | Recovery |
|-------|-------|----------|
| Connection timeout | Slow/no internet | Retry button, offline mode (mobile) |
| 500 Server error | Backend crash | User-friendly error, auto-retry |
| 429 Rate limit | Too many requests | Wait message with countdown |

---

## Summary

JotMinds features a **sophisticated multi-platform user flow system** with:

✅ **6 User Roles** (Student, Teacher, Parent, Professional, Supervisor, Admin)  
✅ **Age-Based Experiences** (Kids 6-10, JHS 11-14, SHS 15-18, Adult 18+)  
✅ **OAuth-Style Consent Flow** (/oauth/consent)  
✅ **Password Reset with Deep Links** (Email → reset-password?token=xyz)  
✅ **Organization Invitation Codes** (JOTM-XXXXXX format, admin-managed)  
✅ **Mobile App MVP** (React Router-based, touch-optimized)  
✅ **Kids Mode** (Audio narration, mascot, games, stickers)  
✅ **Dual Routing Systems** (State-based for main, React Router for mobile)  
✅ **12 Key Storage Patterns** (Single-table KV store architecture)  
✅ **Comprehensive Error Handling** (Recovery flows for all scenarios)

The platform seamlessly handles authentication, consent, assessment taking, results viewing, and cross-role collaboration with age-appropriate interfaces and robust data persistence.

**Current Status:** Fully implemented, awaiting Supabase reconnection to resolve 403 deployment error (authentication/permissions issue, not code issue).
