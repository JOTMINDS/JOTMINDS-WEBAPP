import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { subscribeToSyncState, flushOfflineQueue } from '../utils/offlineSyncManager';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showReconnectedToast, setShowReconnectedToast] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeToSyncState((count, syncing) => {
      setPendingCount(count);
      setIsSyncing(syncing);
    });

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedToast(true);
      flushOfflineQueue();
      setTimeout(() => setShowReconnectedToast(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Offline Mode: Your assessments and lesson plans are saved locally and queued for auto-sync.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnectedToast && pendingCount === 0) return null;

  return (
    <div className={`fixed top-0 inset-x-0 z-50 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-md transition-all ${
      !isOnline
        ? 'bg-amber-600 dark:bg-amber-700'
        : isSyncing || pendingCount > 0
        ? 'bg-indigo-600 dark:bg-indigo-700'
        : 'bg-emerald-600 dark:bg-emerald-700'
    }`}>
      {!isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>
            Offline Mode Active • {pendingCount > 0 ? `${pendingCount} item${pendingCount > 1 ? 's' : ''} saved locally.` : 'Data saved locally.'} Will auto-sync when online.
          </span>
        </>
      ) : isSyncing ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Synchronizing {pendingCount} offline item{pendingCount > 1 ? 's' : ''} to JotMinds cloud...</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Internet Connection Restored • Synced with JotMinds Supabase database.</span>
        </>
      )}
    </div>
  );
};
