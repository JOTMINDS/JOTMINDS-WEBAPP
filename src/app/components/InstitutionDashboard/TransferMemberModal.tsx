import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { validateInstitutionCode, transferMember, transferStudent } from '../../utils/institution';
import { saveUser } from '../../utils/storage';

interface TransferMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberRole: 'teacher' | 'student';
  memberName: string;
  institutionId: string;
  institutionName: string;
  allPlatformUsers: any[];
  onTransferSuccess: () => void;
}

export function TransferMemberModal({
  isOpen,
  onClose,
  memberId,
  memberRole,
  memberName,
  institutionId,
  institutionName,
  allPlatformUsers,
  onTransferSuccess
}: TransferMemberModalProps) {
  const [transferCode, setTransferCode] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  useEffect(() => {
    setTransferCode('');
    setSelectedTeacherId('');
  }, [isOpen, memberId]);

  if (!isOpen) return null;

  const handleTeacherTransfer = async () => {
    if (!transferCode.trim()) {
      toast.error('Please enter the destination institution code.');
      return;
    }
    const val = await validateInstitutionCode(transferCode);
    if (!val.valid) {
      toast.error(val.errorMessage || 'Invalid code.');
      return;
    }

    const success = await transferMember(memberId, institutionId, transferCode);
    if (success) {
      const userToUpdate = allPlatformUsers.find(u => u.id === memberId);
      if (userToUpdate) {
        userToUpdate.organizationName = val.institution?.name;
        userToUpdate.organizationCode = val.institution?.code;
        saveUser(userToUpdate);
      }
      toast.success('Transfer successful.');
      onTransferSuccess();
      onClose();
    } else {
      toast.error('Failed to transfer. Ensure the code is correct.');
    }
  };

  const handleStudentTransfer = async () => {
    if (!selectedTeacherId) return;

    const teacher = allPlatformUsers.find(u => u.id === selectedTeacherId);
    if (!teacher) return;
    
    const success = await transferStudent(memberId, institutionId, selectedTeacherId, teacher.name);
    
    if (success) {
      const userToUpdate = allPlatformUsers.find(u => u.id === memberId);
      if (userToUpdate) {
        userToUpdate.teacherId = selectedTeacherId;
        userToUpdate.teacherName = teacher.name;
        saveUser(userToUpdate);
      }
      toast.success('Student successfully transferred to new class.');
      onTransferSuccess();
      onClose();
    } else {
      toast.error('Failed to transfer student.');
    }
  };

  if (memberRole === 'teacher') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Transfer Teacher</h3>
          <p className="text-sm text-gray-500 mb-4">Move <strong>{memberName}</strong> to another institution. You need the destination institution's <strong>Jots Code</strong>.</p>
          <div className="space-y-4">
            <div>
              <Label>Destination Jots Code</Label>
              <Input placeholder="JOTM-XXXXXX" value={transferCode} onChange={(e) => setTransferCode(e.target.value.toUpperCase())} className="mt-1 font-mono uppercase" />
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button style={{ backgroundColor: '#5B7DB1' }} onClick={handleTeacherTransfer}>Transfer</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-2">Transfer Student to Another Class</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select a new teacher to reassign <strong>{memberName}</strong> to their class.
        </p>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select New Teacher</label>
            <select
              className="w-full mt-1 border rounded-md p-2 bg-white"
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
            >
              <option value="">-- Choose Teacher --</option>
              {allPlatformUsers.filter(u => u.role === 'teacher' && u.organizationName === institutionName).map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button style={{ backgroundColor: '#1E8A6E' }} onClick={handleStudentTransfer} disabled={!selectedTeacherId}>Transfer Student</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
