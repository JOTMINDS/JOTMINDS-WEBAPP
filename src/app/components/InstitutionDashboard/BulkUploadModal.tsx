import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Download, Upload } from 'lucide-react';
import { saveUser } from '../../utils/storage';
import { addMember } from '../../utils/institution';
import { User } from '../../types';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionId: string;
  institutionName: string;
  institutionCode: string;
  onUploadSuccess: () => void;
}

export function BulkUploadModal({
  isOpen,
  onClose,
  institutionId,
  institutionName,
  institutionCode,
  onUploadSuccess
}: BulkUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleBulkStudentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        let imported = 0;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const [name, email, phone, dateOfBirth] = line.split(',');
          if (name && email) {
            const newStudent: User = {
              id: `usr_${Date.now()}_${i}`,
              role: 'student',
              name: name.trim(),
              email: email.trim(),
              phone: phone?.trim() || '',
              dateOfBirth: dateOfBirth?.trim() || '',
              school: institutionName,
              organizationName: institutionName,
              createdAt: new Date().toISOString()
            };

            saveUser(newStudent);

            // Add to institution members as approved
            await addMember(institutionId, {
              userId: newStudent.id,
              userName: newStudent.name,
              userEmail: newStudent.email,
              userPhone: newStudent.phone,
              role: 'student',
              joinedViaCode: institutionCode,
              status: 'approved'
            });

            imported++;
          }
        }

        toast.success(`Successfully imported ${imported} students.`);
        onUploadSuccess();
        onClose();
      } catch (err) {
        toast.error('Error parsing CSV file');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-2">Bulk Upload Students</h3>
        <p className="text-sm text-gray-500 mb-4">Upload a CSV file containing the student roster for this institution.</p>

        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">Expected Format:</h4>
          <pre className="text-xs bg-gray-100 p-2 rounded">
            Name, Email, Phone, DateOfBirth{'\n'}
            Jane Doe, jane@example.com, 1234567890, 2010-05-15
          </pre>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" size="sm" onClick={() => {
            const csvContent = "Name,Email,Phone,DateOfBirth\nStudent Name,student@example.com,,2010-01-01";
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'students_template.csv';
            a.click();
          }}>
            <Download className="w-4 h-4 mr-2" /> Download Template
          </Button>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Input type="file" accept=".csv" className="hidden" id="inst-csv-upload" onChange={handleBulkStudentUpload} disabled={isUploading} />
          <label htmlFor="inst-csv-upload" className="cursor-pointer flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600 font-medium">Click to upload CSV</span>
            <span className="text-xs text-gray-400 mt-1">Maximum 500 rows</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isUploading}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
