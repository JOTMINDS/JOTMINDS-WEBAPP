import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { CheckCircle2, Clock, AlertCircle, BookOpen, Layers, CheckSquare, Sparkles, Loader, Filter, Plus, ListTree } from 'lucide-react';
import { CurriculumTrack, CurriculumTopic, LessonPlan } from '../../types/lessonPlannerTypes';
import { getCurriculumTrack, saveCurriculumTrack } from '../../utils/lessonPlannerStorage';
import { generateAICurriculumTopics } from '../../utils/aiService';
import { toast } from 'sonner';

interface CurriculumTrackerViewProps {
  plan?: LessonPlan;
}

// Built-in Scheme of Work library for rapid offline / immediate display
const SCHEME_OF_WORK_DATABASE: Record<string, Array<{ strand: string; substrand: string; title: string; hours: number }>> = {
  'Mathematics': [
    { strand: 'Number & Operations', substrand: 'Real Number Systems', title: 'Integers, Rational Numbers & Decimals', hours: 4 },
    { strand: 'Number & Operations', substrand: 'Fractions & Percentages', title: 'Fraction Operations & Percentage Applications', hours: 4 },
    { strand: 'Number & Operations', substrand: 'Ratio & Proportion', title: 'Direct and Indirect Proportional Reasoning', hours: 3 },
    { strand: 'Algebra & Functions', substrand: 'Algebraic Expressions', title: 'Simplifying & Expanding Algebraic Expressions', hours: 5 },
    { strand: 'Algebra & Functions', substrand: 'Linear Equations', title: 'Solving Linear Equations in One Variable', hours: 4 },
    { strand: 'Algebra & Functions', substrand: 'Simultaneous Equations', title: 'Solving Simultaneous Linear Equations', hours: 4 },
    { strand: 'Geometry & Measurement', substrand: 'Plane Geometry', title: 'Properties of Triangles, Polygons & Quadrilaterals', hours: 4 },
    { strand: 'Geometry & Measurement', substrand: 'Mensuration', title: 'Perimeter, Area & Volume of 2D/3D Shapes', hours: 4 },
    { strand: 'Statistics & Probability', substrand: 'Data Handling', title: 'Data Collection, Frequency Tables & Bar Charts', hours: 3 },
    { strand: 'Statistics & Probability', substrand: 'Probability', title: 'Simple Probability and Experimental Outcomes', hours: 3 },
  ],
  'Science': [
    { strand: 'Diversity of Matter', substrand: 'Living & Non-Living Things', title: 'Cell Structure, Functions & Organization', hours: 4 },
    { strand: 'Diversity of Matter', substrand: 'Chemical Substances', title: 'Elements, Compounds, Mixtures & Periodic Table', hours: 5 },
    { strand: 'Cycles', substrand: 'Life Cycles', title: 'Plant Reproduction and Seed Germination', hours: 3 },
    { strand: 'Cycles', substrand: 'Environmental Cycles', title: 'Water Cycle, Carbon Cycle & Ecosystem Balance', hours: 4 },
    { strand: 'Systems', substrand: 'Human Body Systems', title: 'Digestive, Respiratory & Circulatory Systems', hours: 6 },
    { strand: 'Systems', substrand: 'Solar System', title: 'Earth, Sun, Moon & Planetary Motions', hours: 3 },
    { strand: 'Energy & Forces', substrand: 'Sources of Energy', title: 'Forms, Transformations & Conservation of Energy', hours: 4 },
    { strand: 'Energy & Forces', substrand: 'Forces & Motion', title: 'Friction, Gravity, Speed & Acceleration', hours: 4 },
  ],
  'English Language': [
    { strand: 'Oral Language', substrand: 'Listening & Speaking', title: 'Effective Communication, Debate & Presentation Skills', hours: 4 },
    { strand: 'Reading & Comprehension', substrand: 'Informational Texts', title: 'Finding Main Ideas, Inferences & Critical Analysis', hours: 5 },
    { strand: 'Reading & Comprehension', substrand: 'Literature & Poetry', title: 'Figurative Language, Themes & Character Analysis', hours: 4 },
    { strand: 'Grammar & Usage', substrand: 'Parts of Speech', title: 'Nouns, Verbs, Modifiers & Prepositions in Context', hours: 4 },
    { strand: 'Grammar & Usage', substrand: 'Sentence Structure', title: 'Complex Sentences, Clauses & Punctuation', hours: 4 },
    { strand: 'Writing', substrand: 'Creative & Narrative Writing', title: 'Descriptive Essays, Short Stories & Character Arcs', hours: 5 },
    { strand: 'Writing', substrand: 'Expository & Formal Writing', title: 'Formal Letters, Reports & Persuasive Essays', hours: 5 },
  ],
  'Computing / ICT': [
    { strand: 'Computer Systems', substrand: 'Hardware & Architecture', title: 'Input/Output Devices, CPU & Storage Media', hours: 3 },
    { strand: 'Computer Systems', substrand: 'Software Concepts', title: 'Operating Systems vs Application Software', hours: 3 },
    { strand: 'Information Technology', substrand: 'Productivity Tools', title: 'Word Processing, Spreadsheets & Digital Presentations', hours: 5 },
    { strand: 'Internet & Cybersecurity', substrand: 'Networks & Web', title: 'Web Browsing, Search Engines & Digital Safety', hours: 4 },
    { strand: 'Programming & Logic', substrand: 'Algorithms', title: 'Flowcharts, Pseudocode & Algorithmic Problem Solving', hours: 6 },
  ]
};

export const CurriculumTrackerView: React.FC<CurriculumTrackerViewProps> = ({ plan }) => {
  const [track, setTrack] = useState<CurriculumTrack>(getCurriculumTrack());
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStrand, setSelectedStrand] = useState<string>('all');

  const subject = plan?.subject || track.subject || 'Mathematics';
  const grade = plan?.gradeClass || track.grade || 'JHS 2';
  const frameworkName = plan?.curriculumFramework || track.frameworkName || 'National Curriculum';

  // Automatically sync scheme of work when subject or grade changes
  useEffect(() => {
    if (plan?.subject && (plan.subject !== track.subject || plan.gradeClass !== track.grade)) {
      // Find matching standard scheme of work
      const matchedKey = Object.keys(SCHEME_OF_WORK_DATABASE).find(k => 
        plan.subject.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(plan.subject.toLowerCase())
      ) || 'Mathematics';

      const baseTopics = SCHEME_OF_WORK_DATABASE[matchedKey] || SCHEME_OF_WORK_DATABASE['Mathematics'];
      const topics: CurriculumTopic[] = baseTopics.map((item, idx) => ({
        id: `topic-${plan.subject.substring(0, 3).toLowerCase()}-${idx + 1}`,
        code: `${plan.subject.substring(0, 4).toUpperCase()}-${plan.gradeClass.replace(/\s+/g, '')}-${idx + 1}`,
        title: item.title,
        strand: item.strand,
        substrand: item.substrand,
        estimatedHours: item.hours,
        subject: plan.subject,
        grade: plan.gradeClass,
        status: idx < 3 ? 'covered' : idx === 3 ? 'in_progress' : 'outstanding',
        mappedLessonId: idx === 3 ? plan.id : undefined
      }));

      const covered = topics.filter(t => t.status === 'covered').length;
      const updated: CurriculumTrack = {
        frameworkName: plan.curriculumFramework || frameworkName,
        subject: plan.subject,
        grade: plan.gradeClass,
        totalTopics: topics.length,
        coveredTopicsCount: covered,
        completionPercentage: Math.round((covered / topics.length) * 100),
        topics
      };

      setTrack(updated);
      saveCurriculumTrack(updated);
    }
  }, [plan?.subject, plan?.gradeClass, plan?.curriculumFramework]);

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    toast.info(`Generating Scheme of Work for ${subject} (${grade})...`);
    
    try {
      const generated = await generateAICurriculumTopics(subject, grade, frameworkName, plan?.topic || 'General Scheme of Work');
      if (generated && generated.length > 0) {
        const newTopics: CurriculumTopic[] = generated.map((t: any, i: number) => ({
          id: `topic-gen-${Date.now()}-${i}`,
          code: `${subject.substring(0, 4).toUpperCase()}-${grade.replace(/\s+/g, '')}-GEN${i + 1}`,
          title: t.title || t,
          strand: t.strand || 'Core Knowledge',
          substrand: t.substrand || 'Key Competencies',
          estimatedHours: t.estimatedHours || 2,
          subject,
          grade,
          status: 'outstanding'
        }));
        
        const combined = [...track.topics, ...newTopics];
        const covered = combined.filter(t => t.status === 'covered').length;
        const updatedTrack: CurriculumTrack = {
          ...track,
          frameworkName,
          subject,
          grade,
          topics: combined,
          totalTopics: combined.length,
          coveredTopicsCount: covered,
          completionPercentage: Math.round((covered / combined.length) * 100) || 0
        };
        
        setTrack(updatedTrack);
        saveCurriculumTrack(updatedTrack);
        toast.success(`Generated ${newTopics.length} scheme of work topics & sub-topics!`);
      } else {
        toast.error('Failed to generate topics from AI.');
      }
    } catch (e) {
      toast.error('Error connecting to AI curriculum service.');
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

  // Extract unique strands
  const strands = Array.from(new Set(track.topics.map(t => t.strand || 'Core Topics').filter(Boolean)));

  const filteredTopics = selectedStrand === 'all' 
    ? track.topics 
    : track.topics.filter(t => (t.strand || 'Core Topics') === selectedStrand);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-3 py-0.5 text-xs">
              Module 7 • Scheme of Work & Curriculum Tracker
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-0.5 text-xs font-semibold">
              {track.completionPercentage}% Syllabus Covered
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" /> {frameworkName}: {subject} ({grade})
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Structured Scheme of Work organized by Strands, Sub-strands, Topics, and Sub-topics for {grade}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleAutoGenerate} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700 text-white border-none text-xs font-semibold shadow-md">
            {isGenerating ? <><Loader className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generating Scheme...</> : <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Generate Scheme of Work</>}
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
                {track.coveredTopicsCount} of {track.totalTopics} Topics Completed ({track.completionPercentage}%)
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

      {/* Strand Filter Controls */}
      {strands.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-indigo-600" /> Filter Strand:
          </div>
          <button
            onClick={() => setSelectedStrand('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedStrand === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All Strands ({track.topics.length})
          </button>
          {strands.map(s => (
            <button
              key={s}
              onClick={() => setSelectedStrand(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedStrand === s
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Topics & Sub-Topics List */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ListTree className="w-4 h-4 text-indigo-600" /> Scheme of Work: Topics & Sub-Topics
            </CardTitle>
            <CardDescription className="text-xs">
              Click any topic to cycle status between Covered, In Progress, and Outstanding.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-semibold">
            {filteredTopics.length} Topics Displayed
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredTopics.map((topic, idx) => (
            <div
              key={topic.id}
              onClick={() => toggleTopicStatus(topic.id)}
              className={`p-4 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all hover:shadow-xs ${
                topic.status === 'covered'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200'
                  : topic.status === 'in_progress'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950 dark:bg-amber-950/30 dark:text-amber-200 ring-1 ring-amber-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5">
                  {topic.status === 'covered' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : topic.status === 'in_progress' ? (
                    <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-slate-500 uppercase font-semibold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border">
                      {topic.code}
                    </span>
                    {topic.strand && (
                      <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded">
                        Strand: {topic.strand}
                      </span>
                    )}
                    {topic.substrand && (
                      <span className="text-[10px] bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-medium px-2 py-0.5 rounded">
                        Sub-strand: {topic.substrand}
                      </span>
                    )}
                    {topic.estimatedHours && (
                      <span className="text-[10px] text-slate-400">
                        • {topic.estimatedHours} {topic.estimatedHours === 1 ? 'Hour' : 'Hours'}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{topic.title}</h4>
                </div>
              </div>

              <div className="shrink-0 ml-3">
                <Badge
                  variant="outline"
                  className={
                    topic.status === 'covered'
                      ? 'border-emerald-300 text-emerald-700 dark:text-emerald-300 bg-emerald-100/50 font-semibold'
                      : topic.status === 'in_progress'
                      ? 'border-amber-300 text-amber-700 dark:text-amber-300 bg-amber-100/50 font-semibold'
                      : 'border-slate-300 text-slate-500'
                  }
                >
                  {topic.status === 'covered' ? 'Covered' : topic.status === 'in_progress' ? 'In Progress' : 'Outstanding'}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
