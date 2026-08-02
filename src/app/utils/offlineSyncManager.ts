import { createClient } from './supabase/client';
import { projectId } from './supabase/info';
import { toast } from 'sonner';

export type OfflineActionType = 'ASSESSMENT' | 'REFLECTION' | 'LESSON_PLAN' | 'FEEDBACK';

export interface PendingOfflineAction {
  id: string;
  type: OfflineActionType;
  payload: any;
  createdAt: string;
  retries: number;
}

const OFFLINE_QUEUE_KEY = 'jotminds_offline_sync_queue';
type SyncListener = (pendingCount: number, isSyncing: boolean) => void;
const listeners: SyncListener[] = [];

/**
 * Get all queued offline items from localStorage
 */
export function getOfflineQueue(): PendingOfflineAction[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save updated queue to localStorage & notify listeners
 */
function saveOfflineQueue(queue: PendingOfflineAction[], isSyncing: boolean = false) {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('[OfflineSync] Error saving queue to localStorage:', e);
  }
  notifyListeners(queue.length, isSyncing);
}

/**
 * Add a new item to the offline sync queue
 */
export function enqueueOfflineAction(type: OfflineActionType, payload: any): PendingOfflineAction {
  const queue = getOfflineQueue();
  const action: PendingOfflineAction = {
    id: `sync-${type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
  };

  queue.push(action);
  saveOfflineQueue(queue, false);
  console.log(`[OfflineSync] Enqueued ${type} action:`, action.id);
  return action;
}

/**
 * Subscribe to sync state changes (pending count, syncing indicator)
 */
export function subscribeToSyncState(listener: SyncListener): () => void {
  listeners.push(listener);
  // Initial callback
  listener(getOfflineQueue().length, false);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyListeners(count: number, syncing: boolean) {
  listeners.forEach((fn) => fn(count, syncing));
}

let isSyncingActive = false;

/**
 * Flush the offline queue by uploading pending items to Supabase cloud storage
 */
export async function flushOfflineQueue(): Promise<{ syncedCount: number; failedCount: number }> {
  if (isSyncingActive || !navigator.onLine) {
    return { syncedCount: 0, failedCount: 0 };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, failedCount: 0 };
  }

  isSyncingActive = true;
  notifyListeners(queue.length, true);
  toast.info(`Auto-Syncing ${queue.length} offline item${queue.length > 1 ? 's' : ''} to JotMinds cloud...`);

  const supabase = createClient();
  const remainingQueue: PendingOfflineAction[] = [];
  let syncedCount = 0;
  let failedCount = 0;

  for (const action of queue) {
    try {
      let success = false;

      if (action.type === 'ASSESSMENT') {
        const { error } = await (supabase.from('assessments' as any) as any)
          .upsert({
            id: action.payload.id,
            user_id: action.payload.userId,
            type: action.payload.type,
            score: action.payload.score,
            answers: action.payload.answers,
            completed_at: action.payload.completedAt || new Date().toISOString(),
          });
        success = !error;
      } else if (action.type === 'REFLECTION') {
        const { error } = await (supabase.from('reflections' as any) as any)
          .upsert({
            id: action.payload.id,
            user_id: action.payload.userId,
            assessment_id: action.payload.assessmentId,
            content: action.payload.content,
            created_at: action.payload.createdAt || new Date().toISOString(),
          });
        success = !error;
      } else if (action.type === 'LESSON_PLAN') {
        const { error } = await (supabase.from('lesson_plans' as any) as any)
          .upsert({
            id: action.payload.id,
            teacher_id: action.payload.teacherId || action.payload.userId,
            title: action.payload.title,
            subject: action.payload.subject,
            class_level: action.payload.classLevel,
            plan_data: action.payload,
            created_at: action.payload.createdAt || new Date().toISOString(),
          });
        success = !error;
      } else if (action.type === 'FEEDBACK') {
        const { error } = await (supabase.from('feedback' as any) as any)
          .upsert({
            id: action.payload.id,
            rating: action.payload.rating,
            category: action.payload.category,
            comments: action.payload.comments,
            created_at: action.payload.createdAt || new Date().toISOString(),
          });
        success = !error;
      } else {
        success = true; // Fallback mark done
      }

      if (success) {
        syncedCount++;
      } else {
        action.retries += 1;
        if (action.retries < 5) {
          remainingQueue.push(action);
        }
        failedCount++;
      }
    } catch (err) {
      console.warn(`[OfflineSync] Failed to sync action ${action.id}:`, err);
      action.retries += 1;
      if (action.retries < 5) {
        remainingQueue.push(action);
      }
      failedCount++;
    }
  }

  isSyncingActive = false;
  saveOfflineQueue(remainingQueue, false);

  if (syncedCount > 0) {
    toast.success(`Successfully synchronized ${syncedCount} item${syncedCount > 1 ? 's' : ''} to Cloud! 🌩️✨`);
  }

  return { syncedCount, failedCount };
}

// Auto-trigger sync when coming online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    setTimeout(() => {
      flushOfflineQueue();
    }, 1500);
  });
}
