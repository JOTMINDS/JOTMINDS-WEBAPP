# Admin View: Organization Support

## Overview
We have enabled full support for Admins to view and impersonate Organization accounts (formerly/also known as Supervisors). This ensures that Admins can provide support and debug issues for Organization users directly from the Admin Panel.

## Changes Implemented

### 1. Admin Panel Updates (`components/AdminPanel.tsx`)
- Added 'Organization' to the role statistics and charts.
- Added specific color coding for 'Organization' role (Purple: `#8B5CF6`).
- Ensured Organization users appear in the User Directory table.
- Enabled "View Dashboard" button for Organization users.

### 2. Organization App Integration (`components/OrganizationApp.tsx`)
- Updated `OrganizationApp` to accept an optional `initialUser` prop.
- This allows the app to bypass its internal session check when an Admin is impersonating a user.
- Added `onLogout` prop to override the default logout behavior (which would sign out the Admin).

### 3. App Routing (`App.tsx`)
- Updated role checks to treat 'organization' and 'Supervisor' roles identically.
- When an Admin clicks "View Dashboard" for an Organization user:
  - `impersonatedUser` is set.
  - The view switches to `dashboard`.
  - `App.tsx` detects the 'organization' role and renders `OrganizationApp`.
  - `OrganizationApp` receives the impersonated user and a custom `onLogout` handler.
  - The custom `onLogout` handler (`handleBackToDashboard`) returns the Admin to the Admin Panel instead of logging them out.

### 4. Backend Updates (`supabase/functions/server/index.tsx`)
- Updated the `/supervisor/employees` endpoint to accept an optional `supervisorId` query parameter.
- **Security Rule:** Only users with `admin` role (or ID 'admin-001') can specify a `supervisorId` different from their own.
- This allows the Admin (while impersonating) to fetch the employee list for the *target organization*, not the Admin account itself.

### 5. Supervisor Dashboard (`components/SupervisorDashboard.tsx`)
- Updated to use `getAuthToken()` helper which supports Admin tokens.
- Updated to pass `supervisorId=${user.id}` in the API request.
- This ensures that when an Admin is viewing the dashboard, the backend knows which organization's data to return.

## How to Verify
1. Log in as Admin.
2. Go to Admin Panel.
3. Find a user with role 'Organization' or 'Supervisor'.
4. Click "View Dashboard".
5. You should see the "Organization Portal" with the correct Organization Name and Organization Code.
6. You should be able to see the list of Professionals belonging to that organization.
7. Clicking "Logout" (top right) should return you to the Admin Panel.
