import { useState, useEffect, useMemo } from 'react';
import { User, Assessment, TeacherObservation } from '../../types';
import { saveTeacherObservation } from '../../utils/storage';
import { MessageSquare } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { 
  Users, 
  BookOpen, 
  Brain, 
  Target, 
  Lightbulb, 
  FileText, 
  ChevronDown, 
  ExternalLink,
  Sparkles,
  TrendingUp,
  Send,
  Link2,
  Loader,
  Search,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { formatDate } from '../../utils/dateFormat';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { StudentDetailView } from '../StudentDetailView';
import { KidsCognitiveProfile } from '../kids/KidsCognitiveProfile';
import { sendStudentReminder } from '../../utils/api';
import { generateAITeachingStrategies, AIStudentTeachingStrategies } from '../../utils/aiService';
import { toast } from 'sonner';

interface TeacherIndividualStudentViewProps {
  students: User[];
  assessments: Assessment[];
  initialStudentId?: string | null;
  teacher?: User;
}

export function TeacherIndividualStudentView({ students, assessments, initialStudentId, teacher }: TeacherIndividualStudentViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    initialStudentId || (students.length > 0 ? students[0].id : null)
  );

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
      setViewFullProfile(true);
    }
  }, [initialStudentId]);
  
  const [isQuickInsightsOpen, setIsQuickInsightsOpen] = useState(true);
  const [isStrategiesOpen, setIsStrategiesOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [viewFullProfile, setViewFullProfile] = useState(false);
  
  const [aiStrategies, setAiStrategies] = useState<AIStudentTeachingStrategies | null>(null);
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  // Teacher Observation Modal State
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [concernType, setConcernType] = useState<'Academic Focus' | 'Behavioral / Attention' | 'Social Interaction' | 'Learning Pace' | 'Commendation'>('Academic Focus');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [subject, setSubject] = useState('');
  const [observationText, setObservationText] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const lowerQ = searchQuery.toLowerCase();
    return students.filter(s => s.name.toLowerCase().includes(lowerQ));
  }, [students, searchQuery]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  
  if (!selectedStudent) {
    return (
      <div className="p-4 lg:p-6 max-w-[960px] mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No students found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If viewing full profile, show the detailed view
  if (viewFullProfile) {
    const studentAge = selectedStudent.age;
    const isKidsMode = studentAge && studentAge >= 6 && studentAge <= 10;

    if (isKidsMode) {
      return (
        <KidsCognitiveProfile
          user={selectedStudent}
          onClose={() => setViewFullProfile(false)}
          isParentView={true}
        />
      );
    }

    return (
      <StudentDetailView
        student={selectedStudent}
        assessments={assessments}
        onBack={() => setViewFullProfile(false)}
      />
    );
  }

  // Get student assessments
  const studentAssessments = assessments.filter(
    a => a.userId === selectedStudentId && (a.completed || a.completedAt)
  );
  
  const latestLearning = studentAssessments
    .filter(a => a.type === 'kolb' || (a.type as any) === 'learning')
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
  
  const latestThinking = studentAssessments
    .filter(a => ['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type))
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
  
  const latestDecision = studentAssessments
    .filter(a => a.type === 'dual-process' || (a.type as any) === 'decision')
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];

  const completedCount = [latestLearning, latestThinking, latestDecision].filter(Boolean).length;
  const hasAssessments = completedCount > 0;

  // Get education level
  const getEducationLevel = (student: User) => {
    if (student.age && student.age <= 10) return 'Primary';
    if (student.age && student.age <= 14) return 'JHS';
    if (student.age && student.age <= 17) return 'SHS';
    return 'Tertiary';
  };


  useEffect(() => {
    async function fetchStrategies() {
      if (!selectedStudent || !hasAssessments) {
        setAiStrategies(null);
        return;
      }
      setIsLoadingStrategies(true);
      try {
        const data = {
          name: selectedStudent.name,
          learningStyle: latestLearning?.score,
          thinkingStyle: latestThinking?.score,
          decisionStyle: latestDecision?.score,
          age: selectedStudent.age
        };
        const result = await generateAITeachingStrategies(data);
        if (result) {
          setAiStrategies(result);
        }
      } catch (e) {
        console.error('Failed to fetch AI strategies:', e);
      } finally {
        setIsLoadingStrategies(false);
      }
    }
    fetchStrategies();
  }, [selectedStudent, latestLearning, latestThinking, latestDecision]);

  const quickInsights = aiStrategies?.quickInsights || [];
  const teachingStrategies = aiStrategies?.teachingStrategies || [];
  const educationalResources = aiStrategies?.educationalResources || [];
return (
    <div className="min-h-screen bg-[#F5F7FF] py-6">
      <div className="px-4 lg:px-8 max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Sidebar: Student Roster */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
          <Card className="rounded-2xl shadow-sm border-none bg-white">
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-[15px] font-semibold mb-1">Student Roster</h2>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    {students.length} Students Total
                  </p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search students..." 
                  className="pl-9 bg-[#F8FAFC] border-none rounded-xl h-10 text-[13px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {teacher?.classCode && (
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-3 rounded-xl flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold text-[#1E40AF] uppercase tracking-wider">Class Code</p>
                    <p className="text-[13px] font-mono font-bold text-[#1E3A8A]">{teacher.classCode}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] bg-white border-[#93C5FD] text-[#1E40AF] hover:bg-[#DBEAFE] rounded-lg px-2.5"
                    onClick={() => {
                      navigator.clipboard.writeText(teacher.classCode!);
                      toast.success('Class code copied to clipboard!');
                    }}
                  >
                    Copy Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-none bg-white flex-1 overflow-hidden flex flex-col max-h-[600px]">
            <div className="overflow-y-auto p-2 scrollbar-hide">
              {filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-[13px] text-muted-foreground">
                  No students match your search.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredStudents.map((student) => {
                    const studentCompletedCount = [
                      assessments.find(a => a.userId === student.id && (a.type === 'kolb' || (a.type as any) === 'learning') && (a.completed || a.completedAt)),
                      assessments.find(a => a.userId === student.id && ['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type) && (a.completed || a.completedAt)),
                      assessments.find(a => a.userId === student.id && (a.type === 'dual-process' || (a.type as any) === 'decision') && (a.completed || a.completedAt))
                    ].filter(Boolean).length;
                    
                    const isSelected = student.id === selectedStudentId;
                    
                    return (
                      <button
                        key={student.id}
                        onClick={() => setSelectedStudentId(student.id)}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left
                          ${isSelected ? 'bg-primary/5 shadow-sm' : 'hover:bg-accent/50'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-semibold flex-shrink-0 ${isSelected ? 'bg-gradient-to-br from-[#2563EB] to-[#7C3AED]' : 'bg-[#94A3B8]'}`}>
                            {student.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-[14px] font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                              {student.name}
                            </span>
                            <span className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1">
                              {studentCompletedCount === 3 ? (
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                              ) : (
                                <Circle className="w-3 h-3 text-orange-400" />
                              )}
                              {studentCompletedCount}/3 Complete
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          {/* Selected Student Header Card */}
          <Card className="rounded-2xl shadow-sm border-none bg-white">
            <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Left: Avatar + Name + Level */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-[20px] font-bold shadow-sm">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-[#1E293B]">{selectedStudent.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[12px] font-medium bg-[#DBEAFE] text-[#1E40AF]">
                      {getEducationLevel(selectedStudent)}
                    </Badge>
                    <Badge className={`rounded-md px-2 py-0.5 text-[12px] font-medium ${completedCount === 3 ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}`}>
                      {completedCount}/3 Assessments Complete
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-full text-[13px] font-medium border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100 flex-shrink-0"
                  onClick={() => setShowObservationModal(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-2 text-purple-600" />
                  Teacher Observation
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-full text-[13px] font-medium border-border hover:bg-accent flex-shrink-0"
                  onClick={() => setViewFullProfile(true)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {hasAssessments ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Cognitive Profile Section (Left side on extra large screens) */}
              <div className="xl:col-span-5 space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Brain className="h-5 w-5 text-primary" />
                  <h3 className="text-[16px] font-semibold text-[#1E293B]">Cognitive Profile</h3>
                </div>

                <div className="grid gap-4">
                  {/* Learning Style */}
                  {latestLearning && (
                    <Card className="rounded-xl border-none shadow-sm bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BookOpen className="w-24 h-24" />
                      </div>
                      <CardContent className="p-5 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[13px] font-semibold tracking-wider uppercase text-[#166534]">Learning Style</span>
                        </div>
                        <h4 className="text-[24px] font-bold text-[#14532D] mb-1">
                          {((latestLearning.score as any).kolb || (latestLearning.score as any).learning)?.style}
                        </h4>
                        <p className="text-[12px] font-medium text-[#15803D]">
                          Learning Style • Assessed {formatDate(latestLearning.completedAt!)}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Thinking Style */}
                  {latestThinking && (
                    <Card className="rounded-xl border-none shadow-sm bg-gradient-to-br from-[#FAF5FF] to-[#F3E8FF] overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Brain className="w-24 h-24" />
                      </div>
                      <CardContent className="p-5 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[13px] font-semibold tracking-wider uppercase text-[#6B21A8]">Thinking Style</span>
                        </div>
                        <h4 className="text-[24px] font-bold text-[#581C87] mb-1">
                          {(() => {
                            if (latestThinking.type === 'sternberg') return latestThinking.score.sternberg?.style;
                            if (latestThinking.type === 'jhs-thinking') {
                              const s = latestThinking.score['jhs-thinking']?.primaryStyle;
                              return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Assessed';
                            }
                            if (latestThinking.type === 'shs-thinking') return latestThinking.score['shs-thinking']?.primaryStyle || 'Assessed';
                            if (latestThinking.type === 'adult-thinking') {
                              const s = latestThinking.score['adult-thinking']?.dominantStyle;
                              return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Assessed';
                            }
                            if (latestThinking.type === 'child-thinking') return latestThinking.score['child-thinking']?.primaryStyle || 'Assessed';
                            return 'Unknown';
                          })()}
                        </h4>
                        <p className="text-[12px] font-medium text-[#7E22CE]">
                          Thinking Style • Assessed {formatDate(latestThinking.completedAt!)}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Decision Style */}
                  {latestDecision && (
                    <Card className="rounded-xl border-none shadow-sm bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Target className="w-24 h-24" />
                      </div>
                      <CardContent className="p-5 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[13px] font-semibold tracking-wider uppercase text-[#C2410C]">Decision Style</span>
                        </div>
                        <h4 className="text-[24px] font-bold text-[#9A3412] mb-1">
                          {((latestDecision.score as any).dualProcess || (latestDecision.score as any).decision || (latestDecision.score as any)['dual-process'])?.style}
                        </h4>
                        <p className="text-[12px] font-medium text-[#EA580C]">
                          Dual-Process Decision Making • Assessed {formatDate(latestDecision.completedAt!)}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Actionable Insights Section (Right side) */}
              <div className="xl:col-span-7 space-y-4">
                {/* Quick Insights */}
                {quickInsights.length > 0 && (
                  <Collapsible open={isQuickInsightsOpen} onOpenChange={setIsQuickInsightsOpen}>
                    <Card className="rounded-2xl shadow-sm border-none bg-white">
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="p-5 pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-[#3B82F6]" />
                              <CardTitle className="text-[16px] text-[#1E293B]">
                                Quick Insights
                              </CardTitle>
                            </div>
                            <ChevronDown 
                              className={`h-5 w-5 text-muted-foreground transition-transform ${isQuickInsightsOpen ? 'rotate-180' : ''}`} 
                            />
                          </div>
                          <CardDescription className="text-[13px] text-left mt-1">
                            Key characteristics based on cognitive profile
                          </CardDescription>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="p-5 pt-0 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {isLoadingStrategies ? (
                          <div className="flex justify-center p-4"><Loader className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                        ) : quickInsights.map((insight, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-slate-100"
                              >
                                <span className="text-lg flex-shrink-0 mt-0.5">{insight.icon}</span>
                                <p className="text-[13px] text-[#334155] leading-relaxed">{insight.text}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )}

                {/* Teaching Strategies */}
                {teachingStrategies.length > 0 && (
                  <Collapsible open={isStrategiesOpen} onOpenChange={setIsStrategiesOpen}>
                    <Card className="rounded-2xl shadow-sm border-none bg-white">
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="p-5 pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="h-5 w-5 text-[#10B981]" />
                              <CardTitle className="text-[16px] text-[#1E293B]">
                                Top 3 Teaching Strategies
                              </CardTitle>
                            </div>
                            <ChevronDown 
                              className={`h-5 w-5 text-muted-foreground transition-transform ${isStrategiesOpen ? 'rotate-180' : ''}`} 
                            />
                          </div>
                          <CardDescription className="text-[13px] text-left mt-1">
                            Personalized strategies aligned with their learning style
                          </CardDescription>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="p-5 pt-0 space-y-3">
                          {isLoadingStrategies ? (
                          <div className="flex justify-center p-4"><Loader className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                        ) : teachingStrategies.map((strategy, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-4 bg-[#F8FAFC] rounded-xl border border-slate-100"
                            >
                              <div className="w-6 h-6 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[12px] font-semibold flex-shrink-0 mt-0.5">
                                {index + 1}
                              </div>
                              <p className="text-[14px] text-[#334155] leading-relaxed flex-1">{strategy}</p>
                            </div>
                          ))}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )}

                {/* Educational Resources */}
                <Collapsible open={isResourcesOpen} onOpenChange={setIsResourcesOpen}>
                  <Card className="rounded-2xl shadow-sm border-none bg-white">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="p-5 pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-[#8B5CF6]" />
                            <CardTitle className="text-[16px] text-[#1E293B]">
                              Educational Resources
                            </CardTitle>
                          </div>
                          <ChevronDown 
                            className={`h-5 w-5 text-muted-foreground transition-transform ${isResourcesOpen ? 'rotate-180' : ''}`} 
                          />
                        </div>
                        <CardDescription className="text-[13px] text-left mt-1">
                          Materials and guides tailored to their cognitive profile
                        </CardDescription>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="p-5 pt-0 space-y-3">
                        {isLoadingStrategies ? (
                          <div className="flex justify-center p-4"><Loader className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                        ) : educationalResources.map((resource, index) => (
                          <div
                            key={index}
                            className="p-4 bg-[#F8FAFC] border border-slate-100 rounded-xl space-y-3"
                          >
                            {/* Top row: Type pill + View button */}
                            <div className="flex items-center justify-between gap-2">
                              <Badge 
                                variant="secondary" 
                                className="rounded-md px-2 py-0.5 text-[11px] font-semibold bg-[#EDE9FE] text-[#6D28D9]"
                              >
                                {resource.type}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full text-[12px] font-medium h-7 px-3 border-border hover:bg-accent bg-white"
                              >
                                View
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            </div>

                            {/* Title and Description */}
                            <div>
                              <h4 className="text-[14px] font-semibold text-[#1E293B] mb-1">{resource.title}</h4>
                              <p className="text-[13px] text-[#475569]">{resource.description}</p>
                            </div>

                            {/* Why this helps */}
                            <div className="bg-[#DBEAFE]/30 p-2.5 rounded-lg border border-[#DBEAFE]">
                              <p className="text-[12px] text-[#1D4ED8] flex gap-1.5 items-start">
                                <span className="mt-0.5">💡</span>
                                <span><span className="font-semibold">Why this helps:</span> {resource.whyHelps}</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </div>
            </div>
          ) : (
            /* No Assessment Data State */
            <Card className="rounded-2xl shadow-sm border-none bg-white flex-1 flex items-center justify-center min-h-[400px]">
              <CardContent className="p-8 text-center space-y-5 max-w-md w-full">
                <div className="w-20 h-20 rounded-full bg-[#EFF6FF] mx-auto flex items-center justify-center">
                  <TrendingUp className="h-10 w-10 text-[#3B82F6]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-[#1E293B] mb-2">No Assessment Data Yet</h3>
                  <p className="text-[14px] text-[#64748B] leading-relaxed">
                    {selectedStudent.name} hasn't completed any assessments yet. Encourage them to complete their 
                    cognitive assessments to receive personalized teaching strategies.
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <Button 
                    className="rounded-full h-11 text-[14px] disabled:opacity-90 disabled:cursor-wait w-full font-semibold" 
                    disabled={isSendingReminder || !selectedStudent.email}
                    onClick={async () => {
                      if (!selectedStudent.email) {
                        toast.error('No email address found for this student');
                        return;
                      }
                      setIsSendingReminder(true);
                      try {
                        await sendStudentReminder(
                          selectedStudent.email,
                          selectedStudent.name,
                          selectedStudent.school || selectedStudent.organizationName || 'your school'
                        );
                        toast.success(`Reminder sent to ${selectedStudent.name}`);
                      } catch (err) {
                        toast.error(`Failed to send reminder to ${selectedStudent.name}`);
                      } finally {
                        setIsSendingReminder(false);
                      }
                    }}
                  >
                    {isSendingReminder ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    {isSendingReminder ? 'Sending...' : 'Send Reminder'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-full h-11 text-[14px] w-full font-medium"
                    onClick={() => {
                      const assessmentUrl = `${window.location.origin}/auth`;
                      if (navigator.clipboard && window.isSecureContext) {
                        navigator.clipboard.writeText(assessmentUrl).then(() => {
                          toast.success('Assessment link copied to clipboard!');
                        }).catch(() => {
                          toast.error('Failed to copy link');
                        });
                      } else {
                        try {
                          const textArea = document.createElement('textarea');
                          textArea.value = assessmentUrl;
                          document.body.appendChild(textArea);
                          textArea.select();
                          document.execCommand('copy');
                          document.body.removeChild(textArea);
                          toast.success('Assessment link copied to clipboard!');
                        } catch (err) {
                          toast.error('Failed to copy link');
                        }
                      }
                    }}
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Share Link Manually
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Teacher Observation & Concern Modal */}
      {showObservationModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-4 border-2 border-purple-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-extrabold text-slate-900">Record Teacher Observation</h3>
              </div>
              <button 
                onClick={() => setShowObservationModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Sharing observations for <strong>{selectedStudent.name}</strong>. Notes will be accessible by parents linked to this student to align learning strategies.
            </p>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Observation Category</label>
                <select 
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50"
                  value={concernType}
                  onChange={(e: any) => setConcernType(e.target.value)}
                >
                  <option value="Academic Focus">Academic Focus & Retention</option>
                  <option value="Behavioral / Attention">Behavioral & Attention Span</option>
                  <option value="Social Interaction">Social Interaction & Group Work</option>
                  <option value="Learning Pace">Learning Pace & Homework</option>
                  <option value="Commendation">Commendation & Special Strength</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Severity Level</label>
                  <select 
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50"
                    value={severity}
                    onChange={(e: any) => setSeverity(e.target.value)}
                  >
                    <option value="low">Low (Routine Notice)</option>
                    <option value="medium">Medium (Needs Attention)</option>
                    <option value="high">High (Priority Action)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Subject / Area (Optional)</label>
                  <Input 
                    placeholder="e.g. Math, Science"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Observation & Concern Notes</label>
                <textarea 
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white"
                  placeholder="Describe your classroom observations, specific behaviors, or academic patterns..."
                  value={observationText}
                  onChange={(e) => setObservationText(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Recommended Home Action</label>
                <textarea 
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white"
                  placeholder="What can parents do at home to support this student?"
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowObservationModal(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (!observationText.trim()) {
                    toast.error('Please enter observation notes.');
                    return;
                  }
                  const newObs: TeacherObservation = {
                    id: Date.now().toString(),
                    teacherId: teacher?.id || 'teacher-1',
                    teacherName: teacher?.name || 'Class Teacher',
                    studentId: selectedStudent.id,
                    studentName: selectedStudent.name,
                    subject,
                    concernType,
                    severity,
                    observationText,
                    recommendedAction,
                    createdAt: new Date().toISOString()
                  };
                  saveTeacherObservation(newObs);
                  setShowObservationModal(false);
                  setObservationText('');
                  setRecommendedAction('');
                  toast.success('Observation recorded and shared with parent portal!');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
              >
                Save & Share Observation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
