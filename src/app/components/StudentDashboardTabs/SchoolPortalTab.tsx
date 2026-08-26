import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Building2, BookOpen, GraduationCap, FileText, CheckCircle2, 
  Sparkles, Layers, Users, Calendar, ArrowRight, HelpCircle 
} from 'lucide-react';
import { User, Assessment } from '../../types';

interface SchoolPortalTabProps {
  user: User;
  assessments: Assessment[];
}

export function SchoolPortalTab({ user, assessments }: SchoolPortalTabProps) {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(1);

  const latestKolb = assessments.filter(a => a.type === 'kolb' || (a.type as string) === 'learning')[0];
  const learningStyle = (latestKolb?.score as any)?.kolb?.style || 'Assimilating';

  const classLessons = [
    {
      id: 1,
      subject: 'Course A',
      title: 'Module 1: Advanced Concepts',
      teacher: 'Instructor A',
      date: 'Today, 10:30 AM',
      status: 'Active Assignment',
      summary: `Adapted for your ${learningStyle} Learning Style: Focus on the relationship between coefficient A and the parabola apex. Build a concept map linking vertex form y = a(x-h)² + k to real-world projectile paths.`,
      practiceQuestions: [
        'Review the core concepts from chapter 1.',
        'Explain how the primary variable affects the outcome.'
      ]
    },
    {
      id: 2,
      subject: 'Course B',
      title: 'Module 2: Foundational Theory',
      teacher: 'Instructor B',
      date: 'Yesterday',
      status: 'Completed Lesson',
      summary: `Adapted for your ${learningStyle} Learning Style: Compare Glycolysis, the Krebs Cycle, and Electron Transport via a 3-step structured diagram. Note the exact net ATP yield at each phase.`,
      practiceQuestions: [
        'Analyze the relationship between the key components.',
        'Calculate the expected outcome given the initial conditions.'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* School Info Header */}
      <Card className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-none shadow-md overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-bold">{user.school || user.organizationName || 'JotMinds Partner Institution'}</h2>
                  <Badge variant="outline" className="border-emerald-400/40 text-emerald-300 text-xs">
                    Connected Portal
                  </Badge>
                </div>
                <p className="text-xs md:text-sm text-slate-300 mt-1">
                  Class: <strong className="text-white">{user.className || 'General'}</strong> | Student Code: <code className="bg-white/10 px-2 py-0.5 rounded text-amber-300">{user.organizationCode || 'SCH-2026'}</code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-200 border border-purple-400/30 px-3 py-1 text-xs">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Smart Assistant Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Code Display */}
      {user.studentCode && (
        <Card className="border-indigo-200 bg-indigo-50/50 shadow-sm">
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                Your Student Code
              </h3>
              <p className="text-xs text-indigo-700/80">Use this code to sign in to JotMinds</p>
            </div>
            <div className="flex items-center gap-3">
              <code className="bg-white px-4 py-2 rounded-lg text-lg font-black text-indigo-700 border border-indigo-200 tracking-widest shadow-sm">
                {user.studentCode}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-indigo-200 hover:bg-indigo-50 text-indigo-600 shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(user.studentCode!);
                  alert('Copied to clipboard!');
                }}
              >
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Lessons & Personalized Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lesson List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#6B4C9A]" /> Class Assignments & Lessons
          </h3>
          {classLessons.map(lesson => (
            <div
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedLesson === lesson.id
                  ? 'border-[#6B4C9A] bg-purple-50/50 dark:bg-purple-950/20 shadow-xs'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span className="font-semibold text-[#6B4C9A]">{lesson.subject}</span>
                <span>{lesson.date}</span>
              </div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                {lesson.title}
              </h4>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Teacher: {lesson.teacher}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {lesson.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Personalized Detail Panel */}
        <div className="lg:col-span-2">
          {selectedLesson ? (() => {
            const lesson = classLessons.find(l => l.id === selectedLesson)!;
            return (
              <Card className="border-gray-200 dark:border-gray-800 h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="border-[#6B4C9A] text-[#6B4C9A]">
                      {lesson.subject}
                    </Badge>
                    <span className="text-xs text-gray-500">Instructor: {lesson.teacher}</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    {lesson.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Lesson Plan adapted specifically for your <strong className="text-[#6B4C9A]">{learningStyle}</strong> learning style.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 flex-1">
                  {/* Style Summary Box */}
                  <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#6B4C9A]">
                      <Sparkles className="w-4 h-4" /> Personalized Learning Summary
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {lesson.summary}
                    </p>
                  </div>

                  {/* Practice Questions tailored to personalization */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" /> Practice Questions for Your Style
                    </h4>
                    <div className="space-y-2">
                      {lesson.practiceQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            Q{qIdx + 1}
                          </span>
                          <p className="leading-relaxed">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })() : (
            <Card className="h-full flex items-center justify-center p-8 text-center text-gray-500">
              <p className="text-sm">Select a lesson to view your personalized study notes.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
