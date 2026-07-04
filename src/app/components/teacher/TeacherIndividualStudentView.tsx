import { useState, useEffect } from 'react';
import { User, Assessment } from '../../types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
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
  Loader
} from 'lucide-react';
import { formatDate } from '../../utils/dateFormat';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { StudentDetailView } from '../StudentDetailView';
import { KidsCognitiveProfile } from '../kids/KidsCognitiveProfile';
import { sendStudentReminder } from '../../utils/api';
import { toast } from 'sonner';

interface TeacherIndividualStudentViewProps {
  students: User[];
  assessments: Assessment[];
  initialStudentId?: string | null;
}

export function TeacherIndividualStudentView({ students, assessments, initialStudentId }: TeacherIndividualStudentViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    initialStudentId || (students.length > 0 ? students[0].id : null)
  );

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
  const [isSendingReminder, setIsSendingReminder] = useState(false);

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

  // Get quick insights
  const getQuickInsights = () => {
    const insights: Array<{ icon: string; text: string }> = [];
    
    if (latestLearning?.score) {
      const style = ((latestLearning.score as any).kolb || (latestLearning.score as any).learning)?.style;
      switch (style) {
        case 'Diverging':
          insights.push({ icon: '🎯', text: 'Excels in group work and creative brainstorming' });
          insights.push({ icon: '💭', text: 'Values reflection and multiple perspectives' });
          break;
        case 'Assimilating':
          insights.push({ icon: '📚', text: 'Prefers logical frameworks and theoretical concepts' });
          insights.push({ icon: '🔍', text: 'Enjoys independent study and deep analysis' });
          break;
        case 'Converging':
          insights.push({ icon: '🎯', text: 'Strong in practical problem-solving' });
          insights.push({ icon: '🧪', text: 'Learns best through experimentation' });
          break;
        case 'Accommodating':
          insights.push({ icon: '✨', text: 'Thrives with hands-on, active learning' });
          insights.push({ icon: '🚀', text: 'Learns through trial and error' });
          break;
      }
    }

    if (latestThinking) {
      let style = '';
      if (latestThinking.type === 'sternberg') {
        style = latestThinking.score.sternberg?.style || '';
      } else if (latestThinking.type === 'jhs-thinking') {
        style = latestThinking.score['jhs-thinking']?.primaryStyle || '';
      } else if (latestThinking.type === 'shs-thinking') {
        style = latestThinking.score['shs-thinking']?.primaryStyle || '';
      } else if (latestThinking.type === 'adult-thinking') {
        style = latestThinking.score['adult-thinking']?.dominantStyle || '';
      } else if (latestThinking.type === 'child-thinking') {
        style = latestThinking.score['child-thinking']?.primaryStyle || '';
      }

      if (style.toLowerCase().includes('analytical')) {
        insights.push({ icon: '🧠', text: 'Strong analytical and critical thinking abilities' });
      } else if (style.toLowerCase().includes('creative')) {
        insights.push({ icon: '💡', text: 'Creative thinker with innovative approaches' });
      } else if (style.toLowerCase().includes('practical')) {
        insights.push({ icon: '🛠️', text: 'Practical mindset focused on real-world applications' });
      }
    }

    return insights.slice(0, 5);
  };

  // Get teaching strategies
  const getTeachingStrategies = () => {
    const strategies: string[] = [];
    
    if (latestLearning?.score) {
      const style = ((latestLearning.score as any).kolb || (latestLearning.score as any).learning)?.style;
      switch (style) {
        case 'Diverging':
          strategies.push(
            'Facilitate group discussions and collaborative projects where they can explore multiple perspectives',
            'Use brainstorming sessions and reflective activities like journaling to leverage their observational strength',
            'Connect learning material to personal experiences and emotional contexts they can relate to'
          );
          break;
        case 'Assimilating':
          strategies.push(
            'Present information in logical, organized frameworks with clear theoretical foundations',
            'Provide reading materials and dedicated time for independent study and analysis',
            'Use diagrams, models, and systematic explanations to support their preference for structure'
          );
          break;
        case 'Converging':
          strategies.push(
            'Focus on practical problem-solving exercises with clear objectives and measurable outcomes',
            'Use simulations, experiments, and technical tasks that allow hypothesis testing',
            'Provide opportunities to apply theoretical concepts to real-world situations'
          );
          break;
        case 'Accommodating':
          strategies.push(
            'Incorporate hands-on activities and experiments where they can learn by doing',
            'Allow learning through trial and error with immediate, constructive feedback',
            'Use real-world demonstrations and encourage active participation and movement'
          );
          break;
      }
    }

    return strategies.slice(0, 3);
  };

  // Educational resources
  const getEducationalResources = () => {
    const resources: Array<{
      type: 'Guide' | 'Article' | 'Video';
      title: string;
      description: string;
      whyHelps: string;
      url: string;
    }> = [];

    if (latestLearning) {
      const style = ((latestLearning.score as any).kolb || (latestLearning.score as any).learning)?.style || '';
      resources.push({
        type: 'Guide',
        title: `Teaching ${style} Learners: A Practical Guide`,
        description: `Comprehensive strategies and activities specifically designed for ${style} learning style preferences.`,
        whyHelps: `Aligned with ${selectedStudent.name}'s preference for ${style.toLowerCase()} learning approaches`,
        url: '#'
      });
    }

    if (latestThinking) {
      resources.push({
        type: 'Article',
        title: 'Understanding Cognitive Diversity in the Classroom',
        description: 'Research-backed insights on how different thinking styles contribute to learning outcomes.',
        whyHelps: `Helps understand ${selectedStudent.name}'s unique thinking patterns and cognitive strengths`,
        url: '#'
      });
    }

    resources.push({
      type: 'Video',
      title: 'Differentiated Instruction Techniques',
      description: 'Practical video demonstrations of classroom strategies for diverse cognitive profiles.',
      whyHelps: 'Provides visual examples of strategies that work for this cognitive profile',
      url: '#'
    });

    return resources;
  };

  const quickInsights = getQuickInsights();
  const teachingStrategies = getTeachingStrategies();
  const educationalResources = getEducationalResources();

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <div className="px-4 lg:px-6 py-4 space-y-6 max-w-[960px] mx-auto">
        {/* Context Card */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4 flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-[15px] font-semibold mb-1">Individual Student Profiles</h2>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                View personalized insights, teaching strategies, and educational resources for each student.
              </p>
            </div>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-[13px] font-medium flex-shrink-0">
              {students.length} Students
            </Badge>
          </CardContent>
        </Card>

        {/* Student Selector Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {students.map((student) => {
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
                  flex items-center gap-2 px-3 py-2 rounded-full 
                  transition-all duration-200 flex-shrink-0 h-11
                  ${isSelected 
                    ? 'bg-white shadow-md border-2 border-primary/20' 
                    : 'bg-white border border-border hover:shadow-sm'
                  }
                `}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-[13px] font-semibold flex-shrink-0">
                  {student.name.charAt(0)}
                </div>
                
                {/* Text */}
                <div className="flex flex-col items-start">
                  <span className="text-[14px] font-medium text-foreground whitespace-nowrap">
                    {student.name}
                  </span>
                  <span className="text-[12px] text-muted-foreground whitespace-nowrap">
                    {studentCompletedCount}/3 Complete
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Student Header Card */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
            {/* Left: Avatar + Name + Level */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-[16px] font-semibold flex-shrink-0">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-[16px] font-semibold">{selectedStudent.name}</h3>
                <Badge 
                  variant="secondary" 
                  className="rounded-full px-2.5 py-0.5 text-[12px] font-semibold bg-[#DBEAFE] text-[#2563EB] mt-1"
                >
                  {getEducationLevel(selectedStudent)}
                </Badge>
              </div>
            </div>

            {/* Middle: Status */}
            <Badge 
              className="rounded-full px-3 py-1 text-[12px] font-semibold bg-[#16A34A] text-white flex-shrink-0"
            >
              {completedCount}/3 Assessments Complete
            </Badge>

            {/* Right: View Full Profile Button */}
            <Button 
              variant="outline" 
              size="sm"
              className="rounded-full text-[13px] font-medium border-border hover:bg-accent flex-shrink-0"
              onClick={() => setViewFullProfile(true)}
            >
              View Full Profile
            </Button>
          </CardContent>
        </Card>

        {hasAssessments ? (
          <>
            {/* Cognitive Profile Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="text-[16px] font-semibold">Cognitive Profile</h3>
              </div>

              <div className="grid gap-4">
                {/* Learning Style */}
                {latestLearning && (
                  <Card className="rounded-2xl bg-[#ECFDF5] border-[#D1FAE5]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-[#16A34A]" />
                          <span className="text-[15px] font-semibold">Learning Style</span>
                        </div>
                        <Badge className="rounded-full px-3 py-1 text-[13px] font-semibold bg-[#16A34A] text-white">
                          {((latestLearning.score as any).kolb || (latestLearning.score as any).learning)?.style}
                        </Badge>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-2">
                        Kolb Learning Style — Assessed {formatDate(latestLearning.completedAt!)}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Thinking Style */}
                {latestThinking && (
                  <Card className="rounded-2xl bg-[#F3E8FF] border-[#E9D5FF]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-[#8B5CF6]" />
                          <span className="text-[15px] font-semibold">Thinking Style</span>
                        </div>
                        <Badge className="rounded-full px-3 py-1 text-[13px] font-semibold bg-[#8B5CF6] text-white">
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
                        </Badge>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-2">
                        Sternberg Thinking Style — Assessed {formatDate(latestThinking.completedAt!)}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Decision Style */}
                {latestDecision && (
                  <Card className="rounded-2xl bg-[#FFEDD5] border-[#FED7AA]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-[#F97316]" />
                          <span className="text-[15px] font-semibold">Decision Style</span>
                        </div>
                        <Badge className="rounded-full px-3 py-1 text-[13px] font-semibold bg-[#F97316] text-white">
                          {((latestDecision.score as any).dualProcess || (latestDecision.score as any).decision || (latestDecision.score as any)['dual-process'])?.style}
                        </Badge>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-2">
                        Dual-Process Decision Making — Assessed {formatDate(latestDecision.completedAt!)}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Quick Insights */}
            {quickInsights.length > 0 && (
              <Collapsible open={isQuickInsightsOpen} onOpenChange={setIsQuickInsightsOpen}>
                <Card className="rounded-2xl shadow-sm">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="p-4 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <CardTitle className="text-[15px]">
                            Quick Insights for {selectedStudent.name}
                          </CardTitle>
                        </div>
                        <ChevronDown 
                          className={`h-5 w-5 text-muted-foreground transition-transform ${isQuickInsightsOpen ? 'rotate-180' : ''}`} 
                        />
                      </div>
                      <CardDescription className="text-[13px] text-left">
                        Key characteristics based on cognitive profile
                      </CardDescription>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="p-4 pt-0 space-y-2">
                      {quickInsights.map((insight, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-[#EFF6FF] rounded-xl"
                        >
                          <span className="text-lg flex-shrink-0">{insight.icon}</span>
                          <p className="text-[13px] text-foreground">{insight.text}</p>
                        </div>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* Teaching Strategies */}
            {teachingStrategies.length > 0 && (
              <Collapsible open={isStrategiesOpen} onOpenChange={setIsStrategiesOpen}>
                <Card className="rounded-2xl shadow-sm">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="p-4 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-primary" />
                          <CardTitle className="text-[15px]">
                            Top 3 Teaching Strategies for {selectedStudent.name}
                          </CardTitle>
                        </div>
                        <ChevronDown 
                          className={`h-5 w-5 text-muted-foreground transition-transform ${isStrategiesOpen ? 'rotate-180' : ''}`} 
                        />
                      </div>
                      <CardDescription className="text-[13px] text-left">
                        Personalized strategies aligned with their learning style
                      </CardDescription>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="p-4 pt-0 space-y-3">
                      {teachingStrategies.map((strategy, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-[#ECFDF3] rounded-xl"
                        >
                          <div className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[12px] font-semibold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-[13px] text-foreground flex-1">{strategy}</p>
                        </div>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        className="w-full rounded-full text-[14px] font-medium border-border hover:bg-accent mt-2"
                      >
                        View All Personalized Strategies
                      </Button>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* Educational Resources */}
            <Collapsible open={isResourcesOpen} onOpenChange={setIsResourcesOpen}>
              <Card className="rounded-2xl shadow-sm">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="p-4 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle className="text-[15px]">
                          Educational Resources for {selectedStudent.name}
                        </CardTitle>
                      </div>
                      <ChevronDown 
                        className={`h-5 w-5 text-muted-foreground transition-transform ${isResourcesOpen ? 'rotate-180' : ''}`} 
                      />
                    </div>
                    <CardDescription className="text-[13px] text-left">
                      Materials and guides tailored to their cognitive profile
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="p-4 pt-0 space-y-3">
                    {educationalResources.map((resource, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white border border-border rounded-2xl space-y-2"
                      >
                        {/* Top row: Type pill + View button */}
                        <div className="flex items-center justify-between gap-2">
                          <Badge 
                            variant="secondary" 
                            className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#DBEAFE] text-foreground"
                          >
                            {resource.type}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full text-[12px] font-medium h-7 px-3 border-border hover:bg-accent"
                          >
                            View
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </div>

                        {/* Title and Description */}
                        <div>
                          <h4 className="text-[14px] font-semibold mb-1">{resource.title}</h4>
                          <p className="text-[13px] text-muted-foreground">{resource.description}</p>
                        </div>

                        {/* Why this helps */}
                        <p className="text-[12px] text-[#2563EB]">
                          💡 Why this helps: {resource.whyHelps}
                        </p>
                      </div>
                    ))}

                    {/* Footer note */}
                    <div className="p-3 bg-[#EFF6FF] rounded-xl">
                      <p className="text-[12px] text-foreground">
                        <strong>Note:</strong> These resources are automatically selected based on {selectedStudent.name}'s 
                        cognitive assessment results. New resources will appear as more assessments are completed.
                      </p>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Footer Note */}
            <Card className="rounded-2xl shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-4 text-center">
                <p className="text-[13px] text-muted-foreground">
                  This profile is generated from completed assessments. Encourage students to complete all three 
                  assessments for the most comprehensive teaching recommendations.
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          /* No Assessment Data State */
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 mx-auto flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold mb-2">No Assessment Data Yet</h3>
                <p className="text-[14px] text-muted-foreground max-w-md mx-auto">
                  {selectedStudent.name} hasn't completed any assessments yet. Encourage them to complete their 
                  cognitive assessments to receive personalized teaching strategies.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button 
                  className="rounded-full disabled:opacity-90 disabled:cursor-wait" 
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
                  {isSendingReminder ? 'Sending...' : 'Send Reminder to Student'}
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-full"
                  onClick={() => {
                    const assessmentUrl = `${window.location.origin}/auth`;
                    navigator.clipboard.writeText(assessmentUrl).then(() => {
                      toast.success('Assessment link copied to clipboard!');
                    }).catch(() => {
                      // Fallback for older browsers
                      const textArea = document.createElement('textarea');
                      textArea.value = assessmentUrl;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      toast.success('Assessment link copied to clipboard!');
                    });
                  }}
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Share Assessment Link
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}