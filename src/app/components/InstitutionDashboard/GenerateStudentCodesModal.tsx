import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, X, Copy, CheckCircle2, UserPlus, RefreshCw, Upload, Download, School, ArrowRight, ArrowLeft } from 'lucide-react';
import { Class, EducationLevel, StudentCode } from '../../types';
import { generateId, getAllClasses, saveClass } from '../../utils/storage';
import { enrollStudent, saveInstitutionClassAPI } from '../../utils/api';
import { toast } from 'sonner';

interface GenerateStudentCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  institutionId?: string;
}

export function GenerateStudentCodesModal({ isOpen, onClose, teacherId, institutionId }: GenerateStudentCodesModalProps) {
  // Step management: 'select-class' -> 'enter-students' -> 'results'
  const [step, setStep] = useState<'select-class' | 'enter-students' | 'results'>('select-class');

  // Step 1: Class selection
  const [teacherClasses, setTeacherClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassYear, setNewClassYear] = useState(new Date().getFullYear().toString());
  const [newClassLevel, setNewClassLevel] = useState<EducationLevel | ''>('');

  // Step 2: Student entry
  const [students, setStudents] = useState<Array<{ name: string; dob: string; id: string }>>([
    { name: '', dob: '', id: generateId() }
  ]);

  // Results
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTeacherClasses();
      setStep('select-class');
      setSelectedClassId('');
      setIsCreatingClass(false);
      setNewClassName('');
      setNewClassYear(new Date().getFullYear().toString());
      setNewClassLevel('');
      setStudents([{ name: '', dob: '', id: generateId() }]);
      setGeneratedCodes([]);
    }
  }, [isOpen]);

  const loadTeacherClasses = () => {
    const allClasses = getAllClasses();
    const filtered = allClasses.filter(c => c.classTeacherId === teacherId);
    setTeacherClasses(filtered);
  };

  const selectedClass = teacherClasses.find(c => c.id === selectedClassId);

  const handleCreateQuickClass = async () => {
    if (!newClassName.trim() || !newClassLevel) {
      toast.error('Please enter a class name and select an education level');
      return;
    }

    const newClass: Class = {
      id: `cls_${Date.now()}`,
      name: newClassName.trim(),
      academicYear: newClassYear,
      educationLevel: newClassLevel,
      classTeacherId: teacherId,
      institutionId,
      studentCount: 0,
      createdAt: new Date().toISOString(),
    };

    saveClass(newClass);

    try {
      await saveInstitutionClassAPI(newClass);
    } catch (err) {
      console.warn('Failed to sync class to server', err);
    }

    loadTeacherClasses();
    setSelectedClassId(newClass.id);
    setIsCreatingClass(false);
    setNewClassName('');
    setNewClassLevel('');
    toast.success(`Class "${newClass.name}" created!`);
  };

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


  const downloadTemplate = () => {
    const csvContent = "Name,DateOfBirth\nJohn Doe,2010-05-15\nJane Smith,2011-08-22";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "student_codes_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split(/\r\n|\n|\r/).filter(line => line.trim().length > 0);
        
        if (lines.length < 2) {
          toast.error("CSV file seems empty or invalid.");
          return;
        }

        const newStudents = [];
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          // Simple CSV parser that handles basic quotes
          const line = lines[i];
          let parts = [];
          let current = '';
          let inQuotes = false;
          
          for (let j = 0; j < line.length; j++) {
            if (line[j] === '"') {
              inQuotes = !inQuotes;
            } else if (line[j] === ',' && !inQuotes) {
              parts.push(current);
              current = '';
            } else {
              current += line[j];
            }
          }
          parts.push(current);

          if (parts.length >= 1) {
            const name = parts[0].replace(/^"|"$/g, '').trim();
            const dob = parts.length > 1 ? parts[1].replace(/^"|"$/g, '').trim() : '';
            if (name) {
              newStudents.push({ name, dob, id: generateId() });
            }
          }
        }

        if (newStudents.length > 0) {
          if (students.length === 1 && !students[0].name && !students[0].dob) {
            setStudents(newStudents);
          } else {
            setStudents([...students, ...newStudents]);
          }
          toast.success(`Imported ${newStudents.length} students from CSV`);
        }
      } catch (err) {
        toast.error("Failed to parse CSV file");
        console.error(err);
      }
      
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const generateCodes = async () => {
    if (!selectedClass) {
      toast.error('Please select a class first');
      return;
    }

    setIsGenerating(true);
    
    const validStudents = students.filter(s => s.name.trim().length > 0 && s.dob.trim().length > 0);
    
    if (validStudents.length === 0) {
      toast.error('Please provide name and date of birth for all students');
      setIsGenerating(false);
      return;
    }

    try {
      const results = [];
      for (const student of validStudents) {
        try {
          const response = await enrollStudent({
            studentName: student.name.trim(),
            dateOfBirth: student.dob.trim(),
            classId: selectedClass.id,
            className: selectedClass.name,
            teacherId,
            institutionId,
            educationLevel: selectedClass.educationLevel
          });
          
          if (response.success) {
            results.push({
              id: generateId(),
              studentName: student.name.trim(),
              studentDOB: student.dob.trim(),
              code: response.code
            });
          }
        } catch (err) {
          console.error(`Failed to enroll ${student.name}`, err);
          toast.error(`Failed to enroll ${student.name}`);
        }
      }

      setGeneratedCodes(results);
      setStep('results');
      if (results.length > 0) {
        toast.success(`Successfully enrolled ${results.length} students into ${selectedClass.name}`);
      }
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

  const levelColors: Record<string, string> = {
    'Elementary': 'bg-green-100 text-green-800 border-green-200',
    'JHS': 'bg-blue-100 text-blue-800 border-blue-200',
    'SHS': 'bg-purple-100 text-purple-800 border-purple-200',
    'Tertiary': 'bg-amber-100 text-amber-800 border-amber-200',
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
            {step === 'select-class' 
              ? 'First, select or create a class for these students. The class determines their education level.'
              : step === 'enter-students'
              ? `Adding students to "${selectedClass?.name}" (${selectedClass?.educationLevel || 'No level'}). Enter names and birth dates.`
              : 'Student codes have been generated successfully!'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        {step !== 'results' && (
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${step === 'select-class' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
              <School className="w-3 h-3" /> 1. Select Class
            </div>
            <ArrowRight className="w-3 h-3 text-gray-400" />
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${step === 'enter-students' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
              <UserPlus className="w-3 h-3" /> 2. Add Students
            </div>
          </div>
        )}

        {/* STEP 1: Select Class */}
        {step === 'select-class' && (
          <div className="space-y-4 py-2">
            {!isCreatingClass ? (
              <>
                {teacherClasses.length > 0 ? (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {teacherClasses.map(cls => (
                      <div
                        key={cls.id}
                        onClick={() => setSelectedClassId(cls.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedClassId === cls.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-gray-900">{cls.name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {cls.academicYear} • {cls.studentCount || 0} students
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {cls.educationLevel ? (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${levelColors[cls.educationLevel] || 'bg-gray-100 text-gray-600'}`}>
                                {cls.educationLevel}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-gray-100 text-gray-500 border-gray-200">
                                No level set
                              </span>
                            )}
                            {selectedClassId === cls.id && (
                              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <School className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium">No classes found</p>
                    <p className="text-xs mt-1">Create your first class to start generating student codes.</p>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingClass(true)}
                  className="w-full border-dashed border-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create New Class
                </Button>
              </>
            ) : (
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <School className="w-4 h-4 text-indigo-600" /> Quick Create Class
                </h4>
                <Input
                  placeholder="Class Name (e.g. Grade 7A)"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="h-9 text-sm"
                />
                <Input
                  placeholder="Academic Year"
                  value={newClassYear}
                  onChange={(e) => setNewClassYear(e.target.value)}
                  className="h-9 text-sm"
                />
                <Select value={newClassLevel} onValueChange={(v) => setNewClassLevel(v as EducationLevel)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select Education Level *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Elementary">Elementary (Primary)</SelectItem>
                    <SelectItem value="JHS">JHS (Junior High)</SelectItem>
                    <SelectItem value="SHS">SHS (Senior High)</SelectItem>
                    <SelectItem value="Tertiary">Tertiary (University/College)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreatingClass(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateQuickClass}
                    disabled={!newClassName.trim() || !newClassLevel}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Create Class
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2 border-t">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button
                onClick={() => setStep('enter-students')}
                disabled={!selectedClassId}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Next: Add Students <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Enter Students */}
        {step === 'enter-students' && (
          <div className="space-y-4 py-2">
            {selectedClass && (
              <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                <School className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-900">{selectedClass.name}</span>
                {selectedClass.educationLevel && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${levelColors[selectedClass.educationLevel]}`}>
                    {selectedClass.educationLevel}
                  </span>
                )}
              </div>
            )}

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
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
                      placeholder="Date of Birth (Required)"
                      type="date"
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

            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={addStudentRow}
                className="flex-1 border-dashed border-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Another Student
              </Button>
              <div className="flex-1 relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Upload CSV"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed border-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 pointer-events-none"
                >
                  <Upload className="w-4 h-4 mr-2" /> Upload CSV
                </Button>
              </div>
            </div>
            <div className="text-right">
              <button onClick={downloadTemplate} className="text-xs flex items-center justify-end w-full gap-1 text-indigo-500 hover:text-indigo-700">
                <Download className="w-3 h-3" /> Download CSV Template
              </button>
            </div>

            <div className="pt-4 flex justify-between gap-2 border-t">
              <Button variant="ghost" onClick={() => setStep('select-class')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button
                  onClick={generateCodes}
                  disabled={isGenerating || students.every(s => !s.name.trim() || !s.dob.trim())}
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
          </div>
        )}

        {/* STEP 3: Results */}
        {step === 'results' && (
          <div className="space-y-4 py-4">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Successfully generated {generatedCodes.length} codes for {selectedClass?.name}!
            </div>

            {selectedClass?.educationLevel && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                All students have been assigned the <span className="font-bold">{selectedClass.educationLevel}</span> education level.
              </div>
            )}
            
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
              <Button variant="outline" onClick={() => {
                setStep('enter-students');
                setStudents([{ name: '', dob: '', id: generateId() }]);
                setGeneratedCodes([]);
              }}>
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
