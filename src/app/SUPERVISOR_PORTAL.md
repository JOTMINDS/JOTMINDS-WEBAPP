# Supervisor Portal - Organizational Assessment Management

## Overview

The JotMinds Supervisor Portal is a separate application designed specifically for organizational supervisors, HR managers, and team leads to review and manage cognitive assessments completed by professionals in their organization.

## Features

### 1. Separate Application Experience
- **Dedicated Portal**: Completely separate from the main JotMinds application
- **Distinct Authentication**: Supervisors register and login through a dedicated interface
- **Role-Based Access**: Only users with the 'supervisor' role can access this portal

### 2. Organizational Dashboard
- **Overview Statistics**:
  - Total professionals in the organization
  - Number of assessed professionals
  - Fully assessed employees (completed all 3 assessments)
  - Total reviews completed
  
- **Team Member Management**:
  - View all professionals from the same organization
  - Search and filter by name, email, or position
  - See assessment completion status for each team member
  - Track review history

### 3. Professional Assessment Review
- **Cognitive Profile Summary**: View completed assessments for each professional
  - Learning Style (Kolb)
  - Thinking Style (Sternberg)
  - Decision Style (Dual-Process)

- **Suggested Role Alignment**: AI-suggested roles based on cognitive profiles

- **Structured Review Form**:
  - Role alignment assessment
  - Performance rating
  - Observed strengths
  - Development areas
  - Recommended actions and development plans
  - Performance goals for next review period
  - Additional supervisor comments

### 4. Review History
- All reviews are saved and tracked over time
- View historical feedback and development progress
- Date-stamped reviews for continuous performance management

## How to Access

### From Landing Page
1. Click the "Supervisor Portal" button in the top-right corner of the landing page
2. This will take you to the supervisor authentication screen

### Direct Access
The supervisor portal is a separate application flow that exists independently from the main user dashboards.

## Registration Process

### As a Supervisor
1. Access the Supervisor Portal
2. Click "Register"
3. Provide:
   - Full Name
   - Email
   - Phone Number
   - Organization Name
   - Organization Type (Corporate, NGO, Government, Startup, Educational Institution, Other)
   - Position/Role (e.g., HR Manager, Team Lead)
4. Submit registration

### Important Notes
- Supervisors are automatically matched with professionals who register with the **same organization name**
- Organization names are case-insensitive for matching purposes
- Supervisors can only view professionals from their organization

## Using the Portal

### Step 1: Login
- Use your supervisor credentials to access the portal
- You'll be redirected to the organizational dashboard

### Step 2: View Overview
- See overall statistics about your organization's assessment progress
- Quick access to recently active professionals

### Step 3: Review Professionals
- Navigate to the "Professionals" tab
- Select a team member from the list
- View their completed assessments

### Step 4: Complete Reviews
- Click "New Review" to add feedback
- Fill out the structured review form
- Review suggestions are based on cognitive assessment results
- Submit the review to save it permanently

### Step 5: Track Progress
- View review history for each professional
- Monitor development over time
- Use insights for role assignments and development planning

## Use Cases

### 1. Employee Fit Assessment
- Evaluate how well an employee's cognitive profile matches their current role
- Identify potential for role changes or promotions
- Make data-driven decisions about team composition

### 2. Continuous Performance Review
- Conduct regular cognitive-based performance reviews
- Track development against previously set goals
- Provide targeted feedback aligned with natural cognitive strengths

### 3. Talent Development
- Identify development areas based on cognitive profiles
- Create personalized development plans
- Suggest training opportunities that align with thinking styles

### 4. Team Building
- Understand the diverse cognitive profiles within teams
- Balance teams with complementary thinking styles
- Improve collaboration through cognitive awareness

## Data Privacy

- Supervisors can only see professionals from their organization
- Reviews are stored securely in browser local storage
- Each review is timestamped and attributed to the supervisor who created it
- Professionals in the main app do not currently see supervisor reviews (future feature)

## Technical Details

### New Components
- `SupervisorApp.tsx`: Main supervisor application entry point
- `SupervisorAuthForm.tsx`: Dedicated authentication for supervisors
- `SupervisorDashboard.tsx`: Organizational overview and professional management
- Updated `SupervisorReview.tsx`: Enhanced to save reviews to storage

### Storage
- Reviews are stored in localStorage under the key `ts_supervisor_reviews`
- Each review includes:
  - Unique ID
  - Supervisor ID
  - Professional ID
  - All review form data
  - Creation timestamp

### Type Updates
- Added `'supervisor'` to `UserRole` type
- Created `SupervisorReviewData` interface
- Made `school` property optional in `User` interface (not needed for supervisors)

## Future Enhancements

Potential features for future development:
- Allow professionals to view supervisor reviews in their dashboard
- Email notifications when reviews are completed
- Review templates for different roles/positions
- Export review history to PDF
- Analytics and insights across the organization
- Integration with HRIS systems
- Review reminders and scheduling
