# JotMinds: Full System Review & Architecture Overview

This document provides a comprehensive deep dive into the JotMinds platform. It details exactly how the application functions as a cohesive unit, the specific engines driving the platform, and an exhaustive breakdown of every user role and their workflows.

---

## Part 1: How the App Works as a Whole (The "Engines")

JotMinds operates on three primary "engines" that seamlessly connect the user interface to the backend database. 

### 1. The Frontend & Routing Engine (React & React Router)
JotMinds is evolving into a unified multi-platform ecosystem:
* **The Interface:** Built with React and Tailwind CSS. The new Mobile MVP introduces a "mobile-first" engine with touch-friendly UI components, larger tap targets, and responsive behaviors.
* **The Router (The "Traffic Controller"):** The application is transitioning from legacy state-based navigation to **React Router's Data Mode** (`createBrowserRouter`). This ensures that navigating the app on the web and on mobile uses the exact same routing logic.
* **Deep Linking Engine:** Because routing is unified, secure deep-links work flawlessly across platforms. If a user clicks a password reset link or an `/oauth/consent` authorization link on their phone, the router correctly intercepts the link, parses the token, and renders the correct screen.

### 2. The Database Engine (Supabase Single-Table KV Store)
Instead of a traditional relational SQL database with complex joins, JotMinds uses a highly optimized **Single-Table Key-Value (KV) Store** engine in Supabase. Everything in the app is queried using 12 strict key patterns. 
* *Example Data Flow:* When a user loads the app, the engine queries `user:{uid}:profile` and `user:{uid}:settings`. To load their dashboard, it queries `user:{uid}:content_index` to find their jots, and then fetches the actual text from `content:{item_id}:data`. 
* This makes the backend incredibly fast and scalable, especially for mobile devices requiring low-latency data fetching.

### 3. The Authentication & Auto-Linking Engine
Powered by Supabase Auth, this engine handles secure access.
* **The "Magic" Invite System:** The standout feature is the **Organization Invitation Code**. When a user signs up, the Auth Engine intercepts the code, validates it against the database (`invite:{invite_code}:org:{org_id}`), and automatically creates a relational link (`org:{org_id}:members:{uid}`). This bypasses the need for manual admin approvals and drops the user directly into their company or school workspace.
* **OAuth Engine:** A dedicated `/oauth/consent` path securely manages third-party integrations (e.g., if a school wants to link JotMinds to their LMS). It stores active sessions in `auth:oauth:{state}:consent`.

---

## Part 2: Detailed User Roles & Workflows

JotMinds is segmented into five distinct user roles. Here is exactly what each role does and how they interact with the system's engines.

### 1. General Users (Personal Use)
* **What they do:** Use JotMinds as a personal brain-hub. They create standalone notes ("jots"), track daily habits, and manage personal projects.
* **System Interaction:** They exist entirely in their own data silo. The app fetches their `user:{uid}:profile` and their personal `content:{item_id}:data`.
* **Mobile Workflow:** They heavily utilize the mobile app for rapid, on-the-go idea capture. The mobile UI prioritizes a quick "New Jot" button.

### 2. Students
* **What they do:** Consume educational content, organize their study materials, and collaborate with peers.
* **System Interaction:** Once enrolled in a class, their account is granted read-access to specific classroom data. They can view "jots" published by their teachers.
* **Workflows:** They can organize their own class notes (saved to their personal index) alongside institutional materials shared by the school.

### 3. Educators & Teachers
* **What they do:** Create lesson plans, manage classrooms, and distribute educational resources to students.
* **Onboarding Workflow:** A teacher receives an invite code from their IT department. During sign-up, they enter this code. The Auto-Linking Engine instantly verifies it and ties them to the school.
* **System Interaction:** The system generates a `teacher:{uid}:classes` metadata key. The teacher uses the web dashboard to create rich-text lessons, attach resources, and publish them to specific class groups.

### 4. Professionals & Corporate Employees
* **What they do:** Take meeting notes, document project deliverables, and access corporate knowledge bases.
* **Onboarding Workflow:** Similar to teachers, they use an Organization Invitation Code to join their company's secure workspace.
* **System Interaction:** Their profile is added to the public/internal directory (`pro:{uid}:directory`). They can search this directory to find colleagues and share structured notes securely within the enterprise firewall.

### 5. Organization Administrators (IT Leads, Principals, HR)
* **What they do:** Manage the platform at the institutional level, ensuring security, user management, and seamless onboarding.
* **System Interaction:** Admins have write-access to high-level organization metadata (`org:{org_id}:meta`). 
* **Workflows:**
  * **Invite Generation:** They generate the active invite codes (`invite:{invite_code}:org:{org_id}`) that teachers and professionals use to sign up.
  * **OAuth Management:** They oversee third-party integrations, approving what external apps can access the organization's JotMinds data via the `/oauth/consent` flow.
  * **Offboarding:** They can revoke a user's access by deleting the `org:{org_id}:members:{uid}` key, instantly locking the departed employee/student out of the institutional workspace while allowing them to keep their personal "jots."