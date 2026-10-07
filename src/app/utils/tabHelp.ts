/**
 * Plain-language descriptions of each dashboard tab, shown in an (i) tag beside the page
 * title. Tabs are buttons, so the tag cannot sit inside them.
 */
export type TabHelpMap = Record<string, string>;

export const TEACHER_TAB_HELP: TabHelpMap = {
  overview: 'A summary of your class: how many students have been assessed, the most common learning and thinking styles, and teaching ideas that suit them.',
  'manage-classes': 'Create classes and add students to them. Students in your classes appear in your other tabs.',
  students: 'Your class roster. Search for a student, open their cognitive profile and add your own observations.',
  preschool: 'The Early Years track for children aged 2 to 6. You record observations of play and milestones instead of giving tests.',
  analytics: 'Charts and tables about your class: learning, thinking and decision styles, dimensions, a student heatmap, and how your own styles compare with your students.',
  'lesson-planner': 'Create lesson plans in the format of your curriculum, add activities for every learner, build assessments, teach and reflect.',
  jtia: 'Teaching Insights is your own assessment of your teaching practice. The results are for your growth and are not used to rank teachers.',
};

export const STUDENT_TAB_HELP: TabHelpMap = {
  dashboard: 'Your starting point. Take your core assessments, play daily challenges and see your progress.',
  'daily-challenges': 'Short daily games that train memory, focus and problem solving. Finish them to keep your streak and earn XP.',
  'mood-meter': 'Check in with how you feel today. It helps you notice patterns in your energy and focus.',
  discoveries: 'Fun facts and ideas to explore.',
  'track-record': 'Everything you have completed, with your results over time.',
  profile: 'Your cognitive profile: how you learn, think and decide, with strengths and study tips.',
  'school-profile': 'Your school and class, your student code, and lessons or tasks your teacher shares.',
  'parent-access': 'Choose which parent or guardian can see your results and support your learning.',
  settings: 'Your account details and preferences.',
};

export const PARENT_TAB_HELP: TabHelpMap = {
  overview: 'Children linked to your account and a summary of their progress. Link a new child from here.',
  'my-cognitive-profile': 'Your own learning, thinking and decision styles, so you can see how you compare with your child.',
  'analytics-triad': 'Puts your profile, your observations of your child and your child\'s own results side by side. Differences are talking points, not problems.',
  children: 'Each child\'s profile, strengths and ideas for supporting them at home.',
  observations: 'Record what you notice about your child at home. It adds your view to their profile.',
  'teacher-observations': 'Feedback and suggested home actions shared by your child\'s teacher.',
  'profile-settings': 'Your account details and Kids Mode security.',
  feedback: 'Tell us what is working and what is not, or ask for help.',
};

export const PROFESSIONAL_TAB_HELP: TabHelpMap = {
  overview: 'Your cognitive profile at a glance, with strengths, scores and next steps.',
  assessments: 'The learning, thinking and decision assessments. Complete all three for a full profile.',
  'track-record': 'Your results over time, so you can see how you change.',
  reflections: 'Notes you write about your results. Writing them down helps you act on them.',
  feedback: 'Tell us what is working and what is not, or ask for help.',
};

export const INSTITUTION_TAB_HELP: TabHelpMap = {
  overview: 'A summary of your institution: members, classes, your institution code and activity.',
  manage_students: 'Add, approve and organise students, and give out student codes.',
  student_insights: 'Class and school-wide results for students: status, assessment completion and cognitive styles.',
  teacher_management: 'The faculty roster. Approve teachers, link them to classes and see their Teaching Insights.',
  teaching_analytics: 'How your teachers\' styles compare with each other and with your students.',
  class_management: 'Create classes, assign a class teacher and subject teachers, and add students.',
  lesson_planning: 'Lesson plans your teachers have saved and delivered, with their reflections.',
  preschool: 'The Early Years track for children aged 2 to 6.',
  reports: 'Create and download reports on your learners\' assessments.',
  training: 'Training suggestions and staffing insights from your teachers\' profiles.',
  settings: 'Your institution\'s name, logo, contact details and code settings.',
  profile: 'Your own administrator details and security settings.',
};

export const PRESCHOOL_TAB_HELP: TabHelpMap = {
  children: 'The children in the Early Years group. Open a child to see their growth and milestones.',
  assess: 'Record what you see a child do and which stage it shows: Emerging, Developing, Achieving or Extending.',
  activities: 'Ready-to-use play activities linked to the skills they build.',
  progress: 'Every observation in the order it was recorded, so you can see growth over time.',
  'class-insights': 'How the whole class is doing across the areas of development.',
  'teaching-insights': 'Practical ideas for supporting the areas where your class needs the most help.',
  parents: 'Share progress with families and give them simple home play ideas.',
  'school-insights': 'For school leaders: how children are progressing and how ready older children are for Primary 1.',
};

export const ADMIN_TAB_HELP: TabHelpMap = {
  dashboard: 'Platform-wide numbers: users, assessments and system health.',
  users: 'Search and manage every account on the platform.',
  institutions: 'Schools and institutions on the platform and their codes.',
  organizations: 'Organisation accounts and their members.',
  'assessment-engine': 'The assessments, questions and scoring that users take. Changes here affect everyone.',
  'ai-management': 'Settings and prompts for the AI features, and how much they are used.',
  content: 'Content used across the platform, such as career data and Brain Gym challenges.',
  gamification: 'XP, badges, streaks and challenges that students see.',
  analytics: 'Usage figures for the whole platform.',
  billing: 'Subscriptions and payments.',
  communications: 'Announcements and messages sent to users.',
  support: 'Support requests from users.',
  security: 'Security settings and alerts.',
  settings: 'Settings that affect everyone on the platform. Change with care.',
  'audit-logs': 'A record of who changed what and when.',
  developer: 'Technical details for developers. Not needed for everyday use.',
  backup: 'Backups of platform data and how to restore them.',
};

export const SUPER_ADMIN_TAB_HELP: TabHelpMap = {
  ...ADMIN_TAB_HELP,
  assessment: ADMIN_TAB_HELP['assessment-engine'],
  'item-bank-studio': 'Build and edit the item bank: domains, constructs, questions and the assessments made from them. Changes affect what users take.',
  'pilot-analytics': 'Results and usage from pilot schools, to check the assessments work as intended.',
  ai: ADMIN_TAB_HELP['ai-management'],
  'feature-flags': 'Switch features on or off for some or all users without a new release.',
};
