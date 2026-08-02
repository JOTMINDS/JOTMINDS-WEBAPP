import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showReconnectedToast, setShowReconnectedToast] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedToast(true);
      toast.success('Connection Restored! Local data synchronized.');
      setTimeout(() => setShowReconnectedToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are currently offline. Changes are saved locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnectedToast) return null;

  return (
    <div className={`fixed top-0 inset-x-0 z-50 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-md transition-all ${
      !isOnline ? 'bg-amber-600 dark:bg-amber-700' : 'bg-emerald-600 dark:bg-emerald-700'
    }`}>
      {!isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>Offline Mode Active • Your assessments and lesson plans are saved locally and will auto-sync when online.</span>
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
