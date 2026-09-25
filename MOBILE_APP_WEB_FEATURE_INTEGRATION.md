# JotMinds — Web → Mobile Feature Integration List

**Generated:** 2026-09-19 from the current `main` (commit `711fd9d`)
**Source of truth:** the web app code (`src/app/App.tsx`, the role dashboards, `supabase/functions/server/*`), *not* the older `JOTMINDS_MOBILE_APP_SPECIFICATION.md` (dated 2026-05-18) or `COMPLETE_APP_INVENTORY.md` (2026-03-23). Both predate the institution / head-teacher / super-admin work and disagree with the code in places (see §7).

**Method / confidence:** I read the routing, every role's navigation and tab structure, the backend route files and the API client layer. I did not read every component's internals, so per-tab bullets describe what each tab is built to show, not every edge case. Items I could not confirm are marked **(unverified)**.

---

## 1. The rule this list follows

Per the decision: **users, organisations and school/institution management stay on the web app.** The mobile app only serves people *using* JotMinds, not people *administering* it.

- **In scope for mobile:** the five end-user experiences (Student, Kids, Parent, Teacher, Professional).
- **Web only:** anything that creates, approves, assigns, promotes, removes or bills users, classes, schools or organisations (see §6).
- **Grey zone:** members who *belong to* an institution/organisation (a school student, a teacher at a school, an org professional) still use mobile for their own experience. They are created/linked on the web (invite link, code, admin enrolment). Whether mobile can also *accept* a code at sign-up is an open decision (§8).

---

## 2. Account types

| # | Account | How it's created today | Mobile? |
|---|---|---|---|
| 1 | **Student, Tertiary/Adult** (18+ or `educationLevel = Tertiary`) | Self sign-up, or school enrolment | ✅ |
| 2 | **Student, SHS** (15–18) | Self sign-up, or school enrolment | ✅ |
| 3 | **Student, JHS** (11–14) | Self sign-up, or school enrolment | ✅ |
| 4 | **Student, Kids mode** (age 6–10 → `KidsModeWrapper`) | Self sign-up, or school enrolment; parent PIN gates it | ✅ (own UX, see §3.2) |
| 5 | **Parent** | Self sign-up (`role=parent`) | ✅ |
| 6 | **Teacher** | Self sign-up, school invite link, or institution code | ✅ (teaching tools only) |
| 7 | **Professional** | Self sign-up, optionally with an organisation code | ✅ |
| 8 | **School Admin / Head Teacher** (`school_admin`, and `organization` with type Educational Institution) | Institution registration; promoted from teacher by another admin | ❌ web only |
| 9 | **Organisation / Supervisor** (`organization`, `supervisor`) | Organisation sign-up (`OrganizationAuthForm`, `SupervisorAuthForm`) | ❌ web only |
| 10 | **Platform Admin / Super Admin** (`admin`, `platform_admins` table) | Granted by another admin | ❌ web only |

Notes:
- `UserRole` in `src/app/types/index.ts` also lists `child`, but the app routes children as `student` + age 6–10 / `Elementary`. There is no separate `child` login in practice.
- There is one alternate **student sign-in method: student code** (`JM-XXXX-XXXX`, issued by a school). Mobile students from schools will need this.
- Age → experience mapping in code: Kids mode is **age 6–10** (`App.tsx`). The older spec's Kids-Jr (7–9) / Kids-Sr (10–12) split is **not implemented** in the web app.

---

## 3. Feature list by account

### 3.1 Student — JHS / SHS / Tertiary-Adult

Navigation on web: **Home · Brain Boost · Assessments · Cognitive Profile · School Portal**, plus **Parent Access** and **Account Settings**.

**Assessments**
- Three framework assessments: **Learning style** (Kolb), **Thinking style** (Sternberg), **Decision style** (Dual-process). Each has an in-progress save, results, and a report view.
- One **Thinking Styles** assessment matched to level: JHS, SHS or Adult (question banks differ; see `assessmentQuestions*.ts`, `jhs/shs/adultThinkingData.ts`).
- Server-side progress save/resume and submit (`/assessment/progress`, `/assessment/submit`, `/jhs-thinking`, `/shs-thinking`, `/adult-thinking`).
- **Assessment history** ("Track Record") with per-assessment report view.
- **Combined Cognitive Profile**: dominant learning / thinking / decision styles, executive summary, strengths, personalised recommendations, radar / triangle visualisation, profile completeness %.
- **Guided reflection** after assessments + **Reflections viewer** (server: `/reflection`).
- Report **PDF / print** export (currently `window.open` + print CSS, and `jspdf`/`html2canvas`, which won't port directly to native).

**Growth and practice**
- **Brain Boost / Brain Gym**: daily set of 3 cognitive exercises per framework, with completion, streak and results screens.
- **Daily Challenge** runner (server: `/daily-challenge/*`, includes notification settings).
- **Skill Builder**: multi-day personalised plans, day-by-day activities, complete-day (server: `/skill-plan/*`).
- **Cognitive Workout** dashboard + **Lesson viewer** (mini-lessons).
- **Cognitive Growth** dashboard and **Profile Evolution** (history of profile over time).
- **Profile Improvement Tracker**.
- **AI Learning Coach** ("Jotti"): chat, personalised insights, study-strategy generator, academic success tips, daily discovery. Feature-flagged (`ai-coach`).
- **Career**: career recommendations, dynamic career matcher, student career fit, Ghana education pathway guidance.
- **Gamification**: XP, levels, badges (streak, assessment, brain-gym, XP, profile, skill-builder, career categories), daily and weekly challenges, streak insurance. (No student-facing leaderboard exists yet: the server route is unused and the admin leaderboard config says "coming soon".)
- **Nudges** panel (smart reminders).
- **Mood / check-in** (server: `/save-mood`, `/checkin`).
- **Shareable profile link** (`/cognitive-profile/share`, `/shared/:token`, `SharedProfileView`).

**School and family**
- **School Portal tab**: school/class info, **student code** display + copy. ⚠️ The "Class Assignments & Lessons" list on this tab is **hard-coded placeholder data** ("Course A", "Instructor A"). Do not build against it; see §7.
- **Parent Access**: view pending / all parent access requests; **approve, deny, revoke** a parent's access.
- **Account settings**: name, email, parent/guardian name & email, avatar upload, logout.
- **Consent**: age-based consent flows (student, parental, independent), privacy-policy acceptance, privacy dashboard (consent records, data inventory, export/deletion requests).
- **Account deletion** (`/account/delete`) and termination manager.

### 3.2 Student — Kids mode (age 6–10)

Whole separate UI (`components/kids/*`), parent-gated. Navigation: **Dashboard · Mind Play · Mood Meter · Discoveries · My Progress · School**.
- **Parent PIN**: 4-digit PIN set on first launch; required to exit Kids mode or view the full cognitive profile.
- **Kids assessment** (Children Thinking Styles), audio narration (TTS), mascot, sound feedback, confetti, progress flow, kid-friendly results and cognitive profile.
- **Mini-games** (5): Emoji Feelings, Memory Match, Pattern Puzzle, Speed Sort, Story Builder. Game selection + games grid.
- **Sticker book** (rewards).
- **Mind Play** daily challenges for children, **Mood Meter** (`MindMoodMeter`), **Discovery of the Day**.
- "No-repeat" question logic for kids quizzes (per the kids-mode docs; **unverified in code**).
- **Mobile note:** native TTS and native PIN/biometric are natural replacements for the web audio and PIN components.

### 3.3 Parent

Navigation: **Overview · My Parent Cognitive Profile · 3-Way Alignment Analytics · Children Profiles · Parent Observations · Teacher Observations & Concerns · Profile & Settings · Feedback & Support**.
- **Link a child**: parent enters the child's email → creates an **access request** → the child (or auto-approval) accepts (`/access-request/*`, `/parent/link-child`). **Unlink** a child (with email notification).
- **Overview**: children cards, link-request status, refresh.
- **Per-child profile** (a tab per child): Kolb / Sternberg / Dual-process results plus JHS/SHS/Children thinking results, Ghana education-pathway mapping, **AI parent-support tips**, and a **Guide** sub-tab (`ParentResponsibilitiesGuide`, `ParentTeacherGuide`).
- **Child cognitive report** (`ParentChildCognitiveReport`) and **parent–child pairing analytics** (`ParentChildPairingAnalytics`).
- **My Parent Cognitive Profile**: the parent's own assessment and insights.
- **3-Way Alignment Analytics**: parent ⇄ child ⇄ teacher alignment dashboard.
- **Parent Observation Assessment**: parent-rated observation of the child, results, **PDF export** (`parentObservationPdfGenerator`).
- **Teacher Observations & Concerns**: read-only list of observations teachers wrote about the child (category, severity, recommended home action) (`/teacher-observation/child/:id`).
- **Sharing consent** per child (`/consent`).
- **Profile & Settings**, **Feedback & Support**.

### 3.4 Teacher (teaching tools only)

Navigation on web: **Overview · Manage Classes · Students · Analytics · Alignment Analysis · Lesson Planner · Teaching Insights**.

Keep on mobile:
- **Overview / Class overview**: switchable donut, bar, radar, grid views; "Classroom Intelligence & Pedagogical Recommendations"; assessment-module completion progress.
- **Students list** (read): search / filter by class, status, and the **individual student view**: cognitive profile, teaching strategies (AI), resources, report download.
- **Teacher observations**: create / list / delete an observation about a student (category, severity, subject, note, recommended home action). Visible to the student's parent. (`/teacher-observation/*`)
- **Analytics hub** (`CentralAnalyticsHub`): Learning Style, Decision Style, Thinking Style, Learning Dimensions, Alignment Analysis, Class Insights; class-vs-teaching comparison (`TeacherAnalyticsComparison`); AI class insights.
- **AI Lesson Planner**, 11 tabs: Creation · Plan Document · Cognitive · Differentiated · Assessment · Lesson Prep · Reflection · History · Curriculum · Analytics · Classroom Intelligence. Includes post-lesson reflection, differentiated instruction, generated lesson assessments, curriculum tracker, and delivery mode. Lesson plans/reflections sync via `lessonPlannerApi.ts`.
- **"Ask Jotti"** lesson copilot (floating drawer, context-aware).
- **Teaching Insights (JTIA)**: the teacher's own 5-domain assessment (Cognitive, Instructional, Classroom Leadership, Relationship, Professional Intelligence), report, history, retake, **PDF**. Marketed as *development, not ranking*.
- **Teaching Style assessment** (self) and results.
- Teacher's own **privacy dashboard**, **engagement dashboard**, **platform essentials**, and **school analytics view** (read).
- Teacher settings and logout.

Web only (roster management, per §1): create classes, assign students to classes, **approve students**, generate student codes, bulk CSV upload, enrol student, transfer, class-approval workflow. These live in `TeacherClassManagement`, `CentralStudentManagement` and the `InstitutionDashboard` modals.

Mobile must *handle* (display) the states these produce: student **pending approval**, class **pending/approved/rejected**, teacher **pending institution approval**.

### 3.5 Professional

Navigation: **Overview · Framework Assessments · Track Record · Reflections & Notes · Feedback & Support**.
- **Framework assessments** (workplace-worded): Learning Agility (Kolb), Thinking (Sternberg), Decision-making (Dual-process).
- **Professional Cognitive Assessment** + results + combined **Professional Assessment Report** (uses position and organisation name; `professionalCognitiveScoring.ts`).
- **Track record** history, **Reflections & notes** (`ReflectionsViewer`), AI insights, radar, PDF report.
- **Org linkage** is display-only on mobile (organisation name, position, department). Supervisor reviews of a professional are stored (`/supervisor/review`, `/review/professional/:id`), but I found **no place in the web professional dashboard that displays them** (unverified beyond the dashboard code), so there is nothing to port yet.

---

## 4. Cross-cutting features (all in-scope accounts)

| Area | What the web app does | Mobile consideration |
|---|---|---|
| **Sign-up / sign-in** | Email + password; **6-digit email OTP** on sign-up; login-alert email; role-normalising migration; **student-code sign-in** | Needs OTP entry UI + student-code path |
| **Password reset** | Custom endpoints `/auth/request-password-reset`, `/verify-reset-token`, `/reset-password` (`ForgotPasswordForm`, `ResetPasswordForm`) | Needs a deep link (the old spec assumed Supabase's built-in reset; the code uses custom endpoints) |
| **OAuth consent** | `OAuthConsentPage` + `/oauth/consent/*` | **(unverified)** I did not confirm whether social login is offered or this is JotMinds acting as an OAuth provider |
| **Invites / magic links** | `?code=`, `?role=`, `?invite=` params; `/institutions/validate-invite-token`, `/join` | Universal links/app links if mobile accepts these |
| **Consent & legal** | Age-based consent (parental/student/independent), privacy policy, terms, contact page, governing-law and liability notices | Render as native screens or webviews |
| **Feature flags** | `/feature-flags/effective`; the client gates `brain-gym`, `daily-challenge`, `ai-coach` | Mobile must fetch and respect the same flags |
| **AI** | Client calls the **Cloudflare Pages proxy `/api/openai`** (`gpt-4o-mini`, ≤2000 tokens, fixed request shape), not the Supabase `ai-routes` | See §7; native clients send no `Origin` header, which the proxy allows |
| **Offline** | `offlineSyncManager` queues `ASSESSMENT`, `REFLECTION`, `LESSON_PLAN`, `FEEDBACK` in localStorage and flushes on reconnect; service worker + PWA manifest | Re-implement the queue with AsyncStorage/SQLite |
| **Notifications** | Daily-challenge notification settings endpoint; in-app nudges; email (Resend) | No push infrastructure exists; native push is net-new |
| **Reports / export** | PDF via `jspdf` + `html2canvas` + print windows | Needs native PDF/share sheet |
| **Support / feedback** | Feedback tab (student, parent, professional), contact page | Simple form |
| **Account** | Profile edit (`PATCH /user/profile`), avatar, account deletion, logout | — |

---

## 5. Backend surface mobile will call

Base: `https://<project>.supabase.co/functions/v1/server/make-server-fc8eb847` (Hono edge function, one Supabase project, KV-style storage plus a few Postgres tables).

Used by the web client today and needed by mobile: `signup`, `signin`, `session`, `send-otp`, `verify-otp`, `user/profile`, `assessment/*`, `jhs|shs|adult-thinking/*`, `cognitive-profile/*`, `reflection`, `daily-challenge/*`, `skill-plan/*`, `save-mood`, `get-mood-history`, `get-challenge-progress`, `save-challenge-progress`, `gamification/*`, `parent/*`, `access-request/*`, `observation/*` (parent), `teacher-observation/*`, `consent/*`, `teacher/students`, `student-code/validate|signin`, `feature-flags/effective`, `account/delete`, `auth/*` (reset), plus the `/api/openai` proxy on Cloudflare.

Exists on the server but **not called by the web client** (found no callers): `assessment-sessions/*` and `professional-profile` (Professional V2 engine, only surfaced in the super-admin studio / pilot analytics), `career/*`, `brain-gym/*`, `leaderboard/*`, `ai/*` routes, `role-fit` (only the web supervisor dashboard). Don't assume these are production-ready for mobile.

---

## 6. Stays on web (not in mobile)

**School / Institution admin** (`InstitutionDashboard`, `HeadTeacherDashboard`): overview, student management, student insights, teacher management, class management, school lesson planning, reports, training & alignment, school settings, administrator settings, member invites, bulk upload, generate student codes, enrol student, transfer member, approve / reject / promote / demote members, institution codes, multi-admin, institution registration.

**Organisation / Supervisor** (`OrganizationApp`, `SupervisorDashboard`): overview, professionals roster, org insights (cognitive styles, learning approaches, decision making, team synergy), **role matcher** / candidate ranking / candidate comparison, org codes (generate / regenerate / expiry / status), employee removal, bulk upload, supervisor reviews, org profile.

**Platform admin / Super admin** (`SuperAdminPortal`, `AdminPortal`, `AdminPanel`): dashboard, **user management** (incl. impersonation and support-access), institutions, organisations, assessment engine, item-bank studio (V2), pilot analytics, AI management, content management, gamification config, analytics, billing, communications/broadcast, support center/tickets, security center, feature flags, platform settings, audit logs, developer console, backup & recovery.

---

## 7. Things the mobile team should know before building

1. **Several features are browser-local only in the web app** (no server sync): engagement tracking, nudges, privacy-consent records, cognitive-workout progress, skill mastery, and Brain Gym results (`brainGymStorage.ts`). A separate mobile app would not see this data, and mobile-created data would not appear on web. Gamification *does* sync (`/gamification/*`), reflections/daily challenge/mood/skill plan sync, and lesson plans sync. Decide per feature whether to add a server store first.
2. **Placeholder / stub UI in web today:** the Student **School Portal** class-lessons list is hard-coded sample data. Don't port it as if real.
3. **Some student tabs exist but aren't in the nav** (`reflections`, `recommendations`, `feedback`); they're reached through in-page links.
4. **`JOTMINDS_MOBILE_APP_SPECIFICATION.md` has drifted from the code:** it assumes React Router, Supabase's built-in password reset, a `kv` edge function, Counsellor and Parent-Coaching modules, and a Kids-Jr/Kids-Sr split. None of those exist in the web app. Treat that spec's §17 modules as **new features, not ports**.
5. **Two "child" definitions** in code: `App.tsx` uses age 6–10; `StudentDashboard.isChildrenUser()` uses `educationLevel === 'Elementary'` or the Children thinking-style choice. A 12-year-old Elementary student can land on the child nav inside the non-Kids dashboard. Pick one rule for mobile.
6. **Auth token model:** the web client uses Supabase JWTs plus custom `signup`/`signin` endpoints. Confirm mobile uses the same endpoints so role normalisation and student-code generation stay consistent.

---

## 8. Decisions needed from you

1. **Joining a school/org from mobile:** can a teacher/student/professional enter an institution or org code (or open an invite link) in the mobile app, or must linking always be done on the web first?
2. **Teacher roster tasks:** I put class creation, student approval, student codes and bulk upload on web (per your rule). Some teachers will expect at least "approve pending student" on mobile. Confirm the cut.
3. **Local-only features (§7.1):** add server persistence first, or ship mobile with its own separate data for those?
4. **Kids age rule:** 6–10 (App.tsx) vs Elementary level (dashboard).
5. **Push notifications:** in scope for v1? Nothing exists to reuse.
