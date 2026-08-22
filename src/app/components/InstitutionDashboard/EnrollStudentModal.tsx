import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Copy, CheckCircle2, UserPlus, RefreshCw, AlertTriangle } from 'lucide-react';
import { enrollStudent } from '../../utils/api';
import { toast } from 'sonner';

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  institutionId?: string;
  classId?: string;
  className?: string;
  onStudentEnrolled?: (student: any, code: string) => void;
}

export function EnrollStudentModal({ 
  isOpen, 
  onClose, 
  teacherId, 
  institutionId,
  classId = '',
  className,
  onStudentEnrolled 
}: EnrollStudentModalProps) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [enrolledStudentName, setEnrolledStudentName] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  // For duplicate handling
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setDob('');
    setSuccessCode(null);
    setEnrolledStudentName('');
    setCopied(false);
    setDuplicateWarning(null);
  };

  const copyCode = () => {
    if (successCode) {
      navigator.clipboard.writeText(successCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Code copied to clipboard');
    }
  };

  const handleEnroll = async (ignoreDuplicate = false) => {
    if (!name.trim() || !dob.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setDuplicateWarning(null);

    try {
      const response = await enrollStudent({
        studentName: name.trim(),
        dateOfBirth: dob.trim(),
        classId,
        teacherId,
        institutionId
      });

      if (response.duplicate && !ignoreDuplicate) {
        setDuplicateWarning(response.existingStudent);
        setIsSubmitting(false);
        return;
      }

      if (response.success) {
        setSuccessCode(response.code);
        setEnrolledStudentName(response.student?.name || name.trim());
        toast.success('Student enrolled successfully!');
        
        if (onStudentEnrolled) {
          onStudentEnrolled(response.student, response.code);
        }
      } else {
        toast.error('Failed to enroll student');
      }
    } catch (err: any) {
      console.error('Enrollment error:', err);
      toast.error(err.message || 'An error occurred during enrollment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: any) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            Enroll Student
          </DialogTitle>
          <DialogDescription>
            {className 
              ? `Enroll a new student directly into ${className}.` 
              : 'Enroll a new student and generate their access code.'}
          </DialogDescription>
        </DialogHeader>

        {successCode ? (
          <div className="space-y-6 py-4">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-sm font-medium flex flex-col items-center justify-center gap-2 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-1" />
              <p>Successfully enrolled <strong>{enrolledStudentName}</strong>!</p>
              <p className="text-xs text-emerald-600 mt-1">
                Provide this code to the student to sign in.
              </p>
            </div>
            
            <Card className="border-indigo-100 shadow-md bg-indigo-50/50">
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                <span className="text-sm font-medium text-indigo-900 uppercase tracking-wider">Student Code</span>
                <code className="text-4xl font-black text-indigo-700 tracking-widest">
                  {successCode}
                </code>
                <Button
                  variant="outline"
                  onClick={copyCode}
                  className="mt-2 w-full max-w-[200px] border-indigo-200 hover:bg-indigo-100 text-indigo-700"
                >
                  {copied ? (
                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Copied!</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-2" /> Copy Code</>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="pt-4 flex justify-end gap-2 border-t">
              <Button variant="outline" onClick={resetForm}>
                Enroll Another
              </Button>
              <Button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {duplicateWarning && (
              <Card className="border-amber-200 bg-amber-50 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">Possible Duplicate Student</h4>
                      <p className="text-xs text-amber-700 mt-1">
                        A student named "{duplicateWarning.name}" with the same date of birth already exists in the system.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-white border-amber-200 text-amber-800 hover:bg-amber-100"
                          onClick={() => setDuplicateWarning(null)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                          onClick={() => handleEnroll(true)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Enrolling...' : 'Enroll Anyway'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Student Full Name (Required)</label>
                <Input
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting || !!duplicateWarning}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date of Birth (Required)</label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  disabled={isSubmitting || !!duplicateWarning}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t">
              <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button
                onClick={() => handleEnroll()}
                disabled={isSubmitting || !name.trim() || !dob.trim() || !!duplicateWarning}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSubmitting ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Enrolling...</>
                ) : (
                  'Enroll Student'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
