import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  BookOpen, CheckCircle2, Clock, Calendar, Users, Star,
  Search, Eye, FileText, ChevronRight, X, Sparkles, Filter, Award
} from 'lucide-react';
import {
  getSavedLessonPlans,
  getPostLessonReflections,
  getCurriculumTrack
} from '../../utils/lessonPlannerStorage';
import { LessonPlan, PostLessonReflection } from '../../types/lessonPlannerTypes';
import { InstitutionMember } from '../../utils/institution';

interface SchoolLessonPlanningViewProps {
  institutionId?: string;
  members: InstitutionMember[];
  onOpenTeacherProfile?: (teacherId: string) => void;
}

export const SchoolLessonPlanningView: React.FC<SchoolLessonPlanningViewProps> = ({
  institutionId,
  members,
  onOpenTeacherProfile
}) => {
  const [subTab, setSubTab] = useState<'lessons' | 'reflections' | 'curriculum'>('lessons');
  const [search, setSearch] = useState('');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<LessonPlan | null>(null);

  // Load all lesson plans and reflections
  const allPlans = useMemo(() => {
    return getSavedLessonPlans();
  }, []);

  const allReflections = useMemo(() => {
    return getPostLessonReflections();
  }, []);

  const curriculumTrack = useMemo(() => {
    return getCurriculumTrack();
  }, []);

  // Map teacher names
  const teacherMap = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach(m => {
      map.set(m.userId, m.userName);
    });
    return map;
  }, [members]);

  const teacherMembers = useMemo(() => {
    return members.filter(m => m.role === 'teacher' || m.role === 'admin');
  }, [members]);

  // Filtered lessons
  const filteredPlans = useMemo(() => {
    return allPlans.filter(plan => {
      const matchesSearch =
        plan.topic?.toLowerCase().includes(search.toLowerCase()) ||
        plan.subject?.toLowerCase().includes(search.toLowerCase()) ||
        plan.gradeClass?.toLowerCase().includes(search.toLowerCase());

      const matchesTeacher =
        selectedTeacherFilter === 'all' || plan.teacherId === selectedTeacherFilter;

      const matchesStatus =
        selectedStatusFilter === 'all' ||
        (selectedStatusFilter === 'delivered' && (plan.status === 'delivered' || allReflections.some(r => r.lessonId === plan.id))) ||
        (selectedStatusFilter === 'planned' && plan.status !== 'delivered' && !allReflections.some(r => r.lessonId === plan.id));

      return matchesSearch && matchesTeacher && matchesStatus;
    });
  }, [allPlans, search, selectedTeacherFilter, selectedStatusFilter, allReflections]);

  const deliveredCount = useMemo(() => {
    return allPlans.filter(p => p.status === 'delivered' || allReflections.some(r => r.lessonId === p.id)).length;
  }, [allPlans, allReflections]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold">Faculty Lesson Planning & Delivery</h2>
            </div>
            <p className="text-xs text-indigo-200/80 max-w-2xl">
              Track pedagogical preparation, monitor delivered lessons, and inspect faculty reflections and curriculum coverage across all grades.
            </p>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-indigo-900/60">
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
            <p className="text-2xl font-black text-indigo-300">{allPlans.length}</p>
            <p className="text-xs text-slate-300 mt-0.5">Lessons Created</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
            <p className="text-2xl font-black text-emerald-400">{deliveredCount}</p>
            <p className="text-xs text-slate-300 mt-0.5">Lessons Delivered</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
            <p className="text-2xl font-black text-amber-300">{allReflections.length}</p>
            <p className="text-xs text-slate-300 mt-0.5">Teacher Reflections</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
            <p className="text-2xl font-black text-purple-300">
              {curriculumTrack.completionPercentage}%
            </p>
            <p className="text-xs text-slate-300 mt-0.5">Curriculum Pace</p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setSubTab('lessons')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            subTab === 'lessons'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Faculty Lessons ({allPlans.length})
        </button>
        <button
          onClick={() => setSubTab('reflections')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            subTab === 'reflections'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Award className="w-4 h-4" />
          Teacher Reflections ({allReflections.length})
        </button>
        <button
          onClick={() => setSubTab('curriculum')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            subTab === 'curriculum'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Curriculum Coverage ({curriculumTrack.coveredTopicsCount}/{curriculumTrack.totalTopics})
        </button>
      </div>

      {/* SUB-TAB 1: LESSONS */}
      {subTab === 'lessons' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search topic, subject or grade..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <select
                value={selectedTeacherFilter}
                onChange={e => setSelectedTeacherFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none"
              >
                <option value="all">All Teachers</option>
                {teacherMembers.map(t => (
                  <option key={t.userId} value={t.userId}>
                    {t.userName}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="delivered">Delivered</option>
                <option value="planned">Planned</option>
              </select>
            </div>
          </div>

          {/* Lessons Table */}
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Lesson Topic & Subject</th>
                    <th className="text-left px-3 py-3 font-semibold">Teacher</th>
                    <th className="text-center px-3 py-3 font-semibold">Grade / Class</th>
                    <th className="text-center px-3 py-3 font-semibold">Duration</th>
                    <th className="text-center px-3 py-3 font-semibold">Status</th>
                    <th className="text-center px-3 py-3 font-semibold">Differentiated</th>
                    <th className="text-right px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPlans.map(plan => {
                    const isDelivered = plan.status === 'delivered' || allReflections.some(r => r.lessonId === plan.id);
                    const teacherName = plan.teacherId ? (teacherMap.get(plan.teacherId) || 'Faculty') : 'Faculty';

                    return (
                      <tr key={plan.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-900">{plan.topic}</p>
                          <p className="text-[11px] text-indigo-600 font-medium">{plan.subject}</p>
                        </td>
                        <td className="px-3 py-3 text-gray-700 font-medium">
                          {teacherName}
                        </td>
                        <td className="px-3 py-3 text-center text-gray-600 font-medium">
                          {plan.gradeClass || 'General'}
                        </td>
                        <td className="px-3 py-3 text-center text-gray-500">
                          {plan.durationMinutes || 45} mins
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Badge
                            className={
                              isDelivered
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                                : 'bg-blue-50 text-blue-700 border-blue-200 text-[10px]'
                            }
                          >
                            {isDelivered ? 'Delivered' : 'Planned'}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {plan.differentiatedInstruction ? (
                            <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                              Active
                            </Badge>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPlanForModal(plan)}
                            className="h-7 px-2.5 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border-indigo-200"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View Plan
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPlans.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400">
                        No lesson plans match your search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SUB-TAB 2: REFLECTIONS */}
      {subTab === 'reflections' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allReflections.map(ref => {
              const matchedPlan = allPlans.find(p => p.id === ref.lessonId);
              const teacherName = ref.teacherId ? (teacherMap.get(ref.teacherId) || 'Faculty') : 'Faculty';

              return (
                <Card key={ref.reflectionId} className="border-slate-200 hover:shadow-xs transition-all">
                  <CardHeader className="pb-3 border-b bg-gray-50/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm font-bold text-gray-900">
                          {matchedPlan?.topic || 'Delivered Lesson'}
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Facilitator: <span className="font-semibold text-gray-700">{teacherName}</span> · {ref.reflectedAt ? new Date(ref.reflectedAt).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        <span className="text-xs font-bold text-purple-900">{ref.studentUnderstandingLevel || 'Good'} Mastery</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-3 text-xs">
                    <div>
                      <p className="font-bold text-emerald-800">What Worked Well:</p>
                      <p className="text-gray-700 mt-0.5 bg-emerald-50/40 p-2 rounded border border-emerald-100">
                        {ref.whatWorkedWell || 'Instruction proceeded smoothly.'}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-amber-800">Areas for Improvement:</p>
                      <p className="text-gray-700 mt-0.5 bg-amber-50/40 p-2 rounded border border-amber-100">
                        {ref.areasForImprovement || 'Additional group scaffolding recommended.'}
                      </p>
                    </div>

                    {ref.followUpActions && (
                      <div>
                        <p className="font-bold text-blue-800">Follow-up Action Steps:</p>
                        <p className="text-gray-700 mt-0.5 bg-blue-50/40 p-2 rounded border border-blue-100">
                          {ref.followUpActions}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t">
                      <span>Completed as Planned: <b className="text-gray-800">{ref.completedAsPlanned ? 'Yes' : 'Adjusted'}</b></span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {allReflections.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No teacher reflections have been submitted yet.</p>
                <p className="text-xs text-gray-400 mt-1">Teachers submit reflections after delivering lessons in the classroom.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CURRICULUM */}
      {subTab === 'curriculum' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-sm font-bold text-gray-900">{curriculumTrack.frameworkName}</CardTitle>
                  <p className="text-xs text-gray-500">{curriculumTrack.subject} · {curriculumTrack.grade}</p>
                </div>
                <Badge className="bg-indigo-50 text-indigo-700 font-bold border-indigo-200">
                  {curriculumTrack.coveredTopicsCount} of {curriculumTrack.totalTopics} Topics Covered ({curriculumTrack.completionPercentage}%)
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all"
                  style={{ width: `${curriculumTrack.completionPercentage}%` }}
                />
              </div>

              <div className="divide-y divide-gray-100 mt-4">
                {curriculumTrack.topics.map(t => (
                  <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-gray-400 font-semibold">{t.code}</span>
                      <span className="font-medium text-gray-800">{t.title}</span>
                    </div>
                    <Badge
                      className={
                        t.status === 'covered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                          : t.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 text-[10px]'
                          : 'bg-gray-100 text-gray-600 border-gray-200 text-[10px]'
                      }
                    >
                      {t.status === 'covered' ? 'Covered' : t.status === 'in_progress' ? 'In Progress' : 'Outstanding'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lesson Plan Preview Modal */}
      {selectedPlanForModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in fade-in">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <div>
                <Badge className="bg-indigo-50 text-indigo-700 font-bold border-indigo-200 mb-1">
                  Lesson Plan Detail
                </Badge>
                <h3 className="text-lg font-bold text-gray-900">{selectedPlanForModal.topic}</h3>
                <p className="text-xs text-gray-500">
                  {selectedPlanForModal.subject} · {selectedPlanForModal.gradeClass} · {selectedPlanForModal.durationMinutes || 45} minutes
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPlanForModal(null)} className="h-8 w-8 p-0 text-gray-400">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Objectives */}
              {selectedPlanForModal.objectives && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="font-bold text-blue-900 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" /> Learning Objectives
                  </p>
                  {selectedPlanForModal.objectives.knowledge?.length > 0 && (
                    <div className="mb-2">
                      <p className="font-semibold text-blue-950">Knowledge:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-blue-800">
                        {selectedPlanForModal.objectives.knowledge.map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedPlanForModal.objectives.skills?.length > 0 && (
                    <div>
                      <p className="font-semibold text-blue-950">Skills:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-blue-800">
                        {selectedPlanForModal.objectives.skills.map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Procedure */}
              {selectedPlanForModal.phases && selectedPlanForModal.phases.length > 0 && (
                <div>
                  <p className="font-bold text-gray-900 mb-2">Lesson Phases & Activity Flow</p>
                  <div className="space-y-2">
                    {selectedPlanForModal.phases.map((ph, i) => (
                      <div key={i} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-800">{ph.name}</span>
                          <span className="text-gray-500 font-mono text-[10px]">{ph.durationMinutes} mins</span>
                        </div>
                        <p className="text-gray-600">{ph.activity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Differentiated Instruction */}
              {selectedPlanForModal.differentiatedInstruction && (
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <p className="font-bold text-purple-900 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" /> Differentiated Instruction Strategy
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-purple-800">
                    <div className="p-2 bg-white rounded border border-purple-200">
                      <b>Core Activity:</b> {selectedPlanForModal.differentiatedInstruction.coreActivity?.title || 'Main instruction'}
                      <p className="text-gray-500 text-[10px] mt-0.5">{selectedPlanForModal.differentiatedInstruction.coreActivity?.description}</p>
                    </div>
                    <div className="p-2 bg-white rounded border border-purple-200">
                      <b>Support Activity:</b> {selectedPlanForModal.differentiatedInstruction.supportActivity?.title || 'Scaffolded practice'}
                      <p className="text-gray-500 text-[10px] mt-0.5">{selectedPlanForModal.differentiatedInstruction.supportActivity?.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 pt-3 border-t">
              <Button onClick={() => setSelectedPlanForModal(null)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
