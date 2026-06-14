# JotMinds Application Overview & Architecture

## 1. Executive Summary
JotMinds is a comprehensive digital platform designed to serve general users, educators (teachers), and professionals. The platform is currently evolving from a web-only application to a multi-platform ecosystem, introducing a touch-friendly, mobile-first MVP. 

## 2. Client Architecture & Routing
The frontend is built using React and Tailwind CSS. A major architectural shift is currently underway to standardize navigation:
- **Legacy Web Platform:** Originally utilized state-based navigation.
- **Mobile MVP & Modernization:** Implementing proper page-based routing using `react-router`. This reconciliation ensures that deep links (such as password resets and OAuth redirects) function seamlessly across both the main platform and the mobile app.
- **Mobile-First UI:** The MVP prioritizes touch-friendly interfaces, larger tap targets, and responsive layouts tailored for handheld devices.

## 3. Authentication & User Onboarding
JotMinds utilizes Supabase for robust authentication and user management, featuring several advanced flows:
- **Password Resets:** Integrated deep links allow users to securely reset their passwords, seamlessly routing them back into the app (mobile or web).
- **OAuth & Consent:** A dedicated `/oauth/consent` pathway handles secure third-party integrations and external data access authorizations.
- **Organization Auto-Linking:** The sign-up flow includes an 'Organization Invitation Code' field. When teachers or professionals register using this code, the system automatically validates the token and links their new account to the correct school or organization.

## 4. Backend Architecture: Single-Table Key-Value Store
The Supabase database is structured around a highly optimized, single-table Key-Value (KV) Store architecture. To ensure data consistency and query performance, the system strictly adheres to **12 Specific Key Patterns**:

1. `user:{uid}:profile` - Core demographic, role, and profile data for a user.
2. `user:{uid}:settings` - Application preferences, themes, and notification settings.
3. `org:{org_id}:meta` - High-level metadata for organizations and schools.
4. `org:{org_id}:members:{uid}` - Relational mapping of users to their connected organizations.
5. `invite:{invite_code}:org:{org_id}` - Stores active Organization Invitation Codes used during professional sign-ups.
6. `auth:reset:{token}` - Short-lived tokens tracking the deep-linked password reset flow.
7. `auth:oauth:{state}:consent` - Tracks active session state and permissions for the `/oauth/consent` flow.
8. `content:{item_id}:data` - The core user-generated content (notes, jots, resources).
9. `user:{uid}:content_index` - Chronological or categorical pointers to a user's content for rapid retrieval.
10. `teacher:{uid}:classes` - Educational metadata mapping teachers to their specific classrooms or groups.
11. `pro:{uid}:directory` - Public-facing or internal directory data for verified professionals.
12. `system:config:{version}` - Global application configurations, feature flags, and environment variables.

## 5. Current Deployment Status & Active Development
- **Active Task:** Reconciling the React Router DOM structure to ensure the mobile app MVP and web platform share a unified routing context.
- **Known Blocker:** A `403 Forbidden` error is currently occurring during Supabase deployment, specifically tied to Figma Make authentication. This typically indicates a mismatch in Row Level Security (RLS) policies, an expired authentication token, or restricted permissions for the deployment service role.