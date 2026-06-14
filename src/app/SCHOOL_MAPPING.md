# School Mapping System

## Overview
JotMinds now includes an automatic school mapping system that connects students and teachers from the same school.

## How It Works

### For Students and Teachers
- **School Name Field**: Only Students and Teachers see the "School Name" field during registration
- **Automatic Mapping**: Students and teachers from the same school are automatically connected
- **Case-Insensitive**: School names are matched regardless of capitalization or extra spaces
- **Real-time Updates**: Teachers can see all students from their school immediately

### For Parents
- **Manual Linking**: Parents can link their children's accounts by entering the child's email address
- **Multiple Children**: Parents can link multiple children to their account
- **View Progress**: Once linked, parents can view each child's assessment results and progress
- **Unlink Option**: Parents can unlink children at any time if needed

### For Professionals
- **No School Field**: Professionals/Organizations do not have school-related fields
- **Organization Fields**: They see Organization Name, Organization Type, and Position/Role instead

## Key Features

### Teacher Dashboard
- Shows all students from the teacher's school
- Displays school name with student count in the header
- Automatic filtering by school

### Student Dashboard
- Shows school name badge in the profile section
- Students remain linked to their school across sessions

### Parent Dashboard
- **Link Child Form**: Enter child's email to connect their account
- **Child Tabs**: Switch between multiple linked children
- **School Display**: See which school each child attends
- **Unlink Button**: Remove children from parent's view if needed

## Storage Functions

### School Mapping
- `getStudentsBySchool(schoolName)` - Get all students from a specific school
- `getTeachersBySchool(schoolName)` - Get all teachers from a specific school
- `mapStudentsToTeacher(teacherId)` - Auto-map students to teacher by school
- `getAllSchools()` - Get all schools with student/teacher counts

### Parent-Child Linking
- `linkChildToParent(parentId, childEmail)` - Link a child to parent's account
- `unlinkChildFromParent(parentId, childId)` - Remove child from parent's account
- `getLinkedChildren(parentId)` - Get all children linked to a parent

## User Experience

### When a Teacher Registers
1. Selects "Teacher" role
2. Enters school name
3. System automatically finds all students from that school
4. Students appear in teacher's dashboard immediately

### When a Parent Registers
1. Selects "Parent" role
2. Completes registration (no school field)
3. On dashboard, uses "Link Child" form
4. Enters child's email address
5. Child's data appears in parent's dashboard

### When a Student Registers
1. Selects "Student" role
2. Enters school name
3. Becomes visible to all teachers from that school
4. Can be linked by parents using their email

## Data Privacy
- Parents can only view data for children they've explicitly linked
- Teachers can only view students from their school
- School names are normalized for consistent matching
- All relationships are stored locally and can be modified
