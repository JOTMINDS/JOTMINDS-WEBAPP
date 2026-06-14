# JotMinds User Flows - Complete Implementation Guide

## Overview

JotMinds serves four primary user types, each with distinct flows and purposes. This document clarifies the exact user journey for each role.

---

## 1. 👨‍🎓 STUDENT FLOW

**Purpose**: Discover personal cognitive profile for learning optimization

### Journey
```
Register → Take Assessments → Get Reports → Add Reflections → View Dashboard Trends
```

### Detailed Steps

1. **Registration**
   - Select role: "Student"
   - Provide: Name, Email, Password, Phone, School Name, Education Level (JHS/SHS/Tertiary)
   - School name must match teacher's school for automatic linking

2. **Dashboard Landing** (`StudentDashboard.tsx`)
   - Default view: Assessment Overview
   - See 3 assessment types:
     - **Your Learning Style** (Kolb) - Uncompleted/Completed status
     - **Your Thinking Style** (Sternberg) - Uncompleted/Completed status  
     - **Your Decision Making Style** (Dual-Process) - Uncompleted/Completed status

3. **Take Assessment**
   - Click "Start Assessment" on any uncompleted assessment
   - Component: `AssessmentTaking.tsx`
   - 12 personalized questions (seeded random algorithm)
   - Auto-save progress every question
   - Can pause and resume later

4. **Get Report**
   - Immediately after completing assessment
   - Component: `AssessmentReport.tsx`
   - Shows:
     - Cognitive style result
     - Score breakdown with visualizations
     - Personalized insights
     - Ghana education mapping (SHS tracks, careers)
     - Strengths and development areas

5. **Add Reflection**
   - Prompted after viewing report
   - Component: Built into `AssessmentReport.tsx`
   - Write thoughts, feelings, or action plans
   - Saved and viewable in Reflections tab

6. **View Dashboard Trends**
   - Main dashboard shows:
     - Assessment history with completion dates
     - Combined cognitive profile (all 3 assessments)
     - Progress trends over time
     - Reflection journal
   - Can retake assessments to see growth

### Key Features
- ✅ Takes assessments themselves
- ✅ Receives personalized reports
- ✅ Writes reflections
- ✅ Views trends over time
- ✅ Linked to teachers automatically by school

---

## 2. 👨‍🏫 TEACHER FLOW

**Purpose**: Understand student cognitive profiles to provide differentiated instruction

### Journey
```
Register → Students Auto-Linked by School → View Class Distribution → View Individual Student Profiles
```

### Detailed Steps

1. **Registration**
   - Select role: "Teacher"
   - Provide: Name, Email, Password, Phone, School Name
   - **Critical**: School name is the linking mechanism

2. **Dashboard Landing** (`TeacherDashboard.tsx`)
   - Default view: **Class Overview** (aggregate charts)
   - Students automatically appear from same school
   - No manual linking required

3. **View Class Distribution** (Default Tab)
   - Component: Class Overview tab
   - Shows:
     - Total students count
     - Assessment completion rate
     - Kolb Learning Styles distribution (Pie Chart)
     - Sternberg Thinking Styles distribution (Bar Chart)
     - Education level distribution (JHS/SHS/Tertiary)
     - Class-wide teaching insights

4. **View Individual Student Profiles** (Individual Students Tab)
   - Each student has dedicated tab
   - Shows per student:
     - **Cognitive Profile Summary**: Learning, Thinking, Decision styles
     - **Quick Insights**: 4-6 bullet points about how the student learns
     - **Top 3 Teaching Strategies**: Personalized to their profile
     - **Tailored Educational Resources**: Articles, guides, and tips
     - Button to view full detailed profile

5. **Full Student Profile View** (`StudentDetailView.tsx`)
   - **Cognitive Profile Tab**:
     - Learning dimensions radar chart
     - Style badges with assessment dates
     - Visual representations
   - **Teaching Strategies Tab**:
     - Complete list of evidence-based strategies
     - Areas for additional support
     - Development recommendations
   - **Progress & Notes Tab**:
     - Assessment history timeline
     - Teacher notes section (editable)
     - Track observations

6. **Access Resources** (Resources Tab)
   - General teaching materials
   - Differentiated instruction guides
   - Ghana education system context

### Key Features
- ❌ Does NOT take assessments
- ✅ Views student cognitive profiles
- ✅ Receives personalized teaching strategies per student
- ✅ Sees class-wide distributions
- ✅ Accesses tailored educational resources
- ✅ Can write notes on student progress
- 🔗 Students linked automatically by school name

### Onboarding Message
When no students are linked yet:
> "Students from [School Name] will automatically appear here once they register and complete their assessments. Students must select the same school name during registration to be linked to your class."

---

## 3. 👪 PARENT FLOW

**Purpose**: Understand child's cognitive profile to provide better support at home

### Journey
```
Register → Link Child by Email → View Child's Profile → Get Support Tips & Resources
```

### Detailed Steps

1. **Registration**
   - Select role: "Parent"
   - Provide: Name, Email, Password, Phone
   - No school required

2. **Dashboard Landing** (`ParentDashboard.tsx`)
   - Default view: Link Child section
   - Initially shows empty state

3. **Link Child**
   - Enter child's registered email address
   - Click "Send Link Request"
   - Backend sends request to child
   - Child must approve the link (appears in their dashboard)
   - Once approved, child appears in parent's dashboard

4. **View Child's Profile**
   - After linking approved:
   - Component: `ParentChildCognitiveReport.tsx`
   - Shows:
     - Child's learning style
     - Child's thinking style  
     - Child's decision-making style
     - Complete cognitive profile visualizations
     - Ghana education guidance

5. **Get Support Tips**
   - Component: `EducationalResources.tsx` (parent-specific)
   - Personalized to child's cognitive profile:
     - How to support their learning style at home
     - Activities that match their thinking style
     - Communication strategies
     - Study environment recommendations
     - Resources specific to Ghana education system

6. **Monitor Multiple Children**
   - Can link multiple children
   - Each child has separate profile view
   - Tabs for each linked child
   - Individual resources for each child's profile

### Key Features
- ✅ Can optionally take assessments (for self-understanding)
- ✅ Links children by email (requires child approval)
- ✅ Views children's cognitive profiles
- ✅ Receives personalized support tips
- ✅ Accesses home-learning resources
- ✅ Can link multiple children
- 🔐 Secure: Requires child approval

---

## 4. 💼 PROFESSIONAL/ORGANIZATION FLOW

**Purpose**: Assess cognitive profiles for team building, hiring, and professional development

### Journey
```
Register → Take Assessments → Get Professional Report → View Team Dashboard → Supervisor Review (Optional)
```

### Detailed Steps

1. **Registration**
   - Select role: "Professional/Organization"
   - Provide: Name, Email, Password, Phone, Organization Name, Organization Type, Position

2. **Dashboard Landing** (`ProfessionalDashboard.tsx`)
   - Default view: Assessment Overview + Organization metrics
   - Shows:
     - Personal assessment status
     - Team member count
     - Total assessments completed

3. **Take Assessments**
   - Same as student flow
   - 3 assessment types available
   - Component: `AssessmentTaking.tsx`

4. **Get Professional Report**
   - Component: `ProfessionalAssessmentReport.tsx`
   - Tailored for workplace context:
     - Cognitive strengths in professional setting
     - Team role fit analysis
     - Leadership style implications
     - Decision-making in business contexts
     - Communication preferences
     - Recommended roles and responsibilities

5. **View Team Dashboard**
   - See organization members (same organization)
   - Team cognitive diversity metrics
   - Hiring recommendations
   - Team composition insights

6. **Supervisor Review** (Optional)
   - If organization uses supervisor portal
   - Supervisor can view professional's profile
   - Add performance alignment notes
   - Component: `SupervisorReview.tsx`
   - Integrated with cognitive assessment data

### Key Features
- ✅ Takes assessments
- ✅ Receives professional/workplace context reports
- ✅ Views team/organization metrics
- ✅ Can be reviewed by supervisors
- ✅ Hiring and team-building insights
- ✅ Links to other professionals by organization name

---

## 5. 👔 SUPERVISOR FLOW (Separate Portal)

**Purpose**: Review professional employees' cognitive profiles and performance alignment

### Journey
```
Access Supervisor Portal → Sign In → View Employees → Review Cognitive Profiles → Add Performance Notes
```

### Detailed Steps

1. **Access Portal**
   - Separate entry point from main app
   - URL: Main landing page → "Supervisor Portal" button
   - Component: `SupervisorApp.tsx`

2. **Sign In**
   - Supervisor-specific authentication
   - Component: `SupervisorAuthForm.tsx`
   - Provide organization credentials

3. **Dashboard** (`SupervisorDashboard.tsx`)
   - View all professionals in organization
   - See who has completed assessments
   - Filter by department/position

4. **Review Employee Profiles**
   - Click on professional to view details
   - Component: `SupervisorReview.tsx`
   - Shows:
     - Complete cognitive assessment results
     - Learning, Thinking, Decision styles
     - Role alignment form
     - Performance rating
     - Strengths and development areas

5. **Add Performance Notes**
   - Integrated review form:
     - Role alignment assessment
     - Performance rating
     - Identified strengths
     - Development areas
     - Recommended actions
     - Professional development goals
     - Supervisor comments
   - Saved and linked to professional's profile

### Key Features
- ❌ Does NOT take assessments
- ✅ Views professionals' cognitive profiles
- ✅ Adds performance alignment notes
- ✅ Links cognitive data with workplace performance
- ✅ Separate portal for security
- 🔐 Organization-level access

---

## 6. 🔧 ADMIN FLOW (Special Access)

**Purpose**: Platform administration and user management

### Journey
```
Admin Login → Admin Dashboard → View All Users → Impersonate Users → Manage Platform
```

### Authentication
- Email: `Alex.Attachey@gmail.com`
- Password: `0248838540`
- Bypasses normal Supabase authentication

### Features
- View all users across all roles
- View all assessments
- View all schools
- Impersonate any user (view their dashboard)
- System statistics and analytics

### Component
- `AdminPanel.tsx` / `AdminDashboard.tsx`

---

## Role Comparison Matrix

| Feature | Student | Teacher | Parent | Professional | Supervisor | Admin |
|---------|---------|---------|--------|--------------|------------|-------|
| **Takes Assessments** | ✅ Yes | ❌ No | ✅ Optional | ✅ Yes | ❌ No | ❌ No |
| **Views Own Profile** | ✅ Yes | ❌ N/A | ✅ If taken | ✅ Yes | ❌ N/A | ✅ All |
| **Views Others' Profiles** | ❌ No | ✅ Students | ✅ Children | ✅ Team | ✅ Employees | ✅ All |
| **Linking Mechanism** | By School | By School | By Email | By Org | By Org | N/A |
| **Requires Approval** | ❌ No | ❌ No | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Educational Resources** | ✅ Personal | ✅ Teaching | ✅ Parenting | ✅ Professional | ❌ No | ❌ No |
| **Can Write Notes** | ✅ Reflections | ✅ On students | ✅ On children | ✅ Reflections | ✅ Reviews | ❌ No |
| **Dashboard Component** | StudentDashboard | TeacherDashboard | ParentDashboard | ProfessionalDashboard | SupervisorDashboard | AdminPanel |

---

## Linking & Privacy Rules

### Student ↔ Teacher Linking
- **Method**: Automatic by school name
- **Privacy**: Teachers see all students from their school
- **Approval**: Not required
- **Rationale**: School is a trusted institution boundary

### Child ↔ Parent Linking
- **Method**: Parent enters child's email
- **Privacy**: Child must approve the link request
- **Approval**: ✅ Required
- **Rationale**: Family relationships require explicit consent

### Professional ↔ Supervisor Linking
- **Method**: Automatic by organization name
- **Privacy**: Supervisors see all professionals in organization
- **Approval**: Not required (employment relationship)
- **Rationale**: Organizational hierarchy

---

## Implementation Files

### Core Routing
- `/App.tsx` - Main app with role-based routing

### Dashboards
- `/components/StudentDashboard.tsx`
- `/components/TeacherDashboard.tsx`
- `/components/ParentDashboard.tsx`
- `/components/ProfessionalDashboard.tsx`
- `/components/SupervisorDashboard.tsx`
- `/components/AdminDashboard.tsx`

### Shared Components
- `/components/AssessmentTaking.tsx` - Assessment interface
- `/components/AssessmentReport.tsx` - Results display
- `/components/StudentDetailView.tsx` - Teacher view of student
- `/components/EducationalResources.tsx` - Personalized resources
- `/components/CombinedCognitiveProfile.tsx` - Full profile view

### Supporting
- `/utils/storage.ts` - Linking functions
- `/utils/api.ts` - Backend API calls
- `/types/index.ts` - TypeScript types

---

## Key Design Decisions

1. **School-Based Linking for Teachers**
   - Automatic linking by school name
   - More practical than manual email linking
   - Aligns with institutional trust model
   - No approval needed (teacher is authority figure)

2. **Email-Based Linking for Parents**
   - Requires child approval
   - Protects student privacy
   - Allows parent visibility once approved
   - Supports multiple children per parent

3. **Organization-Based Linking for Professionals**
   - Automatic linking within organization
   - Supervisors can review without individual approval
   - Professional development context
   - Employment relationship implies consent

4. **Teachers Don't Take Assessments**
   - Teachers are facilitators, not subjects
   - Focus is on student cognitive profiles
   - Prevents confusion about role
   - Separate dashboard with no assessment prompts

5. **Default Views by Role**
   - Students: Assessment cards (action-focused)
   - Teachers: Class overview (aggregate data first)
   - Parents: Link child prompt (connection-focused)
   - Professionals: Assessment + team metrics

---

## Ghana Education Context

All user flows integrate Ghana-specific features:
- **JHS, SHS, Tertiary** education levels
- **SHS Track Recommendations** (Business, General Arts, etc.)
- **Career Suggestions** aligned with Ghana job market
- **School-Based Organization** matching Ghana education system

---

## Technical Architecture

```
Landing Page
    ↓
Authentication (Role Selection)
    ↓
Role Router (App.tsx)
    ├─→ Student → StudentDashboard
    ├─→ Teacher → TeacherDashboard  
    ├─→ Parent → ParentDashboard
    ├─→ Professional → ProfessionalDashboard
    └─→ Admin → AdminPanel

Supervisor Portal (Separate Entry)
    ↓
SupervisorAuthForm
    ↓
SupervisorDashboard
```

---

## Conclusion

Each role has a distinct, purpose-built flow:
- **Students** discover themselves
- **Teachers** understand their students
- **Parents** support their children
- **Professionals** optimize their careers
- **Supervisors** align teams
- **Admins** manage the platform

This separation ensures clarity, security, and optimal UX for each user type.
