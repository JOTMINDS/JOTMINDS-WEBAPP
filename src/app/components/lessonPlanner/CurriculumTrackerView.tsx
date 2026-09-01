import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { CheckCircle2, Clock, AlertCircle, BookOpen, Layers, CheckSquare } from 'lucide-react';
import { CurriculumTrack, CurriculumTopic, LessonPlan } from '../../types/lessonPlannerTypes';
import { getCurriculumTrack, saveCurriculumTrack } from '../../utils/lessonPlannerStorage';
import { generateAICurriculumTopics } from '../../utils/aiService';
import { Loader, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface CurriculumTrackerViewProps {
  plan?: LessonPlan;
}

export const CurriculumTrackerView: React.FC<CurriculumTrackerViewProps> = ({ plan }) => {
  const [track, setTrack] = useState<CurriculumTrack>(getCurriculumTrack());
  const [isGenerating, setIsGenerating] = useState(false);

  // Use the plan's subject and grade if available, otherwise fallback to the track's data
  const subject = plan?.subject || track.subject;
  const grade = plan?.gradeClass || track.grade;

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    toast.info('Analyzing curriculum & generating topics...');
    
    try {
      const generated = await generateAICurriculumTopics(subject, grade, track.frameworkName, plan?.topic || 'General Overview');
      if (generated && generated.length > 0) {
        const newTopics = generated.map((t: any, i: number) => ({
          id: `topic-gen-${Date.now()}-${i}`,
          title: t.title,
          status: 'outstanding',
          estimatedHours: t.estimatedHours || 1
        }));
        
        const updatedTrack = {
          ...track,
          topics: [...track.topics, ...newTopics],
          totalTopicsCount: track.topics.length + newTopics.length,
          completionPercentage: Math.round((track.coveredTopicsCount / (track.topics.length + newTopics.length)) * 100) || 0
        };
        
        setTrack(updatedTrack);
        saveCurriculumTrack(updatedTrack);
        toast.success(`Generated ${newTopics.length} curriculum topics!`);
      } else {
        toast.error('Failed to generate topics.');
      }
    } catch (e) {
      toast.error('Error connecting to AI.');
    }
    setIsGenerating(false);
  };

  const toggleTopicStatus = (topicId: string) => {
    const updatedTopics = track.topics.map(t => {
      if (t.id === topicId) {
        const nextStatus: CurriculumTopic['status'] =
          t.status === 'covered' ? 'outstanding' : t.status === 'outstanding' ? 'in_progress' : 'covered';
        return { ...t, status: nextStatus };
      }
      return t;
    });

    const coveredCount = updatedTopics.filter(t => t.status === 'covered').length;
    const completionPct = Math.round((coveredCount / updatedTopics.length) * 100);

    const updatedTrack: CurriculumTrack = {
      ...track,
      topics: updatedTopics,
      coveredTopicsCount: coveredCount,
      completionPercentage: completionPct
    };

    setTrack(updatedTrack);
    saveCurriculumTrack(updatedTrack);
    toast.success('Curriculum topic status updated!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-3 py-0.5 text-xs">
              Module 7 • Curriculum Management
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-0.5 text-xs">
              {track.completionPercentage}% Curriculum Covered
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" /> {track.frameworkName}: {subject} ({grade})
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Easily align lesson plans with various educational curricula.
          </p>
        </div>
        <div>
          <Button onClick={handleAutoGenerate} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700 text-white border-none text-xs">
            {isGenerating ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Auto-Generate Topics</>}
          </Button>
        </div>
      </div>

      {/* Progress Bar Summary Card */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Syllabus Progress</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {track.coveredTopicsCount} of {track.totalTopics} Topics Completed
              </h3>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {track.completionPercentage}%
              </span>
            </div>
          </div>
          <Progress value={track.completionPercentage} className="h-3 bg-slate-100 dark:bg-slate-800" />
        </CardContent>
      </Card>

      {/* Topics List */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
            Curriculum Topic Checklist
          </CardTitle>
          <CardDescription className="text-xs">
            Click any topic to cycle status between Covered, In Progress, and Outstanding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {track.topics.map(topic => (
            <div
              key={topic.id}
              onClick={() => toggleTopicStatus(topic.id)}
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                topic.status === 'covered'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200'
                  : topic.status === 'in_progress'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950 dark:bg-amber-950/30 dark:text-amber-200'
                  : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {topic.status === 'covered' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : topic.status === 'in_progress' ? (
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase block">
                    {topic.code.startsWith('MATH') ? `${subject.substring(0, 4).toUpperCase()}-${grade.replace(/\s+/g, '')}-${topic.id.split('-').pop()}` : topic.code}
                  </span>
                  <h4 className="font-bold text-sm">{topic.title}</h4>
                </div>
              </div>

              <Badge
                variant="outline"
                className={
                  topic.status === 'covered'
                    ? 'border-emerald-300 text-emerald-700 dark:text-emerald-300 bg-emerald-100/50'
                    : topic.status === 'in_progress'
                    ? 'border-amber-300 text-amber-700 dark:text-amber-300 bg-amber-100/50'
                    : 'border-slate-300 text-slate-500'
                }
              >
                {topic.status === 'covered' ? 'Covered' : topic.status === 'in_progress' ? 'In Progress' : 'Outstanding'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
