import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Download, Upload, Loader } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

interface OrganizationBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationName: string;
  organizationCode: string;
  supervisorName: string;
  onSuccess?: () => void;
}

export function OrganizationBulkUploadModal({
  isOpen,
  onClose,
  organizationName,
  organizationCode,
  supervisorName
}: OrganizationBulkUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  if (!isOpen) return null;

  const handleBulkInvite = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        
        // Filter out empty lines and header
        const validLines = lines.slice(1).map(line => line.trim()).filter(line => line.length > 0);
        
        setTotal(validLines.length);
        let imported = 0;
        let failed = 0;

        for (let i = 0; i < validLines.length; i++) {
          const line = validLines[i];
          // CSV format: Name, Email, Department
          const [name, email, department] = line.split(',');
          
          if (name && email) {
            try {
              const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/send-professional-invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: email.trim(),
                  professionalName: name.trim(),
                  organizationName: organizationName,
                  organizationCode: organizationCode,
                  supervisorName: supervisorName,
                  department: department?.trim() // Optional department field if we want to pass it
                })
              });
              
              if (response.ok) {
                imported++;
              } else {
                failed++;
              }
            } catch (err) {
              failed++;
            }
          }
          setProgress(i + 1);
        }

        if (failed > 0) {
          toast.warning(`Sent ${imported} invitations. ${failed} failed.`);
        } else {
          toast.success(`Successfully sent ${imported} invitations.`);
        }
        
        setTimeout(() => {
          onClose();
          setProgress(0);
          setTotal(0);
        }, 1500);

      } catch (err) {
        toast.error('Error parsing CSV file');
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-2">Bulk Invite Team Members</h3>
        <p className="text-sm text-gray-500 mb-4">Upload a CSV file containing your team members' details to invite them all at once.</p>

        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">Expected Format:</h4>
          <pre className="text-xs bg-gray-100 p-2 rounded">
            Name, Email, Department{'\n'}
            Jane Doe, jane@example.com, Marketing{'\n'}
            John Smith, john@example.com, Engineering
          </pre>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" size="sm" onClick={() => {
            const csvContent = "Name,Email,Department\nJane Doe,jane@example.com,Marketing\nJohn Smith,john@example.com,Engineering";
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'team_invite_template.csv';
            a.click();
          }}>
            <Download className="w-4 h-4 mr-2" /> Download Template
          </Button>
        </div>

        {isUploading ? (
          <div className="border-2 border-gray-200 rounded-lg p-6 text-center space-y-3">
            <Loader className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <p className="text-sm font-medium text-gray-600">
              Sending Invitations... {progress} / {total}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${total > 0 ? (progress / total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
            <Input type="file" accept=".csv" className="hidden" id="org-csv-upload" onChange={handleBulkInvite} disabled={isUploading} />
            <label htmlFor="org-csv-upload" className="cursor-pointer flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 font-medium">Click to upload CSV</span>
              <span className="text-xs text-gray-400 mt-1">Maximum 100 rows</span>
            </label>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isUploading}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
