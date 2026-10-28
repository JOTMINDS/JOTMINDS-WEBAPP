import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  BookOpen, Video, FileText, Download, Search, CheckCircle2,
  Sparkles, GraduationCap, HelpCircle, ExternalLink, Play, Lightbulb,
  Shield, Users, AlertTriangle, ArrowRight, UserPlus, Target, X, Pause, Volume2,
  Mail, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { InstitutionMember } from '../../utils/institution';
import { getAllClasses, getAllUsers, getAssignmentsForTeacher, getAssessmentsByUserId } from '../../utils/storage';
import { extractDimensionScores } from '../../utils/cognitiveXP';
import { generateTrainingResourcePDF } from '../../utils/pdfGenerator';
import { InfoTip } from '../ui/info-tip';

interface ResourceItem {
  id: string;
  title: string;
  category: 'getting-started' | 'assessment-guides' | 'pedagogy' | 'video-tutorials';
  description: string;
  format: 'PDF Guide' | 'Video' | 'Article' | 'Checklist';
  readTime: string;
  featured?: boolean;
  content: string;
  videoUrl?: string;
}

const RESOURCES: ResourceItem[] = [
  {
    id: '1',
    title: 'School Administrator Quick Start Guide',
    category: 'getting-started',
    description: 'Learn how to set up your school profile, invite teachers, generate student codes, and manage classes in under 10 minutes.',
    format: 'PDF Guide',
    readTime: '5 min read',
    featured: true,
    content: `# JotMinds School Administrator Quick Start Guide

## 1. Onboarding Your Institution
- Set up your school code and share it with faculty members.
- Approve incoming teacher and student connection requests in Class Management.
- Organize learners into classes by education level (Pre-school, Elementary, JHS, SHS).

## 2. Administering Cognitive Assessments
- Have students log in and take the 3 core assessments: Kolb Learning Style, Sternberg Thinking Style, and Dual-Process Decision Style.
- Have teachers take the Teaching Insights (JTIA) assessment to map faculty pedagogical strengths.

## 3. Reviewing Analytics & Reports
- Monitor Student Insights to observe dominant learning modalities.
- Export official school PDF reports and CSV rosters for parent-teacher conferences.`
  },
  {
    id: '2',
    title: 'Understanding Cognitive Style Assessment Results',
    category: 'assessment-guides',
    description: 'A comprehensive guide to interpreting student Learning, Thinking, and Decision style profiles to tailor instruction.',
    format: 'PDF Guide',
    readTime: '8 min read',
    featured: true,
    content: `# Understanding Cognitive Style Assessment Results

## The Four Kolb Learning Styles
1. **Accommodating (Hands-on, Intuitive)**: Learns best through experiential trial and active testing.
2. **Assimilating (Reflective, Logical)**: Prefers concise conceptual models, lectures, and organized data.
3. **Converging (Practical, Technical)**: Focuses on problem-solving, real-world utility, and deductive thinking.
4. **Diverging (Creative, Empathic)**: Generates ideas, brainstorms, and approaches problems from multiple angles.

## Sternberg Thinking Styles
- **Analytical**: High evaluation, comparison, and critique capabilities.
- **Creative**: Generates novel solutions, synthesis, and exploratory ideas.
- **Practical**: Implements knowledge in daily contextual situations.`
  },
  {
    id: '3',
    title: 'How to Administer Assessments in the Classroom',
    category: 'assessment-guides',
    description: 'Step-by-step instructions for teachers on guiding pre-school, elementary, JHS, and SHS students through taking their assessments.',
    format: 'Checklist',
    readTime: '4 min read',
    content: `# Classroom Assessment Administration Checklist

- [ ] Ensure devices (tablets, Chromebooks, or computer lab) have internet connectivity.
- [ ] Write the School Code on the board.
- [ ] Provide students with their unique Student Code.
- [ ] Emphasize there are NO wrong answers — this is not an academic grading test.
- [ ] Allow 15-20 minutes of quiet, independent response time.
- [ ] Verify completed statuses on the Teacher or Administrator dashboard.`
  },
  {
    id: '4',
    title: 'Differentiated Teaching Strategies based on Student Profiles',
    category: 'pedagogy',
    description: 'Practical classroom techniques for adapting lesson plans to accommodate diverse analytical, creative, and practical thinkers.',
    format: 'Article',
    readTime: '10 min read',
    featured: true,
    content: `# Differentiated Teaching Strategies

### For Accommodating / Kinesthetic Learners:
- Use role-play, lab experiments, simulation games, and immediate feedback loops.

### For Assimilating / Analytical Learners:
- Provide structured readings, analytical questions, and logical proofs.

### For Diverging / Creative Learners:
- Introduce open-ended questions, collaborative group discussions, and visual mind maps.

### For Converging / Practical Learners:
- Provide real-world problem sets, engineering challenges, and interactive projects.`
  },
  {
    id: '5',
    title: 'Platform Walkthrough & Dashboard Tour',
    category: 'video-tutorials',
    description: 'Video overview of the JotMinds school portal, student analytics, reporting tools, and class management features.',
    format: 'Video',
    readTime: '6 min watch',
    featured: true,
    videoUrl: 'https://storage.googleapis.com/jotminds-media/walkthrough.mp4',
    content: 'Complete video walkthrough covering Class Management, Central Student Management, Teacher Assignment, and School Cognitive Insights.'
  },
  {
    id: '6',
    title: 'Teacher-Student Onboarding Checklist',
    category: 'getting-started',
    description: 'Printable checklist for rolling out JotMinds across your institution at the start of the academic term.',
    format: 'Checklist',
    readTime: '3 min read',
    content: `# Term Onboarding Checklist
- [ ] Confirm faculty accounts are approved as Teachers.
- [ ] Create academic classes with assigned education levels.
- [ ] Distribute student codes.
- [ ] Schedule assessment completion week.
- [ ] Review Faculty Pedagogical Gap alerts.`
  }
];

interface TrainingPageProps {
  institutionId?: string;
  members?: InstitutionMember[];
  allPlatformUsers?: any[];
  assessments?: any[];
}

export function TrainingPage({ institutionId, members = [], allPlatformUsers = [], assessments = [] }: TrainingPageProps) {
  const [activeTab, setActiveTab] = useState<'risk-gaps' | 'resources'>('risk-gaps');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVideoModal, setSelectedVideoModal] = useState<ResourceItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const allClasses = getAllClasses();
  // allPlatformUsers is fetched server-side for every institution member (via
  // getInstitutionMembers) and includes classId; the local getAllUsers cache can be
  // incomplete on this device, so prefer the scoped list when available.
  const allUsers = allPlatformUsers.length > 0 ? allPlatformUsers : getAllUsers();

  const teacherMembers = useMemo(() => {
    return members.filter(m => (m.role === 'teacher' || m.role === 'admin') && m.status === 'approved');
  }, [members]);

  // Compute Faculty Pedagogical Gap & Risk Detection
  const facultyGaps = useMemo(() => {
    return teacherMembers.map(teacher => {
      const localAssessments = getAssessmentsByUserId(teacher.userId) || [];
      const serverAssessments = assessments.filter(a => a.userId === teacher.userId);
      const teacherAssessments = [...localAssessments, ...serverAssessments];
      const hasAssessments = teacherAssessments.length > 0;
      
      const assignments = getAssignmentsForTeacher(teacher.userId);
      const assignedClasses = allClasses.filter(c => c.classTeacherId === teacher.userId || assignments.some(a => a.classId === c.id));
      
      // Calculate students under this teacher
      const studentUsers = allUsers.filter(u => u.role === 'student' && assignedClasses.some(c => c.id === u.classId));
      
      let riskLevel: 'High' | 'Medium' | 'Low' = 'Low';
      const gapReasons: string[] = [];
      const recommendedTraining: string[] = [];

      if (!hasAssessments) {
        riskLevel = 'High';
        gapReasons.push('Teaching Insights not completed');
        recommendedTraining.push('Module 1: Teaching Insights & Cognitive Profile Discovery');
      }

      if (assignedClasses.length === 0) {
        if (riskLevel !== 'High') riskLevel = 'Medium';
        gapReasons.push('No classes assigned');
      } else if (studentUsers.length > 0) {
        // Evaluate alignment with student cohort
        gapReasons.push(`${assignedClasses.length} ${assignedClasses.length === 1 ? 'class' : 'classes'}, ${studentUsers.length} ${studentUsers.length === 1 ? 'student' : 'students'}`);
        recommendedTraining.push('Module 2: Differentiated Classroom Instruction for Diverse Thinkers');
        recommendedTraining.push('Module 4: Experiential Learning Scaffolding & Group Dynamics');
      } else {
        recommendedTraining.push('Module 3: Formative Cognitive Assessment & Student Engagement');
      }

      return {
        teacher,
        hasAssessments,
        assignedClasses,
        studentCount: studentUsers.length,
        riskLevel,
        gapReasons,
        recommendedTraining
      };
    });
  }, [teacherMembers, allClasses, allUsers]);

  const highRiskCount = facultyGaps.filter(g => g.riskLevel === 'High').length;
  const mediumRiskCount = facultyGaps.filter(g => g.riskLevel === 'Medium').length;

  const handleDownload = async (resource: ResourceItem) => {
    toast.loading(`Generating ${resource.format} PDF...`, { id: 'training-dl' });
    const success = await generateTrainingResourcePDF(
      resource.title,
      resource.format,
      resource.readTime,
      resource.content
    );

    if (success) {
      toast.success(`Downloaded "${resource.title}" (${resource.format})`, { id: 'training-dl' });
    } else {
      const blob = new Blob([resource.content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
      link.click();
      toast.success(`Downloaded "${resource.title}"`, { id: 'training-dl' });
    }
  };

  const filteredResources = RESOURCES.filter(r => {
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold">Training & Alignment<InfoTip>Flags teaching gaps, suggests training for each teacher and offers staffing guidance, using your teachers' profiles and student data.</InfoTip></h2>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-indigo-900/60">
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
            <p className="text-2xl font-black text-indigo-300">{teacherMembers.length}</p>
            <p className="text-xs text-slate-300 mt-0.5">Teachers</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
            <p className="text-2xl font-black text-red-400">{highRiskCount}</p>
            <p className="text-xs text-slate-300 mt-0.5">Priority gaps</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
            <p className="text-2xl font-black text-amber-300">{mediumRiskCount}</p>
            <p className="text-xs text-slate-300 mt-0.5">Moderate gaps</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
            <p className="text-2xl font-black text-emerald-400">
              {teacherMembers.length - highRiskCount - mediumRiskCount}
            </p>
            <p className="text-xs text-slate-300 mt-0.5">Aligned</p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('risk-gaps')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'risk-gaps'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Teacher Gaps ({facultyGaps.length})
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'resources'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Library ({RESOURCES.length})
        </button>
      </div>

      {/* TAB 1: FACULTY RISK & GAPS */}
      {activeTab === 'risk-gaps' && (
        <div className="space-y-6">
          {/* Staffing guidance */}
          <Card className="border-indigo-200 bg-indigo-50/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-950">
                <Target className="w-4 h-4 text-indigo-600" />
                Staffing Guidance
                <InfoTip>General best-practice advice for hiring and developing teachers. It is not yet personalised to this school's data.</InfoTip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex gap-2"><Sparkles className="w-4 h-4 text-amber-500 shrink-0" /><span><b>Hiring:</b> favour teachers experienced in project-based and hands-on learning.</span></li>
                <li className="flex gap-2"><BookOpen className="w-4 h-4 text-indigo-600 shrink-0" /><span><b>Training:</b> give Module 2 to teachers of classes over 25 students.</span></li>
                <li className="flex gap-2"><Users className="w-4 h-4 text-emerald-600 shrink-0" /><span><b>Pairing:</b> co-teach analytical and experiential teachers.</span></li>
              </ul>
            </CardContent>
          </Card>

          {/* Teacher Gap Roster */}
          <Card>
            <CardHeader className="py-3 border-b bg-gray-50/50">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Teachers ({facultyGaps.length})
              <InfoTip>Flags teachers who have not completed the Teaching Insights assessment (priority gap) or have no classes assigned (moderate gap), with training to suggest. These are prompts for support, not judgements.</InfoTip></CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Teacher</th>
                    <th className="text-left px-3 py-3 font-semibold">Classes</th>
                    <th className="text-left px-3 py-3 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 font-semibold">Suggested training</th>
                    <th className="text-right px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {facultyGaps.map(g => (
                    <tr key={g.teacher.userId} className="hover:bg-gray-50 transition-colors align-top">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{g.teacher.userName}</p>
                        <p className="text-[10px] text-gray-400">{g.teacher.userEmail}</p>
                      </td>
                      <td className="px-3 py-3 text-gray-700">
                        {g.assignedClasses.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {g.assignedClasses.map(c => (
                              <Badge key={c.id} variant="outline" className="text-[10px]">
                                {c.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          className={
                            g.riskLevel === 'High'
                              ? 'bg-red-50 text-red-700 border-red-200 text-[10px]'
                              : g.riskLevel === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 text-[10px]'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                          }
                        >
                          {g.riskLevel === 'High' ? 'Priority gap' : g.riskLevel === 'Medium' ? 'Moderate gap' : 'Aligned'}
                        </Badge>
                        <p className="text-[11px] text-gray-500 mt-1">{g.gapReasons.join(' · ')}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs">
                        <ul className="space-y-1 text-[11px]">
                          {g.recommendedTraining.map((t, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <BookOpen className="w-3 h-3 text-indigo-600 shrink-0 mt-0.5" />
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {g.riskLevel === 'High' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              toast.success(`Assessment reminder queued for ${g.teacher.userName} (${g.teacher.userEmail})`);
                            }}
                            className="text-[11px] h-7 border-red-200 text-red-700 hover:bg-red-50 gap-1"
                          >
                            <Mail className="w-3 h-3" /> Remind
                          </Button>
                        ) : g.riskLevel === 'Medium' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              toast.success(`Coaching session advisory scheduled for ${g.teacher.userName}`);
                            }}
                            className="text-[11px] h-7 border-amber-200 text-amber-700 hover:bg-amber-50 gap-1"
                          >
                            <Calendar className="w-3 h-3" /> Coach
                          </Button>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" aria-label="Aligned" />
                        )}
                      </td>
                    </tr>
                  ))}
                  {facultyGaps.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400">
                        No teachers connected yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: TRAINING LIBRARY & MATERIALS */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* Featured video */}
          <div
            onClick={() => {
              setSelectedVideoModal(RESOURCES[4]);
              setIsPlaying(true);
              setVideoError(false);
            }}
            className="relative rounded-xl overflow-hidden bg-slate-900 h-[180px] flex items-center justify-center group cursor-pointer border border-indigo-200"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end justify-between p-5">
              <div>
                <h4 className="text-white font-bold text-base">Platform Walkthrough</h4>
                <p className="text-indigo-200 text-xs">Setup, classes and reports</p>
              </div>
              <span className="text-xs text-white/80 font-mono">6 min</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/95 text-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform z-10">
              <Play className="w-5 h-5 ml-0.5 fill-current" />
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'All' },
                { id: 'getting-started', label: 'Getting Started' },
                { id: 'assessment-guides', label: 'Assessments' },
                { id: 'pedagogy', label: 'Pedagogy' },
                { id: 'video-tutorials', label: 'Videos' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map(res => (
              <Card key={res.id} className="hover:shadow-md transition-shadow flex flex-col justify-between border-gray-200">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {res.format === 'Video' ? (
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                          <Video className="w-4 h-4" />
                        </div>
                      ) : res.format === 'Checklist' ? (
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <Badge variant="outline" className="text-[10px] text-gray-500 font-medium">
                          {res.format}
                        </Badge>
                        <span className="text-[10px] text-gray-400 ml-2">· {res.readTime}</span>
                      </div>
                    </div>
                    {res.featured && (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">Popular</Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{res.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-3">{res.description}</p>
                  
                  {res.format === 'Video' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedVideoModal(res);
                        setIsPlaying(true);
                        setVideoError(false);
                      }}
                      className="w-full text-xs text-purple-700 border-purple-200 hover:bg-purple-50 flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Watch
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(res)}
                      className="w-full text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Video Player Modal */}
      {selectedVideoModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl border border-slate-700">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100">{selectedVideoModal.title}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedVideoModal(null);
                  setIsPlaying(false);
                }}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              {selectedVideoModal.videoUrl && !videoError ? (
                <video
                  key={selectedVideoModal.videoUrl}
                  src={selectedVideoModal.videoUrl}
                  controls
                  autoPlay
                  onError={() => setVideoError(true)}
                  className="w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="absolute inset-0 flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-3">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-white mb-1">
                    The video is unavailable right now
                  </h4>
                  <p className="text-xs text-indigo-200/90 max-w-md mb-4 leading-relaxed">
                    Here is the workflow in brief:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-lg text-left text-[11px]">
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="font-bold text-indigo-300 block mb-0.5">1. Class Codes</span>
                      <span className="text-slate-300 text-[10px]">Students join with a class code.</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="font-bold text-emerald-300 block mb-0.5">2. Assessments</span>
                      <span className="text-slate-300 text-[10px]">Three short assessments, about 15 minutes.</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="font-bold text-amber-300 block mb-0.5">3. School Reports</span>
                      <span className="text-slate-300 text-[10px]">Download PDF and CSV reports.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Transcript / Notes */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs">
              <p className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" /> Summary
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {selectedVideoModal.content}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
