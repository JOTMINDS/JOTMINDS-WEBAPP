import React, { createContext, useContext, useState, ReactNode } from 'react';
import { sendEmail } from '../../utils/api';

export interface SupportModeState {
  isActive: boolean;
  ticketNumber: string | null;
  reason: string | null;
  expiresAt: Date | null;
  pendingRequests: string[]; // Store target IDs that we are waiting for approval from
}

interface SupportModeContextType {
  supportMode: SupportModeState;
  activateSupportMode: (ticketNumber: string, reason: string, durationMinutes: number) => void;
  deactivateSupportMode: () => void;
  requestSupportAccess: (targetEmail: string, targetName: string, targetId: string, reason: string) => Promise<boolean>;
}

const defaultState: SupportModeState = {
  isActive: false,
  ticketNumber: null,
  reason: null,
  expiresAt: null,
  pendingRequests: [],
};

const SupportModeContext = createContext<SupportModeContextType | undefined>(undefined);

export function SupportModeProvider({ children }: { children: ReactNode }) {
  const [supportMode, setSupportMode] = useState<SupportModeState>(defaultState);

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

  const requestSupportAccess = async (targetEmail: string, targetName: string, targetId: string, reason: string) => {
    try {
      console.log(`[Audit Log] Requesting Support Access for ${targetEmail}`);
      
      const subject = "JOTMinds Support Access Request";
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Support Access Request</h2>
          <p>Hello ${targetName},</p>
          <p>A JOTMinds Super Admin has requested temporary audited support access to your account/tenant to assist you.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>If you approve this request, the admin will have temporary access to view and manage your data. All actions will be strictly audited.</p>
          <div style="margin: 30px 0;">
            <a href="#" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Approve Access</a>
            <a href="#" style="margin-left: 10px; color: #dc2626; text-decoration: underline;">Deny</a>
          </div>
          <p style="font-size: 12px; color: #666;">If you did not request support, you can safely ignore this email.</p>
        </div>
      `;

      await sendEmail(targetEmail, subject, htmlContent);
      
      setSupportMode(prev => ({
        ...prev,
        pendingRequests: [...prev.pendingRequests, targetId]
      }));

      return true;
    } catch (err) {
      console.error("Failed to send support access request email:", err);
      return false;
    }
  };

  return (
    <SupportModeContext.Provider value={{ supportMode, activateSupportMode, deactivateSupportMode, requestSupportAccess }}>
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
