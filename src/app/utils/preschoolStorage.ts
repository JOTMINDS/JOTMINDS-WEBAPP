/**
 * JotMinds Preschool Developmental Assessment Framework (JM-PDAF v1.0)
 * Storage & Synchronization Engine
 * Persists Evidence Events locally in localStorage with Supabase sync capabilities.
 */

import { EvidenceEvent } from '../types/preschoolDevelopmental';
import { safeParse } from './storage';
import { createClient } from './supabase/client';

const PRESCHOOL_EVENTS_KEY = 'jotminds_preschool_evidence_events';

export function getAllEvidenceEvents(): EvidenceEvent[] {
  return safeParse<EvidenceEvent[]>(PRESCHOOL_EVENTS_KEY, []).filter(Boolean);
}

export function getEvidenceEventsForChild(childId: string): EvidenceEvent[] {
  return getAllEvidenceEvents().filter(e => e.childId === childId);
}

export function getEvidenceEventsForClass(classId: string): EvidenceEvent[] {
  return getAllEvidenceEvents().filter(e => e.classId === classId);
}

export function getEvidenceEventsForSchool(institutionId: string): EvidenceEvent[] {
  return getAllEvidenceEvents().filter(e => e.institutionId === institutionId);
}

export async function saveEvidenceEvent(event: EvidenceEvent): Promise<boolean> {
  try {
    const all = getAllEvidenceEvents();
    const index = all.findIndex(e => e.id === event.id);

    if (index >= 0) {
      all[index] = event;
    } else {
      all.unshift(event);
    }

    localStorage.setItem(PRESCHOOL_EVENTS_KEY, JSON.stringify(all));

    // Async background sync to Supabase if table exists
    try {
      const supabase = createClient();
      await (supabase.from as any)('preschool_evidence_events')
        .upsert({
          id: event.id,
          child_id: event.childId,
          indicator_id: event.indicatorId,
          domain_code: event.domainCode,
          rating: event.rating,
          method: event.method,
          observer_id: event.observerId,
          date: event.date,
          activity_context: event.activityContext,
          language_of_evidence: event.languageOfEvidence,
          notes: event.notes,
          class_id: event.classId,
          institution_id: event.institutionId,
          data: event,
        });
    } catch {}

    return true;
  } catch (err) {
    console.error('Failed to save preschool evidence event:', err);
    return false;
  }
}

export async function saveBatchEvidenceEvents(events: EvidenceEvent[]): Promise<boolean> {
  try {
    const all = getAllEvidenceEvents();
    const map = new Map<string, EvidenceEvent>(all.map(e => [e.id, e]));

    events.forEach(e => {
      map.set(e.id, e);
    });

    const updated = Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    localStorage.setItem(PRESCHOOL_EVENTS_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to save batch preschool evidence events:', err);
    return false;
  }
}

export async function deleteEvidenceEvent(eventId: string): Promise<boolean> {
  try {
    const all = getAllEvidenceEvents().filter(e => e.id !== eventId);
    localStorage.setItem(PRESCHOOL_EVENTS_KEY, JSON.stringify(all));

    try {
      const supabase = createClient();
      await (supabase.from as any)('preschool_evidence_events').delete().eq('id', eventId);
    } catch {}

    return true;
  } catch (err) {
    console.error('Failed to delete evidence event:', err);
    return false;
  }
}

/**
 * Seed sample evidence events for demo or newly created preschool children
 * so school leaders and teachers have rich data to explore immediately.
 */
export function seedSamplePreschoolEventsIfEmpty(children: any[], teacherId: string, teacherName: string): void {
  const existing = getAllEvidenceEvents();
  if (existing.length > 0 || !children || children.length === 0) return;

  const sampleEvents: EvidenceEvent[] = [];
  const today = new Date();

  children.slice(0, 8).forEach((child, cIdx) => {
    // 5-8 observations per child across diverse domains
    const baseDate = new Date(today);
    baseDate.setDate(today.getDate() - (cIdx * 2 + 1));

    const indicatorSamples = [
      { id: 'JM-CD-013', domain: 'JM-CD' as const, rating: 3 as const, method: 'ACT' as const, title: 'Build a Bridge', notes: 'Sorted blocks by shape accurately to construct bridge pillars.' },
      { id: 'JM-LC-014', domain: 'JM-LC' as const, rating: 3 as const, method: 'ORL' as const, title: 'Story Retelling', notes: 'Used full descriptive sentences to describe what happened in the picture.' },
      { id: 'JM-EN-008', domain: 'JM-EN' as const, rating: 3 as const, method: 'ACT' as const, title: "Teddy's Picnic", notes: 'Counted 6 plastic mango slices with 1-to-1 finger pointing.' },
      { id: 'JM-SE-023', domain: 'JM-SE' as const, rating: 2 as const, method: 'OBS' as const, title: 'Free Play Sharing', notes: 'Shared colored crayons with neighbor after gentle verbal reminder.' },
      { id: 'JM-PM-018', domain: 'JM-PM' as const, rating: 3 as const, method: 'ACT' as const, title: 'Fine Motor Stacking', notes: 'Positioned wooden blocks steadily with confident pinch grip.' },
      { id: 'JM-CE-004', domain: 'JM-CE' as const, rating: 4 as const, method: 'OBS' as const, title: 'Pretend Play Kitchen', notes: 'Created detailed role-play cooking jollof rice for class teddy bears.' },
      { id: 'JM-IL-008', domain: 'JM-IL' as const, rating: 3 as const, method: 'OBS' as const, title: 'Tidy-Up Routine', notes: 'Packed away puzzle pieces into designated shelf bins without prompting.' },
    ];

    indicatorSamples.forEach((sample, sIdx) => {
      const eventDate = new Date(baseDate);
      eventDate.setDate(baseDate.getDate() - sIdx);

      sampleEvents.push({
        id: `seed_pdaf_${child.id}_${sIdx}`,
        childId: child.id,
        childName: child.name || `Child ${cIdx + 1}`,
        indicatorId: sample.id,
        domainCode: sample.domain,
        rating: sample.rating,
        method: sample.method,
        date: eventDate.toISOString().split('T')[0],
        timestamp: eventDate.toISOString(),
        observerId: teacherId || 'teacher_demo',
        observerName: teacherName || 'Classroom Teacher',
        observerRole: 'teacher',
        activityContext: sample.title,
        languageOfEvidence: cIdx % 2 === 0 ? 'English' : 'Twi',
        notes: sample.notes,
        classId: child.classId,
        institutionId: child.institutionId,
      });
    });
  });

  if (sampleEvents.length > 0) {
    saveBatchEvidenceEvents(sampleEvents);
  }
}
