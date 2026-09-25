import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from '../../types';
import { EvidenceEvent } from '../../types/preschoolDevelopmental';
import {
  getAllEvidenceEvents,
  seedSamplePreschoolEventsIfEmpty,
} from '../../utils/preschoolStorage';
import { PreschoolChildrenView } from './PreschoolChildrenView';
import { PreschoolAssessView } from './PreschoolAssessView';
import { PreschoolActivitiesView } from './PreschoolActivitiesView';
import { PreschoolProgressView } from './PreschoolProgressView';
import { PreschoolClassInsightsView } from './PreschoolClassInsightsView';
import { PreschoolTeachingInsightsView } from './PreschoolTeachingInsightsView';
import { PreschoolParentsView } from './PreschoolParentsView';
import { PreschoolSchoolInsightsView } from './PreschoolSchoolInsightsView';
import { PreschoolAssessModal } from './PreschoolAssessModal';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Users, CheckCircle2, Sparkles, Clock, BookOpen,
  Compass, Heart, GraduationCap, Plus, ArrowLeft, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export type PreschoolTab =
  | 'children'
  | 'assess'
  | 'activities'
  | 'progress'
  | 'class-insights'
  | 'teaching-insights'
  | 'parents'
  | 'school-insights';

interface PreschoolContainerProps {
  currentUser: User;
  childrenList?: User[];
  onBack?: () => void;
  initialTab?: PreschoolTab;
}

// Starter roster of preschool children for immediate demo / exploration if none exist
const DEFAULT_PRESCHOOL_CHILDREN: User[] = [
  {
    id: 'child_kofi_01',
    name: 'Kofi Mensah',
    email: 'kofi.mensah@school.edu',
    role: 'student',
    school: 'Preschool Academy',
    age: 4.5,
    className: 'Kindergarten 1',
    classId: 'class_kg1',
    dateOfBirth: '2021-11-15',
  },
  {
    id: 'child_ama_02',
    name: 'Ama Asante',
    email: 'ama.asante@school.edu',
    role: 'student',
    school: 'Preschool Academy',
    age: 3.4,
    className: 'Nursery 2',
    classId: 'class_nur2',
    dateOfBirth: '2023-01-20',
  },
  {
    id: 'child_kwesi_03',
    name: 'Kwesi Boateng',
    email: 'kwesi.boateng@school.edu',
    role: 'student',
    school: 'Preschool Academy',
    age: 5.6,
    className: 'Kindergarten 2 (P4)',
    classId: 'class_kg2',
    dateOfBirth: '2020-10-05',
  },
  {
    id: 'child_efua_04',
    name: 'Efua Osei',
    email: 'efua.osei@school.edu',
    role: 'student',
    school: 'Preschool Academy',
    age: 2.8,
    className: 'Crèche & Nursery 1',
    classId: 'class_nur1',
    dateOfBirth: '2023-07-12',
  },
  {
    id: 'child_yaw_05',
    name: 'Yaw Addo',
    email: 'yaw.addo@school.edu',
    role: 'student',
    school: 'Preschool Academy',
    age: 5.8,
    className: 'Kindergarten 2 (P4)',
    classId: 'class_kg2',
    dateOfBirth: '2020-08-22',
  },
  {
    id: 'child_akua_06',
    name: 'Akua Badu',
    email: 'akua.badu@school.edu',
    role: 'student',
    school: 'Preschool Academy',
    age: 4.2,
    className: 'Kindergarten 1',
    classId: 'class_kg1',
    dateOfBirth: '2022-03-10',
  },
  {
    id: 'child_kojo_07',
    name: 'Kojo Frimpong',
    email: 'kojo.frimpong@school.edu',
    role: 'student',
    school: 'Preschool Academy',
    age: 3.8,
    className: 'Nursery 2',
    classId: 'class_nur2',
    dateOfBirth: '2022-08-18',
  },
  {
    id: 'child_abena_08',
    name: 'Abena Darko',
    email: 'abena.darko@school.edu',
    role: 'student',
    school: 'Preschool Academy',
    age: 5.3,
    className: 'Kindergarten 2 (P4)',
    classId: 'class_kg2',
    dateOfBirth: '2021-01-30',
  },
];

export function PreschoolContainer({
  currentUser,
  childrenList: rawChildren,
  onBack,
  initialTab = 'children',
}: PreschoolContainerProps) {
  const [activeTab, setActiveTab] = useState<PreschoolTab>(initialTab);
  const [events, setEvents] = useState<EvidenceEvent[]>([]);
  const [isAssessModalOpen, setIsAssessModalOpen] = useState(false);
  const [modalChildId, setModalChildId] = useState<string | undefined>(undefined);
  const [modalIndicatorId, setModalIndicatorId] = useState<string | undefined>(undefined);

  // Combine provided children with default sample children if list is empty
  const effectiveChildren = useMemo(() => {
    if (rawChildren && rawChildren.length > 0) {
      // If provided children have young ages or none specified, use them
      return rawChildren;
    }
    return DEFAULT_PRESCHOOL_CHILDREN;
  }, [rawChildren]);

  // Load Evidence Events and Seed sample events if empty
  const loadEvents = useCallback(() => {
    seedSamplePreschoolEventsIfEmpty(
      effectiveChildren,
      currentUser.id || 'teacher_01',
      currentUser.name || 'Classroom Teacher'
    );
    const loaded = getAllEvidenceEvents();
    setEvents(loaded);
  }, [effectiveChildren, currentUser]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Modal open helper
  const handleOpenAssessModal = (childId?: string, indicatorId?: string) => {
    setModalChildId(childId || effectiveChildren[0]?.id);
    setModalIndicatorId(indicatorId);
    setIsAssessModalOpen(true);
  };

  const navTabs: { id: PreschoolTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'children', label: 'Children Profiles', icon: Users, badge: `${effectiveChildren.length}` },
    { id: 'assess', label: 'Assess & Checklists', icon: CheckCircle2 },
    { id: 'activities', label: 'Play Bank', icon: Sparkles, badge: '8 Activities' },
    { id: 'progress', label: 'Progress Timeline', icon: Clock, badge: `${events.length}` },
    { id: 'class-insights', label: 'Class Insights', icon: Compass },
    { id: 'teaching-insights', label: 'Teaching Insights', icon: BookOpen },
    { id: 'parents', label: 'Family & Home', icon: Heart },
    { id: 'school-insights', label: 'School Leadership', icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16 space-y-6">
      {/* Top Header / Framework Identity */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                title="Return to Dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-[#6B4C9A] hover:bg-[#583D80] text-white text-[10px] tracking-wide font-bold">
                  JM-PDAF v1.0
                </Badge>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Ages 2–6 · 240 Indicators
                </span>
                <span className="hidden sm:inline text-xs text-slate-300 dark:text-slate-700">|</span>
                <span className="hidden sm:inline text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Assess • Understand • Support • Track • Improve
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Preschool Developmental Intelligence
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={loadEvents}
              className="h-8 text-xs text-slate-600 dark:text-slate-300 gap-1.5"
              title="Refresh Evidence"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>

            <Button
              size="sm"
              onClick={() => handleOpenAssessModal()}
              className="h-8 text-xs bg-[#6B4C9A] hover:bg-[#583D80] text-white gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Log Observation
            </Button>
          </div>
        </div>

        {/* 8-Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto no-scrollbar py-1">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2.5 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-[#6B4C9A] dark:text-purple-300 font-bold border-b-2 border-[#6B4C9A]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#6B4C9A] dark:text-purple-300' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                        isActive
                          ? 'bg-[#6B4C9A]/15 text-[#6B4C9A] dark:text-purple-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'children' && (
          <PreschoolChildrenView
            childrenList={effectiveChildren}
            events={events}
            onOpenAssessModal={handleOpenAssessModal}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'assess' && (
          <PreschoolAssessView
            childrenList={effectiveChildren}
            events={events}
            onOpenAssessModal={handleOpenAssessModal}
            onRefresh={loadEvents}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'activities' && (
          <PreschoolActivitiesView
            childrenList={effectiveChildren}
            events={events}
            onOpenAssessModal={handleOpenAssessModal}
            currentUser={currentUser}
            onRefresh={loadEvents}
          />
        )}

        {activeTab === 'progress' && (
          <PreschoolProgressView
            childrenList={effectiveChildren}
            events={events}
            currentUser={currentUser}
            onOpenAssessModal={handleOpenAssessModal}
            onRefresh={loadEvents}
          />
        )}

        {activeTab === 'class-insights' && (
          <PreschoolClassInsightsView
            childrenList={effectiveChildren}
            events={events}
            currentUser={currentUser}
            onOpenAssessModal={handleOpenAssessModal}
            onRefresh={loadEvents}
          />
        )}

        {activeTab === 'teaching-insights' && (
          <PreschoolTeachingInsightsView
            childrenList={effectiveChildren}
            events={events}
            currentUser={currentUser}
            onRefresh={loadEvents}
          />
        )}

        {activeTab === 'parents' && (
          <PreschoolParentsView
            childrenList={effectiveChildren}
            events={events}
            currentUser={currentUser}
            onRefresh={loadEvents}
          />
        )}

        {activeTab === 'school-insights' && (
          <PreschoolSchoolInsightsView
            childrenList={effectiveChildren}
            events={events}
            currentUser={currentUser}
            onRefresh={loadEvents}
          />
        )}
      </main>

      {/* Observation Modal */}
      {isAssessModalOpen && (
        <PreschoolAssessModal
          isOpen={isAssessModalOpen}
          onClose={() => setIsAssessModalOpen(false)}
          childrenList={effectiveChildren}
          preselectedChildId={modalChildId}
          preselectedIndicatorId={modalIndicatorId}
          currentUser={currentUser}
          onSaved={() => {
            loadEvents();
          }}
        />
      )}
    </div>
  );
}
