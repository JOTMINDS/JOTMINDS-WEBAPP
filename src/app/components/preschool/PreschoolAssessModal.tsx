import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../../types';
import {
  DevelopmentalBand,
  DevelopmentalDomainCode,
  AssessmentMethodCode,
  DevelopmentalRating,
  LanguageOfEvidence,
  EvidenceEvent,
  DEVELOPMENTAL_DOMAINS,
  DEVELOPMENTAL_RATINGS,
  ASSESSMENT_METHODS,
  SUPPORTED_LANGUAGES,
} from '../../types/preschoolDevelopmental';
import { MASTER_PRESCHOOL_INDICATORS, INDICATORS_BY_ID } from '../../data/preschoolIndicators';
import { saveEvidenceEvent, getEvidenceEventsForChild } from '../../utils/preschoolStorage';
import { resolveChildBand } from '../../utils/preschoolEngine';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  X, CheckCircle2, Sparkles, BookOpen, Clock,
  MessageSquare, User as UserIcon, HeartHandshake,
  Activity, Compass, Brain, Calculator
} from 'lucide-react';
import { toast } from 'sonner';

interface PreschoolAssessModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: User[];
  preselectedChildId?: string | null;
  preselectedIndicatorId?: string | null;
  preselectedActivityTitle?: string;
  onSaved?: () => void;
  currentUser: User;
}

export function PreschoolAssessModal({
  isOpen,
  onClose,
  childrenList,
  preselectedChildId,
  preselectedIndicatorId,
  preselectedActivityTitle,
  onSaved,
  currentUser,
}: PreschoolAssessModalProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>(preselectedChildId || childrenList[0]?.id || '');
  const [selectedDomain, setSelectedDomain] = useState<DevelopmentalDomainCode>('JM-CD');
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>(preselectedIndicatorId || 'JM-CD-001');
  const [selectedRating, setSelectedRating] = useState<DevelopmentalRating>(3);
  const [selectedMethod, setSelectedMethod] = useState<AssessmentMethodCode>('OBS');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOfEvidence>('English');
  const [activityContext, setActivityContext] = useState<string>(preselectedActivityTitle || 'Classroom Free Play');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedChildId) setSelectedChildId(preselectedChildId);
  }, [preselectedChildId]);

  useEffect(() => {
    if (preselectedIndicatorId) {
      setSelectedIndicatorId(preselectedIndicatorId);
      const ind = INDICATORS_BY_ID[preselectedIndicatorId];
      if (ind) {
        setSelectedDomain(ind.domainCode);
        setSelectedMethod(ind.defaultMethod);
      }
    }
  }, [preselectedIndicatorId]);

  useEffect(() => {
    if (preselectedActivityTitle) {
      setActivityContext(preselectedActivityTitle);
    }
  }, [preselectedActivityTitle]);

  const selectedChild = childrenList.find(c => c.id === selectedChildId);
  const childBand = selectedChild ? resolveChildBand(selectedChild) : 'P3';

  // Filter indicators for chosen domain
  const availableIndicators = useMemo(() => {
    return MASTER_PRESCHOOL_INDICATORS.filter(ind => ind.domainCode === selectedDomain);
  }, [selectedDomain]);

  const activeIndicator = INDICATORS_BY_ID[selectedIndicatorId] || availableIndicators[0];

  // When domain changes, pick first indicator in that domain if current doesn't match
  const handleDomainChange = (code: DevelopmentalDomainCode) => {
    setSelectedDomain(code);
    const firstInd = MASTER_PRESCHOOL_INDICATORS.find(ind => ind.domainCode === code);
    if (firstInd) {
      setSelectedIndicatorId(firstInd.id);
      setSelectedMethod(firstInd.defaultMethod);
    }
  };

  // Check previous evidence events for confidence prediction
  const existingEventsForIndicator = useMemo(() => {
    if (!selectedChildId || !selectedIndicatorId) return [];
    const events = getEvidenceEventsForChild(selectedChildId);
    return events.filter(e => e.indicatorId === selectedIndicatorId);
  }, [selectedChildId, selectedIndicatorId]);

  const nextEventCount = existingEventsForIndicator.length + 1;
  const predictedConfidence =
    nextEventCount >= 3 ? 'High Confidence (3+ Events)' : nextEventCount === 2 ? 'Moderate Confidence (2 Events)' : 'Initial Observation (Low Confidence)';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) {
      toast.error('Please select a child to record observation.');
      return;
    }

    if (!activeIndicator) {
      toast.error('Please select an indicator.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newEvent: EvidenceEvent = {
        id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        childId: selectedChild.id,
        childName: selectedChild.name || 'Child',
        indicatorId: activeIndicator.id,
        domainCode: activeIndicator.domainCode,
        rating: selectedRating,
        method: selectedMethod,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        observerId: currentUser.id,
        observerName: currentUser.name || 'Educator',
        observerRole: (currentUser.role as any) === 'parent' ? 'parent' : 'teacher',
        activityContext: activityContext.trim() || 'Classroom Routine',
        languageOfEvidence: selectedLanguage,
        notes: notes.trim(),
        classId: selectedChild.classId,
        institutionId: selectedChild.institutionId || (currentUser as any).institutionId,
      };

      const ok = await saveEvidenceEvent(newEvent);
      if (ok) {
        toast.success(`Developmental evidence recorded for ${selectedChild.name}!`);
        if (onSaved) onSaved();
        onClose();
        setNotes('');
      } else {
        toast.error('Failed to save observation. Please try again.');
      }
    } catch (err) {
      toast.error('Error recording evidence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-white">Record Developmental Evidence</h3>
              <p className="text-xs text-indigo-200">
                Preschool Observation & Milestone Logging (JM-PDAF v1.0)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* 1. Child Selection */}
          <div>
            <Label className="font-semibold text-gray-700 block mb-1">Select Child</Label>
            <select
              value={selectedChildId}
              onChange={e => setSelectedChildId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {childrenList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.age ? `(${c.age} yrs)` : ''}
                </option>
              ))}
            </select>
            {selectedChild && (
              <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                <span>Band: <b>{childBand}</b></span>
                <span>•</span>
                <span>Previous observations: <b>{existingEventsForIndicator.length}</b></span>
                <span>•</span>
                <span className="text-indigo-600 font-medium">{predictedConfidence}</span>
              </div>
            )}
          </div>

          {/* 2. Core Developmental Domain */}
          <div>
            <Label className="font-semibold text-gray-700 block mb-1">Developmental Domain</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(Object.keys(DEVELOPMENTAL_DOMAINS) as DevelopmentalDomainCode[]).map(code => {
                const isSelected = selectedDomain === code;
                const d = DEVELOPMENTAL_DOMAINS[code];
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleDomainChange(code)}
                    className={`p-2 rounded-lg text-left border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold ring-1 ring-indigo-500'
                        : 'border-gray-200 bg-gray-50/50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="line-clamp-1">{d.shortName}</span>
                    <span className="text-[10px] text-gray-400 font-normal">{d.code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Specific Indicator */}
          <div>
            <Label className="font-semibold text-gray-700 block mb-1">Observable Indicator</Label>
            <select
              value={selectedIndicatorId}
              onChange={e => {
                setSelectedIndicatorId(e.target.value);
                const ind = INDICATORS_BY_ID[e.target.value];
                if (ind) setSelectedMethod(ind.defaultMethod);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableIndicators.map(ind => (
                <option key={ind.id} value={ind.id}>
                  [{ind.id}] ({ind.band}) {ind.title}
                </option>
              ))}
            </select>
            {activeIndicator && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mt-2 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Cluster: <b>{activeIndicator.clusterName}</b></span>
                  <span>Primary Method: <b>{activeIndicator.primaryAssessment}</b></span>
                </div>
                <p className="text-gray-700 font-medium">
                  {activeIndicator.behaviourToObserve}
                </p>
              </div>
            )}
          </div>

          {/* 4. Developmental Rating Stage */}
          <div>
            <Label className="font-semibold text-gray-700 block mb-1">Observed Developmental Stage</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(num => {
                const r = num as DevelopmentalRating;
                const info = DEVELOPMENTAL_RATINGS[r];
                const isSelected = selectedRating === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRating(r)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-400 font-bold shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-black mb-0.5" style={{ color: info.color }}>
                      Stage {r}
                    </div>
                    <div className="text-[11px] font-semibold">{info.stage}</div>
                  </button>
                );
              })}
            </div>

            {/* Live Behavioral Anchor Preview */}
            {activeIndicator?.anchors && (
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl mt-2 text-[11px]">
                <span className="font-bold text-indigo-900 block mb-0.5">
                  Behavioural Anchor for Stage {selectedRating} ({DEVELOPMENTAL_RATINGS[selectedRating].stage}):
                </span>
                <p className="text-indigo-800">
                  {selectedRating === 1
                    ? activeIndicator.anchors.emerging
                    : selectedRating === 2
                    ? activeIndicator.anchors.developing
                    : selectedRating === 3
                    ? activeIndicator.anchors.achieving
                    : activeIndicator.anchors.extending}
                </p>
              </div>
            )}
          </div>

          {/* 5. Assessment Method & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="font-semibold text-gray-700 block mb-1">Assessment Method</Label>
              <select
                value={selectedMethod}
                onChange={e => setSelectedMethod(e.target.value as AssessmentMethodCode)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none"
              >
                {(Object.keys(ASSESSMENT_METHODS) as AssessmentMethodCode[]).map(code => (
                  <option key={code} value={code}>
                    {ASSESSMENT_METHODS[code].code} - {ASSESSMENT_METHODS[code].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="font-semibold text-gray-700 block mb-1">Language of Evidence</Label>
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value as LanguageOfEvidence)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6. Activity Context */}
          <div>
            <Label className="font-semibold text-gray-700 block mb-1">Activity Context / Setting</Label>
            <Input
              value={activityContext}
              onChange={e => setActivityContext(e.target.value)}
              placeholder="e.g. Build a Bridge, Teddy's Picnic, Morning Circle"
              className="text-xs"
            />
          </div>

          {/* 7. Observational Notes */}
          <div>
            <Label className="font-semibold text-gray-700 block mb-1">
              Observational Evidence Notes (Optional)
            </Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Describe what the child said, constructed, or demonstrated during the activity..."
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isSubmitting ? 'Recording...' : 'Save Evidence Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
