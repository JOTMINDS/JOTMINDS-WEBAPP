# JotMinds Mobile App — Complete Implementation Specification

**Version:** 1.1 (MVP + Gap-Closure addendum)
**Last updated:** 2026-05-18
**Change log:**
- v1.1 — Added §17 Gap-Closure modules: Skill Builder, Parent Coaching, Teacher Growth, Kids-Jr/Kids-Sr split, Counsellor support layer, progressive onboarding. Tier mapping in §6.1 revised. Role list expanded to include Counsellor.
- v1.1.1 (2026-05-18) — Data-storage decisions finalized: (1) Skill Builder gets new canonical pattern `skillplan:{userId}:{planId}` — KV total 12→13. (2) Teacher Growth nests under `user:{userId}:settings.growth` — no new pattern. (3) Counsellor chat moves to a **dedicated Postgres table outside KV** (clinical PHI requirements) — schema below in §17.5. All ⚠️ flags cleared.
**Audience:** Mobile engineers implementing the JotMinds mobile app (React Native / Expo or React-based PWA wrapper). This document is the single source of truth — read end-to-end before coding.
**Companion docs:** `/COMPREHENSIVE_USER_FLOWS.md`, `/JOTMINDS_PRODUCT_OVERVIEW.md`, `/JOTMINDS_FULL_SYSTEM_REVIEW.md`, `/DATABASE_SCHEMA_COMPLETE.md`, `/ORGANIZATION_INVITATION_CODE_GUIDE.md`.

---

## 1. Product Summary

JotMinds is a cognitive-thinking assessment **and active-learning** platform across five user roles: **Student** (Kids-Jr / Kids-Sr / JHS / SHS / Adult tiers), **Parent**, **Teacher**, **Professional**, and **Counsellor** (live human support — see §17.5). The mobile app is an MVP companion to the main web platform with full feature parity for: authentication, taking assessments, viewing results, daily challenges, reflections, and role-specific dashboards.

### Design tenets
- **Mobile-first, touch-first.** Minimum tap target 44×44 pt. No hover-only affordances.
- **Single-hand reachable.** Primary CTAs in the bottom 60% of the screen.
- **Offline-tolerant.** Assessment progress persists locally and syncs to Supabase when online.
- **Accessible.** WCAG AA contrast, screen-reader labels on every interactive element, dynamic type support, captions on all audio narration.
- **Age-adaptive UI.** Kids-Jr (7–9) huge buttons, mascot-led narration, parent co-presence; Kids-Sr (10–12) playful but more text; JHS (13–14) bright; SHS (15–18) clean academic; Adult/Pro clinical.
- **Active learning, not just diagnostic.** Every result must lead to a concrete next action (see §17.1 Skill Builder).
- **Human support, not just AI.** A live counsellor is reachable from any flagged result (§17.5).

---

## 2. Tech Stack & Conventions

| Concern | Choice |
|---|---|
| Framework | React Native + Expo (preferred) OR React + React Router as PWA |
| Navigation | React Router (page-based; aligns the mobile app with the platform's new routing migration) |
| State | React Context + `useReducer` for global; local `useState` for screen state |
| Auth & data | Supabase JS client (`@supabase/supabase-js`) |
| Storage (offline) | AsyncStorage (RN) / IndexedDB (PWA) keyed by `jm:` prefix |
| Styling | Tailwind via NativeWind (RN) or Tailwind v4 (PWA) |
| Charts | `recharts` (PWA) / `react-native-svg-charts` (RN) — Radar + Bar |
| Icons | `lucide-react` / `lucide-react-native` |
| Animation | `motion/react` / `react-native-reanimated` |
| Forms | `react-hook-form@7.55.0` + `zod` |
| TTS (Kids) | Expo Speech / Web Speech API |

### Routing map (React Router)

```
/                         → Landing / Role Picker
/auth/sign-in
/auth/sign-up             → role param: ?role=student|parent|teacher|professional
/auth/forgot-password
/auth/reset-password      → deep-link target from Supabase email (token in URL)
/oauth/consent            → OAuth consent screen
/onboarding/:role         → role-specific onboarding wizard
/dashboard                → role-aware container; routes to /dashboard/student etc.
/dashboard/student
/dashboard/parent
/dashboard/teacher
/dashboard/professional
/assessment/:tier/intro   → tier ∈ kids | jhs | shs | adult | professional | teacher
/assessment/:tier/take
/assessment/:tier/results/:resultId
/assessment/history
/reflections
/daily-challenge
/brain-gym
/profile
/profile/edit
/profile/organization     → enter/manage org invitation code
/settings
/legal/privacy
/legal/terms
/support
```

State-based fallback: the platform's existing state-driven navigation (e.g., `currentScreen` in `App.tsx`) is preserved behind a `<Routes>` shell so that screen components can mount with either driver. **Use the URL as the source of truth on mobile.**

---

## 3. Backend Architecture (Supabase + KV Store)

### 3.1 Auth
- **Provider:** Supabase Auth (`supabase.auth`).
- **Sign-up:** `signUp({ email, password, options: { data: { role, full_name, age, organization_code? } } })`.
- **Sign-in:** `signInWithPassword`.
- **OAuth:** `signInWithOAuth({ provider: 'google' | 'apple' })` → redirects through `/oauth/consent` for first-time consent (TOS + privacy + data-use opt-ins) before continuing to onboarding.
- **Password reset:** `resetPasswordForEmail(email, { redirectTo: 'jotminds://auth/reset-password' })` (mobile deep link) or `https://app.jotminds.com/auth/reset-password` (PWA). Email links land on `/auth/reset-password`; the app extracts `access_token` + `refresh_token` from the URL fragment, calls `supabase.auth.setSession`, then `supabase.auth.updateUser({ password })`.
- **Deep-link config:** Expo `scheme: "jotminds"` in `app.json`. Linking config maps `jotminds://auth/reset-password` → `/auth/reset-password`. iOS Universal Links + Android App Links also map `https://app.jotminds.com/auth/*` to the same routes.

### 3.2 Single-table KV Store
Most non-auth data lives in one Postgres table (`kv_store`) keyed by string. **13 canonical key patterns** (#13 added 2026-05-18 for Skill Builder). Counsellor chat is the one exception — it lives in dedicated tables outside KV (see §17.5) because clinical PHI needs distinct encryption, retention, and audit policies.

| # | Key pattern | Value shape | Owner |
|---|---|---|---|
| 1 | `user:{userId}:profile` | `{ role, fullName, age, ageGroup, locale, avatarUrl, createdAt }` | user |
| 2 | `user:{userId}:settings` | `{ notifications, audioNarration, dyslexiaFont, theme }` | user |
| 3 | `user:{userId}:consent` | `{ tos: ts, privacy: ts, dataUse: ts, parentalConsent?: ts }` | user |
| 4 | `assessment:{userId}:{tier}:{resultId}` | full result object (see §6.5) | user |
| 5 | `assessment:{userId}:{tier}:progress` | in-progress draft (auto-saved) | user |
| 6 | `reflection:{userId}:{date}` | `{ mood, energy, text, tags[] }` | user |
| 7 | `challenge:{userId}:{date}` | `{ challengeId, status, response }` | user |
| 8 | `org:{orgCode}` | `{ orgId, name, type: school\|clinic, createdBy, createdAt }` | org admin |
| 9 | `org:{orgId}:members` | `[{ userId, role, joinedAt }]` | org admin |
| 10 | `link:parent:{parentId}:children` | `[{ childUserId, relation, consentTs }]` | parent |
| 11 | `link:teacher:{teacherId}:students` | `[{ studentUserId, classId, addedAt }]` | teacher |
| 12 | `link:pro:{proId}:clients` | `[{ clientUserId, caseId, addedAt }]` | pro |
| 13 | `skillplan:{userId}:{planId}` | Skill Builder plan (see §17.1) | user |

**API surface** (Supabase Edge Function `kv`, called via `supabase.functions.invoke('kv', { body })`):

- `get(key)` → value or null
- `set(key, value)` → upserts
- `delete(key)`
- `list(prefix)` → matching entries (server enforces RLS based on userId)
- `mget([keys])` → batch read

Mobile **must** use these calls and **must not** introduce new tables.

### 3.3 Organization Invitation Code
- Code format: 8-char alphanumeric uppercase (e.g., `JM-A4F9X2Z1`), prefix `JM-`.
- On teacher/professional sign-up the field **Organization Invitation Code** is required (validated client-side regex `/^JM-[A-Z0-9]{8}$/`).
- On submit, app calls `kv.get('org:'+code)`. If present, append `{ userId, role, joinedAt }` to `org:{orgId}:members` atomically via the `org_join` Edge Function (server enforces dedupe + role check).
- Parents and students may optionally enter a code post-signup from `/profile/organization`.

---

## 4. Global UI System

### 4.1 Theme tokens (already defined in `src/styles/theme.css`)
- Primary: `--color-primary` (deep teal).
- Accents: warm coral for CTAs, soft yellow for kids highlights.
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48.
- Radii: 8 (cards), 12 (sheets), 9999 (pills).

### 4.2 Component library (shared with web `src/app/components/ui`)
Re-use existing primitives where mobile-suitable: `Button`, `Input`, `Card`, `Sheet`, `Dialog`, `Tabs`, `Progress`, `Toast`, `Avatar`, `Badge`, `Skeleton`. Add the following mobile-only:

- **`BottomTabBar`** — 4 tabs per role; floating, safe-area aware.
- **`SwipeableCard`** — used in daily challenges & question cards.
- **`MobileHeader`** — back button + title + right action; replaces sidebar.
- **`BottomSheet`** — for filters, role pickers, and confirmations (uses `@gorhom/bottom-sheet` in RN).
- **`PinPad`** — Kids mode for age-gate entry.

### 4.3 Tab bars (per role)

| Role | Tabs |
|---|---|
| Student | Home · Assess · Reflect · Profile |
| Parent | Home · Children · Reports · Profile |
| Teacher | Home · Classes · Reports · Profile |
| Professional | Home · Clients · Reports · Profile |

---

## 5. Screens (every screen, top-to-bottom)

### 5.1 Splash / Boot
- Logo + tagline "Discover how you think".
- On mount: read session via `supabase.auth.getSession()`. If session → route to `/dashboard`. Else → `/`.
- Failure path: show retry button + offline indicator.

### 5.2 Landing / Role Picker (`/`)
- Hero text, mascot illustration.
- 4 role cards (Student, Parent, Teacher, Professional) → `/auth/sign-up?role=<role>`.
- Footer link: "I already have an account" → `/auth/sign-in`.

### 5.3 Auth — Sign In (`/auth/sign-in`)
- Inputs: Email, Password (with show/hide toggle).
- Buttons: "Sign in" (primary), "Sign in with Google", "Sign in with Apple".
- Links: "Forgot password?" → `/auth/forgot-password`. "Create account" → `/`.
- Validation: email format (zod `string().email()`), password ≥ 8.
- Errors: map Supabase `AuthApiError` codes to friendly strings ("Invalid login credentials" → "Check your email and password").

### 5.4 Auth — Sign Up (`/auth/sign-up?role=<role>`)
Common fields: Full name, Email, Password (with `PasswordStrengthIndicator`), Confirm password, Date of birth (age computed), Country.

Role-specific fields:
- **Student (age < 13):** parental email required; on submit, send `parental_consent` email via `supabase.functions.invoke('send-parent-consent')`; account stays in `pending_consent` state until parent confirms.
- **Student (≥13):** standard.
- **Parent:** child(ren) full name + DOB (collected via repeating row, min 1).
- **Teacher:** School name, **Organization Invitation Code** (`JM-XXXXXXXX`, required), Subject(s) taught.
- **Professional:** Practice/Clinic name, License number, **Organization Invitation Code** (required), Specialty.

Consent block: 3 checkboxes — Terms, Privacy, Data Use Acknowledgment. All required.

Submit → `supabase.auth.signUp` → on success: write `user:{id}:profile`, `user:{id}:consent`. Teacher/Pro: call `org_join` Edge Function. Route → `/onboarding/:role`.

### 5.5 Auth — Forgot Password (`/auth/forgot-password`)
- Email input + Submit → `resetPasswordForEmail`.
- On success: show "Check your inbox" empty-state card with a "Resend (60s)" button.

### 5.6 Auth — Reset Password (`/auth/reset-password`)
- Deep-link entry. On mount, parse `#access_token` and `#refresh_token` from URL fragment, call `setSession`.
- Inputs: New password, Confirm password (`PasswordStrengthIndicator`).
- Submit → `updateUser({ password })` → success toast → `/auth/sign-in`.
- Failure: token expired → message + link to request again.

### 5.7 OAuth Consent (`/oauth/consent`)
- First-time OAuth users land here after provider callback.
- Shows: provider account, role selector (if not preset), 3 consent checkboxes (TOS, Privacy, Data Use), DOB picker.
- Submit → write consent + profile → `/onboarding/:role`.
- Decline → `supabase.auth.signOut()` → `/`.

### 5.8 Onboarding (`/onboarding/:role`)
3-step wizard with progress dots:
1. **Welcome** (mascot + role explainer).
2. **Preferences** — notifications opt-in (push token registered via `expo-notifications` on accept), audio narration (default on for Kids), dyslexia-friendly font, theme.
3. **Quick tour** — 3 screenshots, "Get started" CTA.

Save `user:{id}:settings`. Route → `/dashboard`.

### 5.9 Dashboard — Student (`/dashboard/student`)

**Layout (vertical scroll):**
1. Greeting header — "Good morning, {firstName}" + streak badge + mood-meter button.
2. **Today's Discovery card** — pulls from `DiscoveryOfTheDay` component (see web `src/app/components/DiscoveryOfTheDay.tsx`). One curated tip rotated by `floor(epochDays % discoveries.length)`.
3. **Daily Challenge tile** — link to `/daily-challenge`. Shows checkmark if completed today (read `challenge:{userId}:{YYYY-MM-DD}`).
4. **Continue Assessment** — visible if `assessment:{userId}:{tier}:progress` exists; shows percent done.
5. **Cognitive Profile snapshot** — radar chart of latest result's six dimensions (see §6.5). Tap → most recent result detail.
6. **Brain Gym** card — gateway to mini-games (`/brain-gym`).
7. **Reflections** mini-list — last 3 entries with mood emoji.

### 5.10 Dashboard — Parent (`/dashboard/parent`)
- Children carousel (avatar + name + age-tier badge).
- Per child quick cards: last assessment date, latest scores summary, alerts (e.g., "Consent needed").
- Buttons: Add Child, Request Linking (sends invite), View Reports (`/dashboard/parent/child/:childId`).
- Observation Assessment CTA → `ParentObservationAssessment` flow.

### 5.11 Dashboard — Teacher (`/dashboard/teacher`)
- Class selector (BottomSheet).
- Class roster (paginated, 25 per page) with per-student status pills (Not started, In progress, Completed).
- Aggregate radar chart for class.
- Buttons: Invite Student (generates a one-time student-link code, stored under `link:teacher:{teacherId}:students`), Export CSV (server function `export_class_csv`).

### 5.12 Dashboard — Professional (`/dashboard/professional`)
- Client list with case IDs, last session, risk flag (computed from latest assessment — see §6.7).
- Buttons: Add Client (via invite code), Open Session, Generate Report.

### 5.13 Assessment Intro (`/assessment/:tier/intro`)
- Tier-aware copy + estimated time (Kids 10 min, JHS 15, SHS 20, Adult 25, Pro 30).
- Pre-flight checklist: quiet space, fully charged, headphones (Kids).
- Audio narration toggle (default on for Kids).
- Start button → `/assessment/:tier/take`. Also creates `assessment:{userId}:{tier}:progress` with `startedAt`.

### 5.14 Assessment Taking (`/assessment/:tier/take`)
**Common UI:**
- Top: progress bar (questionIndex / total), section label, save indicator.
- Body: one question per screen.
- Bottom: Prev (disabled on first), Next (disabled until answered), Save & exit.
- Auto-saves draft to `assessment:{userId}:{tier}:progress` every answer (debounced 500 ms).
- On exit & resume, restores from the same key.

**Question types:**
- `multiple_choice` — radio cards, 1 selection.
- `likert_5` — 5-point scale (Strongly disagree … Strongly agree).
- `card_select` — `CardSelectAnswer` component (image/text cards, 1+ pick depending on `maxSelect`).
- `slider` — numeric 0–100.
- `audio_response` — Kids tier; record up to 30 s via `expo-av`. Upload to Supabase Storage bucket `audio-responses`; reference URL in the answer payload.
- `drag_rank` — rank N items (DnD).

**Question banks (tier → bank size):**
- Kids (ages 5–10): 24 questions across 4 sections — Curiosity, Problem-Solving, Memory & Focus, Social-Emotional.
- JHS (11–14): 36 — adds Metacognition.
- SHS (15–18): 48 — adds Future Orientation, Risk/Reasoning.
- Adult: 60 — Sternberg triarchic (Analytical, Creative, Practical) + Executive function + Reflective.
- Professional (administered to a client): 72 — full Adult + clinical screeners (PHQ-2, GAD-2 preface).
- Teacher (self): 40 Teaching Style — Directive, Facilitative, Coaching, Delegating.
- Parent observation: 30 — observer-rated Likert on child behavior.

### 5.15 Assessment Submission flow
On final Next:
1. Compute scores client-side (see §6.6) for instant feedback.
2. `kv.set('assessment:{userId}:{tier}:{resultId}', resultObject)` — `resultId = uuid()`.
3. `kv.delete('assessment:{userId}:{tier}:progress')`.
4. Navigate to `/assessment/:tier/results/:resultId`.
5. Background: trigger `enrich_result` Edge Function for AI narrative & peer comparison.

### 5.16 Assessment Results (`/assessment/:tier/results/:resultId`)
Sections:
1. Hero — composite score (0–100) + tier-appropriate label ("Curious Explorer", "Strategic Thinker"…).
2. Radar chart (six dimensions).
3. Per-dimension cards — score, percentile (vs anon cohort), short tip.
4. AI Narrative (from `enrich_result`; show skeleton until ready, poll every 2 s up to 30 s).
5. Recommended actions (3 bullets).
6. Buttons: Share (PDF via `expo-print` or web PDF), Save to Profile, Retake.

### 5.17 Assessment History (`/assessment/history`)
- Vertical timeline of results from `kv.list('assessment:{userId}:')`.
- Filter by tier (BottomSheet).
- Tap → result detail.

### 5.18 Daily Challenge (`/daily-challenge`)
- Pulls from static challenge bank `challenges.json` keyed by `dayOfYear % len`.
- Components: prompt, optional media, response input (text 280 chars or photo).
- Submit → `kv.set('challenge:{userId}:{YYYY-MM-DD}', { challengeId, response, status: 'done' })`.
- Streak counter updates: read prior 30 days and recompute consecutive days.

### 5.19 Reflections (`/reflections`)
- List of past reflections grouped by month.
- "Add reflection" FAB → BottomSheet with: mood (5 emojis), energy (slider 1–5), free text (500 chars), tags (chips).
- Save to `reflection:{userId}:{YYYY-MM-DD}`. Overwrite if same day.

### 5.20 Brain Gym (`/brain-gym`)
- Grid of 6 mini-games (memory match, n-back, Stroop, dual-task, attention focus, pattern). MVP: ship 3 (Memory Match, n-back, Stroop). Each game result → `kv.set('braingym:{userId}:{gameId}:{ts}', { score, durationMs })`. Aggregated into Brain Gym Results screen (radar of 6 cognitive functions).

### 5.21 Profile (`/profile`)
- Avatar, name, role badge, age.
- Sections: Account · Notifications · Privacy · Organization · Children/Students/Clients (role-dependent) · About · Sign out.
- Sign out → `supabase.auth.signOut()` → clear AsyncStorage `jm:*` → `/`.

### 5.22 Profile — Organization (`/profile/organization`)
- Current org card (name, joined date) if linked.
- "Join organization" input (invitation code) — same regex validation.
- Leave button — confirm BottomSheet → remove from `org:{orgId}:members`.

### 5.23 Settings (`/settings`)
- Theme (System / Light / Dark).
- Language (locale picker; affects question banks).
- Audio narration.
- Dyslexia-friendly font.
- Delete account (double confirm; calls `delete_account` Edge Function; user data is anonymized per privacy policy).

### 5.24 Legal screens
- `/legal/privacy` and `/legal/terms` render content from `JOTMINDS_COMPLETE_LEGAL_SYSTEM.md` via remote markdown loader. Accept-version timestamps persist in `user:{userId}:consent`.

### 5.25 Support (`/support`)
- FAQ accordion (8 items).
- Contact form (email, subject, message) → `support_contact` Edge Function → mail.

---

## 6. Calculations & Formulas

### 6.1 Age & tier mapping
```
age = floor((today - dob) / 365.25)
tier = age <= 6  ? 'kids_jr'   // 5–6: limited preview only; full bank from 7
     : age <= 9  ? 'kids_jr'   // 7–9: parent co-presence required
     : age <= 12 ? 'kids_sr'   // 10–12: independent, simpler text
     : age <= 14 ? 'jhs'
     : age <= 18 ? 'shs'
     : 'adult'
```
**Kids-Jr (7–9):** parent must confirm session start. Audio narration default-on, all text ≤ Grade-2 reading level, max 3 questions per screen pause.
**Kids-Sr (10–12):** independent use allowed, parent gets a summary digest. Reading level Grade-4.
Under-13 in both Kids tiers still requires verified parental consent (§5.4).

### 6.2 Likert normalization
Each Likert response (1–5) is mapped: `normalized = (response - 1) / 4` ∈ [0, 1].

### 6.3 Dimension score
For each cognitive dimension D with questions Qd:
```
rawScore_D = Σ(normalized_i × weight_i) / Σ(weight_i)
score_D    = round(rawScore_D × 100)              // 0–100 displayed
```
Reverse-coded items: `normalized_i = 1 - normalized_i` before weighting.

### 6.4 Composite score
```
composite = round(Σ(score_D × dimWeight_D) / Σ(dimWeight_D))
```
Tier-specific `dimWeight_D` lives in `src/app/utils/scoring/weights.ts`.

### 6.5 Result object shape
```ts
{
  resultId: string,        // uuid
  userId: string,
  tier: 'kids'|'jhs'|'shs'|'adult'|'professional'|'teacher'|'parent_observation',
  startedAt: ISOString,
  completedAt: ISOString,
  answers: Array<{ questionId, value, latencyMs }>,
  scores: {
    composite: number,                 // 0-100
    dimensions: Record<DimensionId, number>,
    percentile?: Record<DimensionId, number>,  // filled by enrich_result
  },
  flags: string[],                     // e.g., 'rushed', 'inconsistent'
  narrative?: string,                  // AI generated, async
  version: 'v1'
}
```

### 6.6 Quality flags
- `rushed` if median `latencyMs` < 1500 ms.
- `inconsistent` if Cronbach-alpha-like reliability check across paired items drops below 0.5.
- `incomplete` if any required question answered with `null` (shouldn't happen; safeguard).

### 6.7 Professional risk flag
Computed only for Professional-administered assessments:
- High risk if `score_emotional_regulation < 30` OR `flags.includes('inconsistent')` OR PHQ-2 sum ≥ 3 OR GAD-2 sum ≥ 3.
- Surfaces as a red dot on the Professional dashboard.

### 6.8 Percentile (server)
`enrich_result` Edge Function:
- Pulls anonymized cohort (same tier ± 1 yr, same locale) means/SDs from the materialized `cohort_stats` view.
- Percentile via normal CDF: `Φ((score - μ) / σ) × 100`.

### 6.9 Streak
`streak = number of consecutive prior days (incl. today) where challenge:{userId}:{date} exists with status='done'`.

---

## 7. Data Dependencies (which screen reads/writes what)

| Screen | Reads | Writes |
|---|---|---|
| Splash | session | — |
| Sign-up | — | profile, consent, settings, org members |
| Sign-in | session, profile | — |
| OAuth Consent | session | profile, consent |
| Dashboard (any) | profile, settings, latest assessments, challenge today, reflections recent | — |
| Assessment Take | progress draft | progress draft (debounced), final result |
| Assessment Results | result, cohort_stats (server) | — |
| Daily Challenge | challenges.json, today's record | today's record |
| Reflections | reflection by date list | reflection by date |
| Brain Gym | braingym records | braingym new record |
| Profile / Org | org membership | org membership |
| Parent Dashboard | linked children profiles + their latest results | parent-child link |
| Teacher Dashboard | linked students + class assessments | teacher-student link |
| Pro Dashboard | linked clients + assessments + risk flags | pro-client link |

---

## 8. Navigation Flows

### 8.1 New Student (age 14) — first run
Splash → `/` → tap Student → `/auth/sign-up?role=student` → fill form → submit → `/onboarding/student` 3 steps → `/dashboard/student` → tap "Start your first assessment" → `/assessment/jhs/intro` → `/assessment/jhs/take` → submit → `/assessment/jhs/results/:id`.

### 8.2 Returning Teacher with code reset
Splash → session expired → `/auth/sign-in` → "Forgot password" → email → tap link → app deep-links to `/auth/reset-password` with tokens → set new password → `/auth/sign-in` → `/dashboard/teacher`.

### 8.3 Parent linking child
`/dashboard/parent` → Add Child → BottomSheet form → send invite code → child accepts on their device → on accept, `link:parent:{parentId}:children` and `link:child:{childId}:parents` are written. Both dashboards refresh via Supabase Realtime subscription on those keys.

### 8.4 Professional reviewing client risk
`/dashboard/professional` → red dot client → tap → client overview → "Latest assessment" → `/assessment/professional/results/:id` → "Generate clinical report" → PDF.

---

## 9. Backend API Interactions (concrete calls)

```ts
// Auth
supabase.auth.signUp({ email, password, options: { data: { role, full_name, dob } } });
supabase.auth.signInWithPassword({ email, password });
supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'jotminds://oauth/consent' } });
supabase.auth.resetPasswordForEmail(email, { redirectTo: 'jotminds://auth/reset-password' });
supabase.auth.updateUser({ password });
supabase.auth.signOut();

// KV (via Edge Function `kv`)
supabase.functions.invoke('kv', { body: { op: 'get', key } });
supabase.functions.invoke('kv', { body: { op: 'set', key, value } });
supabase.functions.invoke('kv', { body: { op: 'list', prefix } });
supabase.functions.invoke('kv', { body: { op: 'mget', keys } });
supabase.functions.invoke('kv', { body: { op: 'delete', key } });

// Organization join
supabase.functions.invoke('org_join', { body: { code, role } });

// Result enrichment (fire-and-forget; results poll)
supabase.functions.invoke('enrich_result', { body: { resultId } });

// Account deletion
supabase.functions.invoke('delete_account');

// Storage
supabase.storage.from('audio-responses').upload(`${userId}/${qid}.m4a`, blob);
supabase.storage.from('avatars').upload(`${userId}.png`, blob);

// Realtime
supabase.channel('user-'+userId)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'kv_store', filter: `key=like.user:${userId}%` }, handler)
  .subscribe();
```

### 9.1 Error handling
- All Edge Function calls wrapped in `withRetry(fn, { retries: 2, backoffMs: 500 })`.
- 401 → re-auth (`supabase.auth.refreshSession()`); if still 401 → `signOut` + redirect `/auth/sign-in`.
- 403 → toast "You don't have access" + log to `error_log` table.
- Network offline → queue writes in `outbox` (IndexedDB / AsyncStorage); flush on `online` event.

### 9.2 Offline queue
Outbox entry: `{ id, op, key, value, attempts, createdAt }`. Flush in FIFO order. Conflict resolution: server timestamp wins. Reads fall back to cached values when offline; show "Offline — viewing saved data" banner.

---

## 10. Sync, Realtime & Caching

- **Cold start:** prime cache with `mget` of: profile, settings, last 5 results, today's challenge, last 7 reflections.
- **Foreground regain:** if last sync > 5 min ago, refresh primed keys.
- **Realtime:** subscribe to user's own key changes + linked-entity changes (parent → child profile, teacher → student results).
- **TTL:** cohort stats cached 24 h; everything else invalidated on realtime push.

---

## 11. Accessibility & Localization

- All text via `t('key')` (i18next). Initial locales: `en`, `tw` (Twi), `fr`, `es`.
- Audio narration in Kids tier: pre-recorded MP3 fallback if TTS unavailable.
- Voice-over labels: every `Pressable` has `accessibilityLabel` and `accessibilityRole`.
- Reduce-motion respected: skip parallax, reduce confetti.

---

## 12. Analytics & Telemetry
- Event names: `screen_view`, `auth_signup`, `auth_signin`, `assessment_start`, `assessment_question_answered`, `assessment_submit`, `challenge_complete`, `reflection_save`, `org_join_attempt`, `org_join_success`, `password_reset_request`, `password_reset_complete`.
- Sink: Supabase Edge Function `telemetry` → BigQuery (configured later).
- No PII in payloads — only `userId` hashed (sha256 with rotating salt).

---

## 13. Security & Privacy
- All Edge Functions enforce RLS via `auth.uid()`.
- KV `get`/`set` allowlist: a user may only read/write keys prefixed with `user:{auth.uid()}:`, `assessment:{auth.uid()}:`, `reflection:{auth.uid()}:`, `challenge:{auth.uid()}:`, `braingym:{auth.uid()}:`, plus org-scoped reads when membership is verified.
- Audio responses encrypted at rest (Supabase Storage default AES-256).
- Parental consent for under-13 enforced server-side: profile remains `pending_consent` until parent endpoint flips it.

---

## 14. Test Plan (acceptance)

For each screen above:
- **Render test:** matches snapshot at iPhone 13, Pixel 6, iPad Mini, web 375 / 768 / 1024.
- **Interaction test:** primary CTA reachable one-handed.
- **Auth tests:** sign-up happy path per role; password reset deep link round-trip; OAuth consent decline.
- **Assessment tests:** start → exit at q5 → resume → finish; offline submit queues then flushes.
- **Org code tests:** valid code joins; invalid code shows error; reused code idempotent.
- **A11y tests:** axe-core or eslint-plugin-jsx-a11y, manual VoiceOver / TalkBack pass.

---

## 15. Implementation Order (recommended sprint plan)
1. Routing shell + auth screens + deep links + OAuth consent + password reset.
2. KV client wrapper + outbox + realtime.
3. Student dashboard + JHS assessment end-to-end (intro → take → results).
4. Other tiers (Kids → SHS → Adult).
5. Parent and Teacher dashboards + linking flows + org invitation code.
6. Professional dashboard + risk flags + report PDF.
7. Daily Challenge + Reflections + Brain Gym.
8. Settings, Legal, Support, Profile.
9. Localization, accessibility audit, analytics.

---

## 16. Open Questions (to confirm before final build)
- Final list of Kids audio narration clips — record vs TTS-only?
- Apple Sign-In availability for under-13 (App Store policy interaction with parental consent).
- Whether teacher CSV export ships in MVP or v1.1.
- Push notification cadence policy.

---

---

## 17. Gap-Closure Modules (v1.1 addendum)

These six modules close the gaps identified in the product review. Each is additive — none changes the 12 canonical KV patterns without explicit platform sign-off. Two new patterns are **proposed** below and flagged ⚠️ until approved.

### 17.1 Skill Builder (Interactivity Gap)
**Problem:** Users get profiles but no tools to develop weak dimensions.

**Solution:** Every assessment result spawns a personalized 7- or 14-day micro-curriculum per low-scoring dimension (score < 50).

**Screens:**
- `/skill-builder` — overview list of active plans (per child for parents, per self for students/adults).
- `/skill-builder/:planId` — day-by-day timeline. Each day = 1 Brain Gym mini-game + 1 reflection prompt + 1 daily challenge tuned to the target dimension.
- `/skill-builder/:planId/day/:n` — runs the day's three activities sequentially; XP awarded on completion.

**Generation logic:** on result save, `enrich_result` Edge Function also writes a plan: select top-2 weakest dimensions, pull activities from `activities.json` indexed by `{dimension, tier, difficulty}`, sequence with progressive difficulty (1.0 → 1.4× over the plan).

**KV (approved — new canonical pattern #13):** `skillplan:{userId}:{planId}` →
```ts
{ planId, dimensionId, tier, lengthDays, currentDay, status, activities: [{day, gameId, promptId, challengeId, completed}], createdAt }
```

**Routing add:** insert `/skill-builder` and child routes after `/brain-gym` in §2. Add **Grow** tab to Student tab bar (Home · Assess · Grow · Reflect · Profile — bumps to 5 tabs; alternative: collapse Reflect into Grow).

**Dashboard hook:** Student dashboard §5.9 gains a "Today's Skill Builder" row above Brain Gym. Parent dashboard §5.10 surfaces child's active plans with "Co-do this activity" CTA.

### 17.2 Parent Coaching (Parent Depth)
**Problem:** Parents see profiles, not actions.

**New screens:**
- `/parent/coaching` — Coaching Pathways list (per child × per weak dimension). Each pathway = 4-week scripted program: weekly theme + 3 dinner-table conversation starters + 1 weekend activity + a "watch for" checklist.
- `/parent/coaching/:pathwayId` — week view with checkboxes; tap activity → step-by-step card with photo, materials list, time-to-do, debrief questions.
- `/parent/coreflect/:childId` — shared journal: parent and child each post one entry per prompt, see each other's once both submitted (gated to teach mutual disclosure).
- `/parent/ask-expert` — Counsellor inbox (links to §17.5).

**Content source:** `pathways.json` curated by content team, keyed by dimension and child age band.

**KV:** uses existing `reflection:{userId}:{date}` for co-reflection entries with a `pairId` field to bind matched parent+child entries.

**Tab bar update (Parent):** Home · Children · Coaching · Reports · Profile (5 tabs).

### 17.3 Teacher Growth (Teacher Development)
**Problem:** Teachers are data recipients, not learners.

**New screens:**
- `/teacher/growth` — Teaching Style result (from `TeachingStyleAssessment`) + PD micro-lessons keyed to the teacher's lowest style scores.
- `/teacher/growth/lesson/:lessonId` — 5–8 min lesson (text + 1 video + 1 reflection + 1 classroom-try-this).
- `/teacher/growth/benchmark` — anonymous peer comparison: same subject, same region, sample size guard (n ≥ 20 or hidden).
- `/teacher/growth/goals` — set up to 3 quarterly goals; quarterly re-assessment reminder.

**Content source:** `teacher_lessons.json`.

**KV (approved — nested, no new pattern):** stored under `user:{userId}:settings.growth` →
```ts
settings.growth = {
  byQuarter: {
    'YYYY-Q1': { goals: [{styleId, target, progress}], completedLessons: [lessonId], reassessmentDue: ISOString },
    ...
  }
}
```
Reads/writes go through the existing settings get/set; no prefix-scan needed since per-teacher volume is ~4 rows/year.

**Tab bar update (Teacher):** Home · Classes · Growth · Reports · Profile.

### 17.4 Younger Children (split Kids tier)
Already incorporated above in §6.1. Additional spec deltas:

- **Question banks:** Kids-Jr 18 questions, all `card_select` or `audio_response` (no Likert). Kids-Sr 24 questions, mix in `multiple_choice`.
- **Session length:** Kids-Jr 8 min hard cap (auto-pause and resume); Kids-Sr 12 min.
- **Sign-up §5.4:** for ages 7–9, parental email + verified parental account is mandatory; child cannot sign in independently (uses parent's device with a PIN gate). For 10–12, child can have own login but parent gets weekly digest email.
- **Mascot:** "Jot" the mascot narrates Kids-Jr; Kids-Sr keeps mascot but reduces narration.
- **Results screen §5.16:** Kids-Jr results show child-facing celebration view AND a separate parent-facing detail view (toggle behind PIN).

### 17.5 Counsellor Support Layer (In-App Human Support)
**Problem:** Complex needs require humans, not AI tips.

**New role:** Counsellor (licensed; verified at onboarding via credential upload + admin review).

**New screens (user side):**
- "Talk to a Counsellor" entry points: every Result with `risk` flag, Parent dashboard, Pro dashboard, Settings → Support.
- `/support/counsellor` — counsellor browse list (specialty, language, rating, availability).
- `/support/thread/:threadId` — async chat (text + voice notes, 10 MB cap), 24 h SLA reply.
- `/support/session/:sessionId` — scheduled video call (Daily.co embed for MVP).
- Intake flow before first message: 3-screen wizard collecting concern, urgency, consent to share recent results.

**Counsellor side:**
- `/counsellor/inbox` — triaged threads (urgency-sorted).
- `/counsellor/thread/:threadId` — chat + auto-generated **AI intake card** summarizing the user's last 3 results, recent reflections, risk flags. Counsellor can request more data; user explicitly approves each scope grant.
- `/counsellor/availability` — calendar slots.

**Storage (approved — dedicated tables outside KV):** Counsellor chat lives in two new Postgres tables, not the KV store. Clinical PHI requires distinct encryption, retention, and audit policies that the single-table KV is not designed for.

```sql
-- Threads
CREATE TABLE support_threads (
  thread_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counsellor_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  topic            text NOT NULL,
  urgency          text NOT NULL CHECK (urgency IN ('low','med','high','crisis')),
  status           text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  scope_grants     jsonb NOT NULL DEFAULT '[]'::jsonb,   -- [{key, grantedAt}]
  last_message_at  timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  closed_at        timestamptz
);
CREATE INDEX support_threads_user_idx       ON support_threads(user_id, last_message_at DESC);
CREATE INDEX support_threads_counsellor_idx ON support_threads(counsellor_id, urgency, last_message_at DESC);

-- Messages (append-only)
CREATE TABLE support_messages (
  msg_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id     uuid NOT NULL REFERENCES support_threads(thread_id) ON DELETE CASCADE,
  sender_id     uuid NOT NULL REFERENCES auth.users(id),
  body          text NOT NULL,
  attachments   jsonb NOT NULL DEFAULT '[]'::jsonb,      -- [{url, mime, sizeBytes}]
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX support_messages_thread_idx ON support_messages(thread_id, created_at);

-- RLS: only thread participants can read; only the sender can insert their own messages
ALTER TABLE support_threads  ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY support_threads_select ON support_threads
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = counsellor_id);
CREATE POLICY support_messages_select ON support_messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM support_threads t WHERE t.thread_id = support_messages.thread_id
    AND (t.user_id = auth.uid() OR t.counsellor_id = auth.uid())));
CREATE POLICY support_messages_insert ON support_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid() AND EXISTS (
    SELECT 1 FROM support_threads t WHERE t.thread_id = support_messages.thread_id
    AND (t.user_id = auth.uid() OR t.counsellor_id = auth.uid())
    AND t.status = 'open'));
```

**Encryption:** column-level encryption on `support_messages.body` and `attachments` using pgsodium or the Supabase Vault. Encryption keys rotated quarterly. Plaintext never logged.

**Retention:** default retention 7 years (configurable per jurisdiction). Soft-delete on user account deletion; hard purge after retention window via scheduled `support_purge` Edge Function.

**Audit:** every read of `support_messages` is logged to `support_access_log(thread_id, accessor_id, accessed_at, row_count)` via an `AFTER SELECT` security-definer view. (Postgres has no AFTER SELECT trigger; we expose access through a SECURITY DEFINER function `support_read_thread(thread_id)` that writes the audit row and returns the messages.)

**Realtime:** subscribe to `support_messages` filtered by `thread_id` via Supabase Realtime. RLS is enforced on the replication stream.

**API surface (new Edge Functions, not the `kv` function):**
- `support_thread_create({ counsellorId, topic, urgency, scopeGrants })`
- `support_thread_list()` — returns user's or counsellor's threads (role-aware)
- `support_thread_close(threadId)`
- `support_message_send(threadId, body, attachments?)`
- `support_thread_read(threadId)` — returns messages + writes audit row

**Migration tech debt:** none — this is the long-term home. The `kv_store` table is untouched.

**Crisis routing:** if intake answers indicate self-harm risk, app surfaces local hotline numbers (geo-aware) and recommends emergency services BEFORE queueing the counsellor thread.

**Compliance:** counsellor-side data subject to professional confidentiality terms; logged separately; not used for analytics.

### 17.6 Progressive Onboarding (Onboarding Complexity)
**Problem:** Frameworks + roles + modules overwhelm new users.

**Replace** the §5.8 3-step wizard with a **"first win in 60 seconds"** flow:

- **Student:** Welcome → 3-question taster (one curiosity, one logic, one self-reflection) → mini-result card ("You showed strong X today") → CTA to full assessment **later**. Settings deferred.
- **Parent:** Welcome → enter child's first name + age → demo insight card preview → CTA "Now let's add their account" deferred to first dashboard visit.
- **Teacher:** Welcome → "See a sample class" demo dashboard → "Set up your real class" CTA later. Org code can be entered later from `/profile/organization`.
- **Professional:** Welcome → sample client report walkthrough → "Add your first client" later.

**Persistent Setup Checklist card** on each dashboard for the first 7 days:
```
[✓] Create account
[ ] Complete full profile
[ ] Take your first full assessment
[ ] Invite parent/child (if applicable)
[ ] Set notification preferences
```
Dismissable but never auto-hidden until 100% or 7 days elapsed (whichever first).

**In-context tooltips:** every framework term (e.g., "Triarchic", "Metacognition") becomes a tappable info-dot opening a one-paragraph BottomSheet explainer. Never block flow with modals.

**Telemetry add (§12):** `onboarding_first_win_complete`, `setup_checklist_step_done`, `tooltip_opened:{term}`.

---

## 18. Updated Open Questions
- ~~Platform sign-off needed for new KV patterns.~~ **Resolved 2026-05-18:** Skill Builder = new pattern #13, Teacher Growth = nested in settings, Counsellor chat = dedicated tables (§17.5).
- Counsellor credential verification workflow — manual admin review for MVP, or third-party (e.g., Verified.org) integration?
- Crisis-routing geo data: do we ship the hotline JSON in-app or fetch at runtime?
- Tab bar at 5 items — accept, or move Profile to header avatar to keep 4?
- Encryption key management for `support_messages`: Supabase Vault vs pgsodium-managed keys vs external KMS?
- Retention default 7 years — confirm per launch jurisdiction (Ghana, US, EU each have different baselines).

---

*End of specification. Any change to the 12 KV key patterns, the scoring formulas, or the routing map must be coordinated with the platform team and reflected here before implementation.*
