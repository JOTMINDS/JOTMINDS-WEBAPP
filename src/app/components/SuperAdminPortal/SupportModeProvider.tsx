import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { requestSupportAccess as requestSupportAccessApi, getSupportAccessRequests } from '../../utils/api';

export type SupportAccessStatus = 'pending' | 'approved' | 'denied' | 'expired';

export interface SupportModeState {
  isActive: boolean;
  ticketNumber: string | null;
  reason: string | null;
  expiresAt: Date | null;
  pendingRequests: string[]; // target IDs with a request still awaiting the account owner's decision
  statusByTarget: Record<string, SupportAccessStatus>; // most recent decision per target ID
}

interface SupportModeContextType {
  supportMode: SupportModeState;
  activateSupportMode: (ticketNumber: string, reason: string, durationMinutes: number) => void;
  deactivateSupportMode: () => void;
  requestSupportAccess: (
    targetType: 'institution' | 'organization' | 'user',
    targetEmail: string,
    targetName: string,
    targetId: string,
    reason: string
  ) => Promise<boolean>;
  refreshSupportAccessRequests: () => Promise<void>;
}

const defaultState: SupportModeState = {
  isActive: false,
  ticketNumber: null,
  reason: null,
  expiresAt: null,
  pendingRequests: [],
  statusByTarget: {},
};

const SupportModeContext = createContext<SupportModeContextType | undefined>(undefined);

export function SupportModeProvider({ children }: { children: ReactNode }) {
  const [supportMode, setSupportMode] = useState<SupportModeState>(defaultState);

  // The account owner's decision happens outside the app (they click a link
  // in an email), so this view can only ever be as fresh as its last fetch -
  // pull real status from the backend instead of trusting local state alone.
  const refreshSupportAccessRequests = useCallback(async () => {
    try {
      const { requests } = await getSupportAccessRequests();
      const statusByTarget: Record<string, SupportAccessStatus> = {};
      (requests || []).forEach((r: any) => { statusByTarget[r.target_id] = r.status; });
      const pendingRequests = Object.entries(statusByTarget).filter(([, s]) => s === 'pending').map(([id]) => id);
      setSupportMode(prev => ({ ...prev, pendingRequests, statusByTarget }));
    } catch (err) {
      console.error('Failed to load support access requests:', err);
    }
  }, []);

  useEffect(() => { refreshSupportAccessRequests(); }, [refreshSupportAccessRequests]);

  const activateSupportMode = (ticketNumber: string, reason: string, durationMinutes: number) => {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);
    
    setSupportMode(prev => ({
      ...prev,
      isActive: true,
      ticketNumber,
      reason,
      expiresAt,
    }));
    
    // In a real implementation, we would also log this securely
    console.log(`[Audit Log] Support Mode Activated. Ticket: ${ticketNumber}, Reason: ${reason}`);
  };

  const deactivateSupportMode = () => {
    setSupportMode(prev => ({ ...defaultState, pendingRequests: prev.pendingRequests }));
    console.log(`[Audit Log] Support Mode Deactivated.`);
  };

  const requestSupportAccess = async (
    targetType: 'institution' | 'organization' | 'user',
    targetEmail: string,
    targetName: string,
    targetId: string,
    reason: string
  ) => {
    try {
      console.log(`[Audit Log] Requesting Support Access for ${targetEmail}`);
      await requestSupportAccessApi({ targetType, targetId, targetEmail, targetName, reason });
      setSupportMode(prev => ({
        ...prev,
        pendingRequests: [...prev.pendingRequests, targetId],
        statusByTarget: { ...prev.statusByTarget, [targetId]: 'pending' },
      }));
      return true;
    } catch (err) {
      console.error('Failed to request support access:', err);
      return false;
    }
  };

  return (
    <SupportModeContext.Provider value={{ supportMode, activateSupportMode, deactivateSupportMode, requestSupportAccess, refreshSupportAccessRequests }}>
      {children}
    </SupportModeContext.Provider>
  );
}

export function useSupportMode() {
  const context = useContext(SupportModeContext);
  if (context === undefined) {
    throw new Error('useSupportMode must be used within a SupportModeProvider');
  }
  return context;
}
