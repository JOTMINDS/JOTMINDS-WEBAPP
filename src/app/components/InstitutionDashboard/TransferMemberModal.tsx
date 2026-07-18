import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { validateInstitutionCode, transferMember, InstitutionMember } from '../../utils/institution';
import { saveUser, getAllClasses } from '../../utils/storage';

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
  institutionMembers?: InstitutionMember[];
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
  onTransferSuccess,
  institutionMembers = []
}: TransferMemberModalProps) {
  const [transferCode, setTransferCode] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  useEffect(() => {
    setTransferCode('');
    setSelectedClassId('');
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
    if (!selectedClassId && !selectedTeacherId) return;

    if (selectedClassId) {
      const instTeacherIds = new Set(institutionMembers.filter(m => m.role === 'teacher' || m.role === 'admin').map(m => m.userId));
      const classes = getAllClasses().filter(c => !c.classTeacherId || instTeacherIds.has(c.classTeacherId));
      const targetClass = classes.find(c => c.id === selectedClassId);
      if (!targetClass) return;
    }
    
    const userToUpdate = allPlatformUsers.find(u => u.id === memberId);
    if (userToUpdate) {
      if (selectedClassId) {
        userToUpdate.classId = selectedClassId;
        userToUpdate.teacherId = undefined;
      } else if (selectedTeacherId) {
        userToUpdate.teacherId = selectedTeacherId;
        userToUpdate.classId = undefined;
      }
      saveUser(userToUpdate);
      toast.success('Student successfully reassigned.');
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
        <h3 className="text-lg font-bold mb-2">Reassign Student</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select a new class or teacher for <strong>{memberName}</strong>.
        </p>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select New Class</label>
            <select
              className="w-full mt-1 border rounded-md p-2 bg-white"
              value={selectedClassId}
              onChange={(e) => { setSelectedClassId(e.target.value); setSelectedTeacherId(''); }}
            >
              <option value="">-- Choose Class --</option>
              {(() => {
                const instTeacherIds = new Set(institutionMembers.map(m => m.userId));
                return getAllClasses()
                  .filter(c => 
                    c.institutionId === institutionId || 
                    (!c.institutionId && (!c.classTeacherId || instTeacherIds.has(c.classTeacherId)))
                  )
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.academicYear})</option>
                  ));
              })()}
            </select>
          </div>
          <div className="relative flex items-center justify-center py-2">
            <div className="border-t w-full border-gray-200"></div>
            <span className="bg-white px-2 text-xs text-gray-500 absolute uppercase">or assign to teacher</span>
          </div>
          <div>
            <label className="text-sm font-medium">Select Teacher Directly</label>
            <select
              className="w-full mt-1 border rounded-md p-2 bg-white"
              value={selectedTeacherId}
              onChange={(e) => { setSelectedTeacherId(e.target.value); setSelectedClassId(''); }}
            >
              <option value="">-- Choose Teacher --</option>
              {(() => {
                const teachers = institutionMembers.filter(m => m.role === 'teacher' || m.role === 'admin');
                return teachers.map(t => (
                  <option key={t.userId} value={t.userId}>{t.userName}</option>
                ));
              })()}
            </select>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button style={{ backgroundColor: '#1E8A6E' }} onClick={handleStudentTransfer} disabled={!selectedClassId && !selectedTeacherId}>Assign Student</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
