import React from 'react';
import { Button } from '../ui/button';
import { TeacherManagementContent } from './TeacherManagementContent';

interface TeacherManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  institutionId: string;
  allPlatformUsers: any[];
  onRefresh: () => Promise<void>;
}

export function TeacherManagementModal({
  isOpen,
  onClose,
  teacherId,
  institutionId,
  allPlatformUsers,
  onRefresh
}: TeacherManagementModalProps) {
  const teacher = allPlatformUsers.find(u => u.id === teacherId);

  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6B4C9A] text-white flex items-center justify-center font-bold">
              {teacher.name?.charAt(0) || 'T'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
              <p className="text-sm text-gray-500">Manage Teacher</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full w-8 h-8 p-0 text-xl font-bold">×</Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <TeacherManagementContent 
            teacher={teacher}
            institutionId={institutionId}
            allPlatformUsers={allPlatformUsers}
            onRefresh={onRefresh}
          />
        </div>

      </div>
    </div>
  );
}
