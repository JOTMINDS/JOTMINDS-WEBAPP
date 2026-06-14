# Admin Access Documentation

## Admin Credentials

**Email:** `Alex.Attachey@gmail.com`  
**Password:** `0248838540`

## Features

The admin portal provides system-wide access and management capabilities:

### 1. **User Overview Dashboard**
- View total user statistics across all roles
- Real-time counts for:
  - Total Users
  - Students
  - Teachers
  - Parents
  - Professionals
  - Supervisors

### 2. **User Management Table**
- Searchable user directory
- Filter by name, email, or school/organization
- View user details including:
  - Name and email
  - Role (with color-coded badges)
  - School or organization affiliation
  - Education level (for students)
  - Registration date

### 3. **View as User**
- Click "View as User" to access any user's dashboard
- Experience the platform from the user's perspective
- View all their assessments, reports, and data
- "Back to Admin Panel" button always visible in top-right corner
- Works for all user roles:
  - Students
  - Teachers
  - Parents
  - Professionals
  - Supervisors

## How to Access

1. Navigate to the JotMinds landing page
2. Click "Get Started"
3. On the login form, enter:
   - Email: `Alex.Attachey@gmail.com`
   - Password: `0248838540`
4. You'll be taken directly to the Admin Dashboard

## Security Notes

- Admin credentials are hardcoded in `/utils/storage.ts`
- Admin role is not stored in the database (created on-the-fly during login)
- Admin cannot be registered through normal signup flow
- Admin session is separate from regular user sessions
- When viewing as a user, admin maintains ability to return to admin panel

## Use Cases

**System Monitoring:**
- Track platform adoption across different user types
- Monitor user registration trends
- Identify schools/organizations with most users

**User Support:**
- View any user's dashboard to troubleshoot issues
- Verify assessment results and reports
- Check student-teacher or parent-child linkages

**Quality Assurance:**
- Test platform features from different user perspectives
- Verify role-specific functionality
- Check data integrity across user types

**Data Analysis:**
- Review assessment completion rates
- Analyze user engagement patterns
- Identify areas for platform improvement

## Admin Panel Features

### Statistics Cards
- Quick overview of platform usage
- Color-coded by role type
- Updates in real-time

### User Search
- Search across name, email, and school/organization
- Instant filtering
- Case-insensitive search

### User Actions
- "View as User" button for each user
- Seamless switching between user perspectives
- Quick return to admin panel

## Important Notes

1. **No Data Modification:** Admin can view but cannot directly modify user data through the interface (would need to use browser console or direct storage access)

2. **Session Persistence:** Admin session persists like regular user sessions

3. **Logout Behavior:** Logging out from admin panel returns to landing page

4. **User Privacy:** Admin has full access to all user data - use responsibly

5. **Testing:** Ideal for testing new features across different user types

## Future Enhancements (Potential)

- User editing/deletion capabilities
- Export user data to CSV
- Assessment analytics dashboard
- Platform usage metrics
- Bulk operations (e.g., reset assessments)
- Email notifications to users
- Platform-wide announcements
