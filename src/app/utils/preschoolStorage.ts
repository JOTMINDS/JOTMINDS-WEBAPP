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
  // Ignore fabricated sample events that earlier versions cached in localStorage.
  return safeParse<EvidenceEvent[]>(PRESCHOOL_EVENTS_KEY, []).filter(e => e && !String(e.id).startsWith('seed_pdaf_'));
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
