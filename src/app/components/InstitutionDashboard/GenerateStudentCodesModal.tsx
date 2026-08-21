import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Plus, X, Copy, CheckCircle2, UserPlus, RefreshCw } from 'lucide-react';
import { StudentCode } from '../../types';
import { generateId } from '../../utils/storage';

interface GenerateStudentCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  institutionId?: string;
}

const getStudentCodes = (): StudentCode[] => {
  const codes = localStorage.getItem('jtm_student_codes');
  return codes ? JSON.parse(codes) : [];
};

const saveStudentCodes = (codes: StudentCode[]) => {
  localStorage.setItem('jtm_student_codes', JSON.stringify(codes));
};

export function GenerateStudentCodesModal({ isOpen, onClose, teacherId, institutionId }: GenerateStudentCodesModalProps) {
  const [students, setStudents] = useState<Array<{ name: string; dob: string; id: string }>>([
    { name: '', dob: '', id: generateId() }
  ]);
  const [generatedCodes, setGeneratedCodes] = useState<StudentCode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStudents([{ name: '', dob: '', id: generateId() }]);
      setGeneratedCodes([]);
    }
  }, [isOpen]);

  const addStudentRow = () => {
    setStudents([...students, { name: '', dob: '', id: generateId() }]);
  };

  const removeStudentRow = (id: string) => {
    if (students.length > 1) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const updateStudent = (id: string, field: 'name' | 'dob', value: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const generateCodes = async () => {
    setIsGenerating(true);
    
    const validStudents = students.filter(s => s.name.trim().length > 0);
    
    if (validStudents.length === 0) {
      setIsGenerating(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const newCodes: StudentCode[] = validStudents.map(student => ({
        id: generateId(),
        code: `JTM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        studentName: student.name.trim(),
        studentDOB: student.dob.trim() || undefined,
        teacherId,
        institutionId,
        isUsed: false,
        createdAt: new Date().toISOString()
      }));

      const existingCodes = getStudentCodes();
      saveStudentCodes([...existingCodes, ...newCodes]);

      setGeneratedCodes(newCodes);
    } catch (err) {
      console.error('Failed to generate codes', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: any) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            Generate Unique Student Codes
          </DialogTitle>
          <DialogDescription>
            Enter student names to generate single-use registration codes. Students will use these codes to link directly to your class during signup.
          </DialogDescription>
        </DialogHeader>

        {generatedCodes.length === 0 ? (
          <div className="space-y-4 py-4">
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {students.map((student, index) => (
                <div key={student.id} className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Student Name (Required)"
                      value={student.name}
                      onChange={(e) => updateStudent(student.id, 'name', e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Date of Birth (e.g. YYYY-MM-DD)"
                      type="text"
                      value={student.dob}
                      onChange={(e) => updateStudent(student.id, 'dob', e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  {students.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStudentRow(student.id)}
                      className="h-9 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={addStudentRow}
              className="w-full border-dashed border-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Another Student
            </Button>

            <div className="pt-4 flex justify-end gap-2 border-t">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button
                onClick={generateCodes}
                disabled={isGenerating || students.every(s => !s.name.trim())}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isGenerating ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  'Generate Codes'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Successfully generated {generatedCodes.length} codes!
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {generatedCodes.map(code => (
                <Card key={code.id} className="border-gray-200 shadow-sm">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{code.studentName}</p>
                      {code.studentDOB && <p className="text-xs text-gray-500">{code.studentDOB}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <code className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg text-sm font-bold tracking-widest border border-slate-200">
                        {code.code}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCode(code.id, code.code)}
                        className="h-8 px-2"
                      >
                        {copiedId === code.id ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t">
              <Button variant="outline" onClick={() => setGeneratedCodes([])}>
                Generate More
              </Button>
              <Button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
