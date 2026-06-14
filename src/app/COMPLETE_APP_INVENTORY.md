# JotMinds - Complete App Inventory
**Last Updated:** March 23, 2026  
**Document Purpose:** Comprehensive listing of every feature, process, component, and system in JotMinds

---

## Table of Contents
1. [User Roles & Access Levels](#user-roles--access-levels)
2. [Authentication & Security](#authentication--security)
3. [Assessment Systems](#assessment-systems)
4. [Dashboard Interfaces](#dashboard-interfaces)
5. [Special Mode Interfaces](#special-mode-interfaces)
6. [Organization Management](#organization-management)
7. [Legal & Compliance](#legal--compliance)
8. [Gamification & Engagement](#gamification--engagement)
9. [Data Storage & APIs](#data-storage--apis)
10. [Components Library](#components-library)
11. [Routing Systems](#routing-systems)
12. [Mobile App Features](#mobile-app-features)
13. [Cognitive Analysis Features](#cognitive-analysis-features)
14. [Parent Features](#parent-features)
15. [Teacher/Professional Features](#teacherprofessional-features)
16. [Kids Mode Features](#kids-mode-features)
17. [Accessibility Features](#accessibility-features)
18. [Third-Party Integrations](#third-party-integrations)

---

## User Roles & Access Levels

### 1. Admin
- **Access Level:** Full system access
- **Can Impersonate:** All other roles
- **Features:**
  - User management (view, edit, delete)
  - View all user dashboards
  - Organization management
  - System diagnostics
  - Data export
  - Assessment result oversight

### 2. Supervisor/Organization
- **Access Level:** Organization-scoped
- **Portal:** Dedicated Supervisor Portal (OrganizationApp)
- **Features:**
  - Organization code management
  - Teacher/Professional approval workflow
  - Member roster management
  - Organization-wide analytics
  - Invitation code generation

### 3. Teacher
- **Access Level:** Class/student-scoped
- **Features:**
  - Class roster management
  - Student assessment tracking
  - Individual student insights
  - Class-wide analytics
  - Assessment assignment
  - Progress monitoring
  - Parent communication tools

### 4. Professional
- **Access Level:** Client-scoped
- **Features:**
  - Professional cognitive assessment
  - Client management
  - Assessment recommendations
  - Career insights
  - Teaching style assessment
  - Professional development tracking

### 5. Parent
- **Access Level:** Family-scoped
- **Features:**
  - Child account management
  - Parent observation assessments
  - Access request system
  - Child progress monitoring
  - Cognitive profile viewing
  - Parental consent management
  - PIN-protected controls

### 6. Student
- **Access Levels:** Age-dependent
  - **Ages 6-10:** Kids Mode (simplified interface)
  - **Ages 11-14:** JHS Dashboard
  - **Ages 15-18:** SHS Dashboard
  - **Ages 18+:** Adult/Tertiary Dashboard
- **Features:**
  - Age-appropriate assessments
  - Progress tracking
  - Gamification rewards
  - Learning resources
  - Peer comparisons (opt-in)

---

## Authentication & Security

### Sign-Up Flows
1. **Student Sign-Up**
   - Email/password registration
   - Age verification
   - Date of birth collection
   - Age-based consent flow
   - Optional organization code

2. **Parent Sign-Up**
   - Email/password registration
   - Child linking system
   - Parental consent forms
   - PIN setup for Kids Mode

3. **Teacher Sign-Up**
   - Email/password registration
   - Organization code REQUIRED
   - Supervisor approval required
   - Institution verification

4. **Professional Sign-Up**
   - Email/password registration
   - Organization code (optional)
   - Professional credentials
   - Supervisor approval if using org code

5. **Supervisor Sign-Up**
   - Email/password registration
   - Organization creation
   - Invitation code generation

### Authentication Features
- ✅ Email/password authentication (Supabase)
- ✅ Password strength validation
- ✅ Forgot password flow
- ✅ Password reset with deep links
- ✅ Email verification
- ✅ Session management
- ✅ Token-based API authentication
- ✅ Admin token persistence
- ✅ Impersonation system (admin only)
- ✅ Multi-device session support

### Security Features
- ✅ Password hashing (Supabase)
- ✅ Rate limiting on login attempts
- ✅ COPPA compliance (age-based features)
- ✅ Data encryption in transit (HTTPS)
- ✅ Secure password reset tokens
- ✅ Parent PIN protection (Kids Mode)
- ✅ Age-based privacy controls
- ✅ Consent verification system

---

## Assessment Systems

### Assessment Types by Age Group

#### 1. Kids Assessment (Ages 6-10)
- **Format:** Interactive, game-like
- **Duration:** 10-15 minutes
- **Questions:** 15 age-appropriate questions
- **Features:**
  - Audio narration
  - Visual cards with images
  - Emoji-based responses
  - Mascot guidance (Jots the Robot)
  - Confetti celebrations
  - Sticker rewards
  - No repeating questions
  - Progress saving

#### 2. JHS Assessment (Ages 11-14)
- **Format:** Card-based selection
- **Duration:** 15-20 minutes
- **Questions:** Teen-focused scenarios
- **Features:**
  - Real-world scenarios
  - School-related contexts
  - Peer interaction scenarios
  - Progress tracking
  - Detailed feedback

#### 3. SHS Assessment (Ages 15-18)
- **Format:** Advanced card selection
- **Duration:** 20-25 minutes
- **Questions:** Academic/career-focused
- **Features:**
  - Complex problem-solving
  - Future planning scenarios
  - Career exploration links
  - University preparation insights

#### 4. Adult/Tertiary Assessment (Ages 18+)
- **Format:** Professional assessment
- **Duration:** 25-30 minutes
- **Questions:** Career and life-focused
- **Features:**
  - Workplace scenarios
  - Leadership questions
  - Career recommendations
  - Industry insights

#### 5. Professional Cognitive Assessment
- **Target:** Professionals/educators
- **Purpose:** Self-awareness and teaching insights
- **Features:**
  - Teaching style analysis
  - Professional development recommendations
  - Client interaction insights

#### 6. Parent Observation Assessment
- **Target:** Parents observing children
- **Purpose:** Child cognitive profile building
- **Features:**
  - Behavior observation questions
  - Age-specific milestones
  - Developmental insights
  - PDF report generation
  - Printable results

#### 7. Teaching Style Assessment
- **Target:** Teachers/educators
- **Purpose:** Teaching approach analysis
- **Features:**
  - Pedagogical style identification
  - Student interaction preferences
  - Classroom management insights

### Assessment Framework: Sternberg's Triarchic Theory
All assessments measure three cognitive dimensions:

1. **Analytical Thinking**
   - Problem-solving
   - Critical analysis
   - Logical reasoning
   - Pattern recognition

2. **Creative Thinking**
   - Novel solutions
   - Imaginative approaches
   - Divergent thinking
   - Innovation

3. **Practical Thinking**
   - Real-world application
   - Common sense
   - Contextual adaptation
   - Street smarts

### Assessment Features
- ✅ Question randomization (no repeats)
- ✅ Progress saving (resume later)
- ✅ Time tracking (non-punitive)
- ✅ Skip question option
- ✅ Answer feedback (kids mode)
- ✅ Immediate results
- ✅ Detailed score breakdown
- ✅ Personalized insights
- ✅ Recommendations engine
- ✅ Historical tracking
- ✅ Retake capability
- ✅ PDF export
- ✅ Print functionality
- ✅ Data persistence (Supabase)

---

## Dashboard Interfaces

### 1. Kids Dashboard (Ages 6-10)
**Components:**
- Mascot welcome screen
- Assessment card (large, colorful)
- Games grid (mini-games)
- Sticker book showcase
- Progress visualization
- Parent PIN gate for settings

**Features:**
- Large touch targets
- Bright colors
- Audio narration
- Simple navigation
- Reward system

### 2. JHS Student Dashboard (Ages 11-14)
**Components:**
- Assessment tracking
- Progress charts
- Learning resources
- Peer comparison (optional)
- Cognitive profile summary
- Daily challenges

**Features:**
- Age-appropriate content
- Educational resources
- Study tips
- School success guidance

### 3. SHS Student Dashboard (Ages 15-18)
**Components:**
- Assessment history
- Career recommendations
- University guidance
- Cognitive strengths analysis
- Study strategy generator
- Academic success tips

**Features:**
- Career exploration
- University prep resources
- Future planning tools
- Advanced insights

### 4. Adult/Tertiary Dashboard (Ages 18+)
**Components:**
- Full cognitive profile
- Career recommendations
- Industry insights
- Professional development
- Assessment history
- Detailed analytics

**Features:**
- Professional focus
- Career advancement tools
- Leadership insights
- Workplace strategies

### 5. Teacher Dashboard
**Components:**
- Class roster view
- Individual student cards
- Assessment status tracking
- Class-wide analytics
- Student detail modal
- Organization info

**Features:**
- Student management
- Progress monitoring
- Insights at a glance
- Communication tools
- Assessment assignment

### 6. Parent Dashboard
**Components:**
- Linked children cards
- Child progress tracking
- Access request system
- Observation assessment link
- Child profile viewing
- Parental guidance resources

**Features:**
- Multi-child management
- Development tracking
- Educational resources
- Parent-child communication
- Assessment oversight

### 7. Professional Dashboard
**Components:**
- Professional profile
- Client management
- Assessment tools
- Teaching style results
- Professional insights
- Career development

**Features:**
- Client tracking
- Professional development
- Assessment recommendations
- Industry resources

### 8. Admin Panel
**Components:**
- User search and filter
- User details modal
- Impersonation controls
- Organization management
- System diagnostics
- Data export tools

**Features:**
- Full system access
- User management
- Data oversight
- System monitoring
- Debug tools

### 9. Supervisor Portal
**Components:**
- Organization dashboard
- Member roster
- Approval workflow
- Invitation code manager
- Organization analytics

**Features:**
- Organization management
- Member approval
- Code generation
- Analytics dashboard

---

## Special Mode Interfaces

### Kids Mode (Ages 6-10)
**Entry Requirements:**
- Student role
- Age between 6-10 years
- Date of birth verified

**Components:**
- `KidsModeWrapper` - Main container
- `KidsAssessment` - Assessment interface
- `KidsDashboard` - Home screen
- `KidsResults` - Results display
- `KidsGameSelection` - Game picker
- `KidsGamesGrid` - Game grid layout
- `KidsStickerBook` - Reward collection
- `ParentPINGate` - Parent controls
- `ParentPINSetup` - PIN creation
- `AudioNarration` - Text-to-speech
- `Mascot` - Jots the Robot character
- `Confetti` - Celebration effects
- `SoundFeedback` - Audio rewards

**Games:**
1. **Memory Match** - Card matching game
2. **Pattern Puzzle** - Sequence completion
3. **Emoji Feelings** - Emotion recognition
4. **Speed Sort** - Category sorting
5. **Story Builder** - Creative storytelling

**Design Principles:**
- Large touch targets (min 60px)
- Bright, contrasting colors
- Simple language
- Audio support
- Instant feedback
- Celebration moments
- No text-heavy screens
- Progress visualization

### Mobile App MVP
**Entry:** Separate route system (`/mobile`)

**Components:**
- `MobileApp` - Main container
- `MobileAuth` - Login/signup
- `MobileOnboarding` - First-time setup
- `MobileHome` - Dashboard
- `MobileAssessments` - Assessment list
- `MobileAssessmentTake` - Take assessment
- `MobileResults` - View results
- `MobileProfile` - User profile

**Features:**
- Bottom navigation
- Touch-optimized UI
- Swipe gestures
- Mobile-first design
- Streamlined flows
- Offline capability (planned)

**Navigation:**
- 🏠 Home
- 📝 Assessments
- 📊 Results
- 👤 Profile

---

## Organization Management

### Organization Code System
**Purpose:** Link teachers/professionals to institutions

**Features:**
- ✅ Unique code generation
- ✅ Code validation on signup
- ✅ Automatic member linking
- ✅ Supervisor approval workflow
- ✅ Organization roster management
- ✅ Member role assignment
- ✅ Code expiration (optional)
- ✅ Usage tracking

**Database Schema:**
```sql
organizations
- id
- name
- invitation_code (unique)
- created_by (supervisor_id)
- created_at
- settings (JSON)

organization_members
- organization_id
- user_id
- role (teacher/professional)
- status (pending/approved)
- joined_at
```

**Workflows:**
1. **Supervisor Creates Org** → Generates invitation code
2. **Teacher Signs Up** → Enters org code → Pending approval
3. **Supervisor Approves** → Teacher gains access
4. **Organization Portal** → Supervisor manages members

---

## Legal & Compliance

### 1. Age-Based Consent System
**Components:**
- `AgeVerification` - Age gate
- `ConsentFlow` - Consent collection
- `IndependentConsentForm` - Ages 18+
- `ParentalConsentForm` - Ages 13-17
- `StudentConsentForm` - Ages 6-12
- `ConsentVerification` - Consent check

**Age Groups:**
- **Ages 6-12:** Parental consent required + student assent
- **Ages 13-17:** Parental consent required + student consent
- **Ages 18+:** Independent consent

### 2. Privacy Policy
**Component:** `PrivacyPolicyPage`

**Sections:**
- Information collection
- Data usage
- Data sharing
- Cookies and tracking
- Age-specific protections
- User rights
- Contact information
- Ghana GDPR compliance

**Features:**
- ✅ Full text display
- ✅ Acceptance tracking
- ✅ Version control
- ✅ Update notifications

### 3. Terms of Use
**Component:** `TermsOfUsePage`

**Sections:**
- Service description
- User responsibilities
- Account terms
- Content ownership
- Limitation of liability
- Termination clauses
- Governing law
- Dispute resolution

### 4. User Agreement & Privacy Acceptance
**Route:** `/oauth/consent`
**Purpose:** OAuth-style consent flow

**Features:**
- ✅ Checkbox acceptance
- ✅ Link to full policy
- ✅ Link to full terms
- ✅ Required before account creation
- ✅ Timestamp tracking
- ✅ Version tracking

### 5. COPPA Compliance
**Features:**
- Age verification at signup
- Parental consent for users under 13
- Limited data collection for children
- No behavioral advertising for kids
- Parent access to child data
- Parent ability to delete child data

### 6. Account Termination
**Component:** `AccountTerminationManager`

**Features:**
- Self-service account deletion
- Data export before deletion
- Parental approval for child accounts
- Grace period (30 days)
- Reversible deletion
- Data retention policy

### 7. Governing Law
**Component:** `GoverningLawNotice`

**Details:**
- Jurisdiction: Ghana
- Legal framework: Ghana Data Protection Act
- Dispute resolution process
- Contact information for legal inquiries

---

## Gamification & Engagement

### Points System
**Earning Points:**
- Complete assessment: 100 points
- Complete daily challenge: 50 points
- Achieve streak: 25 points per day
- Unlock achievement: Variable points

**Point Tracking:**
- Stored in user profile
- Persistent across sessions
- Displayed on dashboards
- Used for leaderboards (optional)

### Badge System
**Badge Types:**
- 🏆 First Assessment
- 🔥 7-Day Streak
- 🌟 All Assessments Complete
- 🎯 Perfect Score
- 📚 Knowledge Seeker
- 🧠 Brain Master

**Badge Storage:**
- Array in user profile
- Achievement timestamps
- Display in profile section

### Sticker Book (Kids Mode)
**Component:** `KidsStickerBook`

**Features:**
- Collect stickers for achievements
- Visual sticker album
- Categories: Animals, Space, Nature, Fun
- Progress tracking
- Showcase feature

### Daily Challenges
**Component:** `DailyChallengeTab`

**Features:**
- New challenge each day
- Cognitive mini-exercises
- Point rewards
- Streak tracking
- Challenge history

### Leaderboards (Optional)
**Features:**
- Class-based rankings
- Privacy controls
- Opt-in participation
- Anonymous mode

---

## Data Storage & APIs

### Supabase Integration
**Tables:**

1. **users**
   - id, email, role, age, dateOfBirth
   - firstName, lastName, fullName
   - assessmentsCompleted (array)
   - organizationId
   - consentData (JSON)
   - createdAt, updatedAt

2. **assessment_results**
   - id, userId, assessmentType
   - analytical, creative, practical (scores)
   - answers (JSON)
   - insights (JSON)
   - completedAt

3. **organizations**
   - id, name, invitationCode
   - createdBy, settings
   - createdAt

4. **organization_members**
   - organizationId, userId
   - role, status
   - joinedAt

5. **parent_child_links**
   - parentId, childId
   - relationship
   - accessLevel
   - createdAt

6. **access_requests**
   - id, parentId, childId
   - status (pending/approved/denied)
   - requestedAt, resolvedAt

7. **consent_records**
   - userId, consentType
   - consentGiven, timestamp
   - version, ipAddress

8. **daily_challenges**
   - id, challenge, category
   - difficulty, date

9. **user_challenges**
   - userId, challengeId
   - completed, completedAt
   - points

### API Endpoints (Edge Functions)

**Assessment Routes:**
- `POST /api/assessments/submit` - Submit assessment
- `GET /api/assessments/:userId` - Get user assessments
- `GET /api/assessments/:userId/:type` - Get specific assessment

**User Routes:**
- `GET /api/user/:userId` - Get user data
- `PUT /api/user/:userId` - Update user data
- `DELETE /api/user/:userId` - Delete user

**Organization Routes:**
- `POST /api/organizations` - Create organization
- `GET /api/organizations/:code` - Validate org code
- `POST /api/organizations/:id/members` - Add member
- `PUT /api/organizations/:id/members/:userId` - Update member status

**Challenge Routes:**
- `GET /api/challenges/daily` - Get today's challenge
- `POST /api/challenges/complete` - Mark challenge complete
- `GET /api/challenges/history/:userId` - Get user challenge history

### Local Storage Usage
**Stored Data:**
- `admin_token` - Admin authentication token
- `admin_user` - Admin user object
- `jotminds_consent` - User consent data
- `kidsMode_parentPIN` - Encrypted parent PIN
- `assessment_progress_[type]` - Assessment in-progress data
- `theme_preference` - UI theme (future)

---

## Database Schema Summary

### Tables
1. **users** - User accounts
2. **assessment_results** - Assessment data
3. **organizations** - Organization entities
4. **organization_members** - Org membership
5. **parent_child_links** - Family relationships
6. **access_requests** - Parent access requests
7. **consent_records** - Legal consent tracking
8. **daily_challenges** - Daily brain challenges
9. **user_challenges** - User challenge completion
10. **teaching_assessments** - Teaching style results
11. **observation_assessments** - Parent observations
12. **badges** - Achievement badges
13. **stickers** - Sticker collection

### Key Relationships
- User → Assessment Results (1:many)
- User → Organization (many:1)
- Parent → Children (many:many via parent_child_links)
- Organization → Members (1:many via organization_members)
- User → Daily Challenges (many:many via user_challenges)

---

## Components Library

### Authentication Components
- `AuthForm` - Login/signup
- `AuthContext` - Auth state management
- `ForgotPasswordForm` - Password recovery
- `ResetPasswordForm` - Password reset
- `OrganizationAuthForm` - Supervisor auth
- `SupervisorAuthForm` - Legacy supervisor auth

### Assessment Components
- `Assessment` - Main assessment container
- `AssessmentTaking` - Question display
- `AssessmentSummary` - Results summary
- `AssessmentReport` - Detailed report
- `AssessmentHistory` - Past assessments
- `AssessmentPreview` - Assessment overview
- `CardSelectAnswer` - Answer card UI

### Age-Specific Assessment Components
- `ChildrenThinkingAssessment` - Ages 6-10
- `ChildrenThinkingContainer` - Kids wrapper
- `ChildrenThinkingResults` - Kids results
- `JHSThinkingAssessment` - Ages 11-14
- `JHSThinkingContainer` - JHS wrapper
- `JHSThinkingResults` - JHS results
- `SHSThinkingAssessment` - Ages 15-18
- `SHSThinkingContainer` - SHS wrapper
- `SHSThinkingResults` - SHS results
- `AdultThinkingAssessment` - Ages 18+
- `AdultThinkingContainer` - Adult wrapper
- `AdultThinkingResults` - Adult results

### Dashboard Components
- `Dashboard` - Generic dashboard
- `StudentDashboard` - Student view
- `TeacherDashboard` - Teacher view
- `ParentDashboard` - Parent view
- `ProfessionalDashboard` - Professional view
- `AdminPanel` - Admin view
- `SupervisorDashboard` - Supervisor view

### Profile & Results Components
- `CognitiveProfile` - Full profile view
- `CombinedCognitiveProfile` - Multi-user profile
- `ParentChildCognitiveReport` - Parent-child report
- `EnhancedTriangleVisualization` - 3D chart
- `RadarChartWidget` - Radar chart
- `SectionSummary` - Score breakdown

### Teacher/Professional Components
- `TeacherClassOverview` - Class view
- `TeacherIndividualStudentView` - Student detail
- `TeacherAppHeader` - Teacher header
- `TeacherTabBar` - Teacher navigation
- `StudentDetailView` - Student modal
- `ProfessionalAssessmentReport` - Pro report
- `ProfessionalCognitiveAssessment` - Pro assessment
- `ProfessionalCognitiveResults` - Pro results

### Parent Components
- `ParentAccessRequests` - Access request manager
- `ParentObservationAssessment` - Observation tool
- `ParentObservationResults` - Observation results
- `ParentTeacherGuide` - Guidance resources
- `ParentResponsibilitiesGuide` - Parent duties

### Kids Mode Components
- `KidsModeWrapper` - Main wrapper
- `KidsAssessment` - Kids assessment
- `KidsDashboard` - Kids home
- `KidsResults` - Kids results
- `KidsLogin` - Kids login
- `KidsButton` - Styled button
- `KidsCard` - Styled card
- `KidsCognitiveProfile` - Kids profile
- `KidsGameSelection` - Game picker
- `KidsGamesGrid` - Game grid
- `KidsStickerBook` - Sticker collection
- `AudioNarration` - TTS component
- `Mascot` - Robot character
- `Confetti` - Celebration effect
- `SoundFeedback` - Audio feedback
- `ParentPINGate` - PIN protection
- `ParentPINSetup` - PIN creation
- `ProgressFlow` - Progress UI

### Kids Games
- `MemoryMatch` - Memory game
- `PatternPuzzle` - Pattern game
- `EmojiFeelings` - Emotion game
- `SpeedSort` - Sorting game
- `StoryBuilder` - Story game

### Organization Components
- `OrganizationApp` - Main org app
- `OrganizationManager` - Org management
- `OrganizationCodeHelp` - Code assistance
- `SupervisorApp` - Supervisor portal
- `SupervisorReview` - Review interface

### Legal/Consent Components
- `UserConsentFlow` - Main consent flow
- `AgeVerification` - Age gate
- `ConsentFlow` - Consent collection
- `ConsentVerification` - Consent checker
- `IndependentConsentForm` - 18+ consent
- `ParentalConsentForm` - Parent consent
- `StudentConsentForm` - Student consent
- `PrivacyPolicyPage` - Full policy
- `PrivacyPolicyDisplay` - Policy display
- `PrivacyPolicyAcceptance` - Policy accept
- `TermsOfUsePage` - Full terms
- `GoverningLawNotice` - Legal notice
- `LiabilityDisclaimers` - Disclaimers
- `AccountTerminationManager` - Account deletion
- `AgePrivacySettings` - Age privacy
- `PrivacyProtectionBanner` - Privacy notice

### Gamification Components
- `GamificationSystem` - Main system
- `GamificationDashboard` - Gamification view
- `ProfileBadge` - Badge display
- `DailyChallengeTab` - Challenge UI
- `ChildrenDailyChallenges` - Kids challenges

### Educational Components
- `EducationalResources` - Resource library
- `StudyStrategyGenerator` - Study tips
- `AcademicSuccessTips` - Academic guidance
- `CareerRecommendations` - Career advice
- `GhanaEducationGuidance` - Ghana-specific
- `SchoolInsights` - School data
- `TeachingStyleAssessment` - Teaching quiz
- `TeachingStyleResults` - Teaching results
- `ParentTeacherGuide` - PT collaboration

### Utility Components
- `LandingPage` - Public homepage
- `ContactPage` - Contact form
- `FrameworkInfo` - Theory explanation
- `DebugPanel` - Debug tools
- `AdminDiagnostic` - Admin debug
- `QuestionBankAudit` - Question review
- `ClearOldResults` - Data cleanup
- `PasswordStrengthIndicator` - Password UI
- `FeedbackPrompt` - Feedback form
- `GuidedReflection` - Reflection tool
- `ReflectionsViewer` - View reflections
- `PeerComparison` - Peer analytics
- `DiscoveryOfTheDay` - Daily facts
- `MindMoodMeter` - Mood tracker
- `BrainGym` - Brain exercises
- `BrainGymResults` - Exercise results
- `MiniGamesHub` - Games portal
- `ConfettiCelebration` - Celebration

### Mobile Components
- `MobileApp` - Mobile main
- `MobileAuth` - Mobile auth
- `MobileOnboarding` - Mobile onboard
- `MobileHome` - Mobile home
- `MobileAssessments` - Mobile assessments
- `MobileAssessmentTake` - Mobile take
- `MobileResults` - Mobile results
- `MobileProfile` - Mobile profile
- `MobileHeaderMenu` - Mobile menu

### UI Components (Shadcn)
Over 40 UI components in `/components/ui/`:
- `button`, `card`, `input`, `label`
- `dialog`, `sheet`, `drawer`, `popover`
- `select`, `checkbox`, `radio-group`, `switch`
- `tabs`, `accordion`, `collapsible`
- `table`, `pagination`, `scroll-area`
- `alert`, `alert-dialog`, `toast`
- `badge`, `avatar`, `skeleton`
- `progress`, `slider`, `separator`
- `form`, `calendar`, `chart`
- `dropdown-menu`, `context-menu`, `menubar`
- `navigation-menu`, `breadcrumb`
- `carousel`, `aspect-ratio`
- `command`, `hover-card`
- `input-otp`, `resizable`
- `sidebar`, `toggle`, `toggle-group`
- `tooltip`, `use-mobile`

---

## Routing Systems

### Current Setup: Dual Routing

#### 1. Main Platform (State-Based)
**File:** `/App.tsx`
**Method:** `useState` for view management
**Views:**
- `landing` - Public homepage
- `consent` - Consent flow
- `privacy-policy` - Privacy policy
- `terms-of-use` - Terms page
- `contact` - Contact page
- `auth` - Login/signup
- `forgot-password` - Password recovery
- `reset-password` - Password reset
- `organization` - Supervisor portal
- `dashboard` - Main dashboard
- `assessment` - Take assessment
- `summary` - Assessment results
- `profile` - User profile
- `admin` - Admin panel

**Pros:**
- Simple state management
- No page reloads
- Easy authentication checks

**Cons:**
- No URL-based navigation
- No deep linking
- No browser back/forward
- Hard to share specific views

#### 2. Mobile App (React Router)
**File:** `/mobile-routes.tsx`
**Method:** `createBrowserRouter` from `react-router`
**Routes:**
- `/mobile` - Mobile landing
- `/mobile/auth` - Mobile auth
- `/mobile/onboarding` - Setup wizard
- `/mobile/home` - Mobile dashboard
- `/mobile/assessments` - Assessment list
- `/mobile/assessments/:type` - Take assessment
- `/mobile/results` - Results list
- `/mobile/results/:id` - Result detail
- `/mobile/profile` - User profile

**Pros:**
- URL-based navigation
- Deep linking support
- Browser navigation works
- Shareable URLs

**Cons:**
- Separate from main app
- Duplicate authentication logic
- Inconsistent with main platform

---

## Mobile App Features

### Mobile-First Design
- Touch-optimized controls (min 48px targets)
- Bottom navigation bar
- Swipe gestures
- Mobile-friendly forms
- Responsive layouts

### Mobile Navigation
**Bottom Nav Bar:**
1. 🏠 Home
2. 📝 Assessments
3. 📊 Results
4. 👤 Profile

### Mobile Flows

#### Onboarding
1. Welcome screen
2. Account setup
3. Age verification
4. Consent collection
5. Tutorial walkthrough

#### Assessment Flow
1. Assessment list
2. Assessment detail
3. Start assessment
4. Answer questions
5. Submit assessment
6. View results

#### Profile Management
1. View profile
2. Edit details
3. View badges
4. Change settings
5. Logout

---

## Cognitive Analysis Features

### Sternberg's Triarchic Theory
**Three Cognitive Styles:**

1. **Analytical (Academic Intelligence)**
   - Problem-solving
   - Critical thinking
   - Logical reasoning
   - Academic success

2. **Creative (Innovative Intelligence)**
   - Novel ideas
   - Imagination
   - Artistic thinking
   - Innovation

3. **Practical (Street Smart Intelligence)**
   - Real-world application
   - Common sense
   - Adaptability
   - Life skills

### Score Calculation
**Method:** Weighted scoring based on question responses

**Score Range:** 0-100 for each dimension

**Balance Score:** Measures how evenly distributed the three scores are

**Dominant Style:** Highest scoring dimension

### Visualization Methods
1. **Triangle Visualization** - 3D triangle showing balance
2. **Radar Chart** - Spider web chart
3. **Bar Chart** - Simple bars
4. **Percentage Circles** - Circular progress
5. **Score Cards** - Numeric display

### Insights Engine
**Generates:**
- Strengths analysis
- Areas for development
- Learning recommendations
- Career suggestions
- Study strategies
- Communication tips

**Personalization:**
- Age-appropriate language
- Role-specific insights (student, teacher, parent)
- Context-aware recommendations
- Cultural considerations (Ghana education system)

---

## Parent Features

### Child Management
- Link multiple children
- View each child's profile
- Track assessment progress
- Monitor cognitive development
- Access educational resources

### Parent Observation Assessment
**Purpose:** Parents assess their child's behavior

**Features:**
- Age-specific questions
- Behavioral observations
- Developmental milestones
- PDF report generation
- Share with professionals

### Access Request System
**Workflow:**
1. Parent requests access to child account
2. Request sent to child (if age 13+)
3. Child approves/denies
4. Parent gains view-only access
5. Parent can see dashboards, results, profile

**Privacy Protection:**
- Child consent required (age 13+)
- View-only access (no editing)
- Revokable at any time
- Audit trail

### Parental Controls
- Set PIN for Kids Mode
- Monitor screen time
- Control data sharing
- Manage consent
- Delete child account

---

## Teacher/Professional Features

### Class Management (Teachers)
- View all students in class
- Track assessment completion
- Monitor individual progress
- Identify struggling students
- Generate class reports

### Student Insights
- Individual cognitive profiles
- Assessment history
- Strengths and weaknesses
- Recommended interventions
- Progress over time

### Class-Wide Analytics
- Average scores by dimension
- Class cognitive distribution
- Comparison to norms
- Trend analysis
- Exportable reports

### Client Management (Professionals)
- Manage client roster
- Track assessment assignments
- View client results
- Generate professional reports
- Recommend interventions

### Professional Development
- Teaching style assessment
- Professional cognitive profile
- Career development insights
- Best practices recommendations

---

## Kids Mode Features

### Visual Design
- **Colors:** Bright, high contrast
- **Fonts:** Large, readable (Comic Sans-like)
- **Buttons:** Extra large (60px+)
- **Images:** Colorful illustrations
- **Animations:** Smooth, delightful

### Audio Features
- Text-to-speech narration
- Question reading
- Audio feedback
- Sound effects
- Celebration sounds

### Mascot: Jots the Robot
- Friendly robot character
- Guides children through app
- Provides encouragement
- Celebrates achievements
- Offers hints

### Reward System
- ✨ Stickers for achievements
- 🎉 Confetti celebrations
- 🏆 Badge collection
- ⭐ Star ratings
- 🎨 Unlockable colors

### Mini-Games
1. **Memory Match** - Find matching pairs
2. **Pattern Puzzle** - Complete sequences
3. **Emoji Feelings** - Identify emotions
4. **Speed Sort** - Sort into categories
5. **Story Builder** - Create stories

### Parent Controls
- PIN-protected settings
- Screen time limits (future)
- Content filters (future)
- Progress monitoring
- Data export

### Safety Features
- No external links
- No chat/messaging
- No ads
- COPPA compliant
- Parental oversight

---

## Accessibility Features

### Visual Accessibility
- High contrast mode (future)
- Large text option (future)
- Screen reader support (partial)
- Keyboard navigation
- Focus indicators

### Auditory Accessibility
- Audio narration (Kids Mode)
- Text alternatives for sounds
- Visual feedback for audio cues

### Cognitive Accessibility
- Simple language
- Clear instructions
- Progress indicators
- Undo/redo options
- Time extensions (no time limits)

### Motor Accessibility
- Large touch targets
- No fine motor requirements
- Single-click interactions
- Generous hit areas

---

## Third-Party Integrations

### Supabase
**Services Used:**
- Authentication (email/password)
- Database (PostgreSQL)
- Edge Functions (serverless API)
- Real-time subscriptions (future)
- Storage (future)

### Recharts
**Purpose:** Data visualization
**Charts Used:**
- Radar charts
- Bar charts
- Line charts
- Area charts
- Pie charts

### Lucide React
**Purpose:** Icon library
**Usage:** UI icons throughout app

### Framer Motion → Motion
**Purpose:** Animations
**Usage:**
- Page transitions
- Component animations
- Gesture handling
- Scroll animations

### React Hook Form
**Purpose:** Form management
**Usage:**
- Login/signup forms
- Assessment forms
- Settings forms

### Sonner
**Purpose:** Toast notifications
**Usage:**
- Success messages
- Error alerts
- Info notifications

### Tailwind CSS v4
**Purpose:** Styling framework
**Usage:** All component styling

---

## Utility Functions & Helpers

### Scoring Utilities
- `adultScoring.ts` - Adult assessment scoring
- `jhsScoring.ts` - JHS assessment scoring
- `shsScoring.ts` - SHS assessment scoring
- `scoring.ts` - Generic scoring functions
- `professionalCognitiveScoring.ts` - Professional scoring
- `teachingStyleScoring.ts` - Teaching style scoring

### Assessment Data
- `assessmentQuestions.ts` - Generic questions
- `assessmentQuestions_teen.ts` - Teen questions
- `assessmentQuestions_tertiary.ts` - Adult questions
- `approvedKidsQuestions.ts` - Kids questions
- `kidsAssessmentQuestions.ts` - Kids data
- `adultThinkingData.ts` - Adult data
- `jhsThinkingData.ts` - JHS data
- `shsThinkingData.ts` - SHS data
- `parentObservationData.ts` - Parent questions
- `teachingStyleData.ts` - Teaching data
- `teachingStyleQuestions.ts` - Teaching questions

### API Utilities
- `api.ts` - Generic API functions
- `assessmentApi.ts` - Assessment API
- `dailyChallengeApi.ts` - Challenge API
- `supabase/client.ts` - Supabase client

### Storage Utilities
- `storage.ts` - LocalStorage wrapper
- `debugStorage.ts` - Debug data storage
- `brainGymStorage.ts` - Brain Gym storage

### Insights & Analysis
- `assessmentInsights.ts` - Insight generation
- `insights.ts` - Generic insights
- `industryInsights.ts` - Career insights

### Helpers
- `dateFormat.ts` - Date formatting
- `dateUtils.ts` - Date utilities
- `designTokens.ts` - Design system tokens
- `gamification.ts` - Gamification logic
- `pdfGenerator.ts` - PDF creation
- `parentObservationPdfGenerator.ts` - Parent PDF

---

## Environment Variables

### Required Supabase Env Vars
```
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

---

## Known Issues & Limitations

### Current Issues
1. ❌ **Deployment Error:** 403 Forbidden on Supabase deployment
   - **Cause:** Authentication/permissions issue
   - **Fix:** Reconnect Supabase project

2. ⚠️ **Dual Routing:** Inconsistent navigation between main app and mobile app
   - **Status:** Needs unification

3. ⚠️ **URL Navigation:** Main app doesn't support deep linking
   - **Status:** Requires React Router migration

### Limitations
- No offline mode (requires internet)
- No real-time collaboration
- Limited mobile app features vs main platform
- No video/multimedia content
- No social features (by design for privacy)
- No third-party integrations (by design)

---

## Deployment Checklist

### Pre-Deployment
- [ ] Supabase connection verified
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Test user accounts created
- [ ] Sample data populated

### Post-Deployment
- [ ] Authentication working
- [ ] Assessments submitting
- [ ] Results displaying
- [ ] Organization system functional
- [ ] Mobile app accessible
- [ ] Kids Mode working
- [ ] Admin panel accessible

---

## Future Enhancements (Planned)

### Phase 2 Features
- [ ] React Router migration for main app
- [ ] Progressive Web App (PWA) support
- [ ] Offline mode
- [ ] Real-time notifications
- [ ] Parent-teacher messaging
- [ ] Class discussion boards
- [ ] Video resources library

### Phase 3 Features
- [ ] AI-powered insights
- [ ] Personalized learning paths
- [ ] Adaptive assessments
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with Ghana Education Service
- [ ] School district dashboard

---

## Support & Documentation

### Documentation Files
- `/MVP-OVERVIEW.md` - Project overview
- `/MOBILE_MVP_README.md` - Mobile app guide
- `/KIDS_MODE_DOCUMENTATION.md` - Kids Mode guide
- `/ORGANIZATION_CODE_IMPLEMENTATION_SUMMARY.md` - Org system
- `/USER_CONSENT_COMPLETE.md` - Consent system
- `/PRIVACY_POLICY_COMPLETE.md` - Privacy details
- `/TERMS_AND_CONDITIONS.md` - Terms details
- And 100+ more documentation files...

### Contact
- **Platform:** JotMinds
- **Purpose:** Cognitive assessment & educational insights
- **Target Audience:** Students, teachers, parents, professionals
- **Location:** Ghana
- **Compliance:** COPPA, Ghana Data Protection Act

---

**Document End**

*This inventory is comprehensive as of March 23, 2026. For specific implementation details, refer to individual documentation files or component source code.*