import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2 } from 'lucide-react';
import { inviteMember } from '../../utils/institution';
import { sendEmail } from '../../utils/api';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionId: string;
  institutionName: string;
  institutionCode: string;
  onInviteSuccess: () => void;
  initialEmail?: string;
  initialRole?: 'teacher' | 'student';
}

export function InviteMemberModal({
  isOpen,
  onClose,
  institutionId,
  institutionName,
  institutionCode,
  onInviteSuccess,
  initialEmail = '',
  initialRole = 'teacher'
}: InviteMemberModalProps) {
  const [inviteEmailState, setInviteEmail] = useState(initialEmail);
  const [inviteRole, setInviteRole] = useState<'teacher' | 'student'>(initialRole);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    setInviteEmail(initialEmail);
    setInviteRole(initialRole);
  }, [initialEmail, initialRole, isOpen]);

  if (!isOpen) return null;

  const handleInvite = async () => {
    if (!inviteEmailState.trim() || !inviteEmailState.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsInviting(true);
    try {
      const subject = `You've been invited to join ${institutionName} on JotMinds!`;
      const signupLink = `${window.location.origin}/?mode=signup&code=${institutionCode}&role=${inviteRole}`;

      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #6B4C9A; padding: 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">JotMinds</h1>
          </div>
          <div style="padding: 24px; color: #374151;">
            <h2 style="margin-top: 0; color: #111827;">Institution Invitation</h2>
            <p>Hello!</p>
            <p>You have been invited to join <strong>${institutionName}</strong> as an <strong>${inviteRole === 'teacher' ? 'Educator' : 'Student'}</strong> on JotMinds.</p>
            <p>Click the button below to create your account and automatically link your profile to the institution. Your organization code is <strong>${institutionCode}</strong>.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${signupLink}" style="background-color: #6B4C9A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Join Institution</a>
            </div>
            <p style="font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 32px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${signupLink}" style="color: #6B4C9A;">${signupLink}</a>
            </p>
          </div>
        </div>
      `;

      await sendEmail(inviteEmailState, subject, htmlContent);
      await inviteMember(inviteEmailState, inviteRole, institutionId);
      
      toast.success(`Invitation sent to ${inviteEmailState}. They will receive an email shortly with a link to join.`);
      onInviteSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error('Error sending invitation. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Invite Member</h3>
        <p className="text-sm text-gray-500 mb-4">Send an invitation link and institution code to an email address.</p>
        <div className="space-y-4">
          <div>
            <Label>Role</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 mb-4"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'teacher' | 'student')}
            >
              <option value="teacher">Educator / Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div>
            <Label>Email Address</Label>
            <Input type="email" placeholder="user@school.edu" value={inviteEmailState} onChange={(e) => setInviteEmail(e.target.value)} className="mt-1" />
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="ghost" onClick={onClose} disabled={isInviting}>Cancel</Button>
            <Button style={{ backgroundColor: '#6B4C9A' }} onClick={handleInvite} disabled={isInviting}>
              {isInviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Send Invite
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
