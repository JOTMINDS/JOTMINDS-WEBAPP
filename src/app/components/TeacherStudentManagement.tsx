import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { getAllUsers, saveUser, getAssessmentsByUserId } from '../utils/storage';
import { projectId } from '../utils/supabase/info';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Plus, Upload, MoreVertical, Edit, Trash2, FileText, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface TeacherStudentManagementProps {
  teacher: User;
}

export function TeacherStudentManagement({ teacher }: TeacherStudentManagementProps) {
  const [students, setStudents] = useState<User[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ id: '', name: '', email: '', phone: '', dateOfBirth: '' });

  useEffect(() => {
    loadStudents();
  }, [teacher.id]);

  const loadStudents = () => {
    const all = getAllUsers();
    setStudents(all.filter(u => u.role === 'student' && u.teacherId === teacher.id));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Create local user
      const newId = `usr_${Date.now()}`;
      const newStudent: User = {
        id: newId,
        role: 'student',
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        dateOfBirth: formData.dateOfBirth,
        teacherId: teacher.id,
        school: teacher.organizationName,
        createdAt: new Date().toISOString()
      };
      saveUser(newStudent);

      // 2. Send Invite Email via Edge Function
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fc8eb847/send-student-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          studentName: formData.name,
          teacherName: teacher.name,
          schoolName: teacher.organizationName
        })
      });

      toast.success('Student added and invite sent!');
      setIsAddModalOpen(false);
      setFormData({ id: '', name: '', email: '', phone: '', dateOfBirth: '' });
      loadStudents();
    } catch (err) {
      console.error(err);
      toast.error('Student saved locally, but failed to send email invite.');
      loadStudents();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const all = getAllUsers();
    const existing = all.find(u => u.id === formData.id);
    if (existing) {
      const updated = { ...existing, ...formData };
      saveUser(updated);
      toast.success('Student updated!');
      setIsEditModalOpen(false);
      loadStudents();
    }
  };

  const handleRemove = (studentId: string) => {
    if (!window.confirm('Are you sure you want to remove this student from your class?')) return;
    const all = getAllUsers();
    const existing = all.find(u => u.id === studentId);
    if (existing) {
      existing.teacherId = undefined; // Unlink
      saveUser(existing);
      toast.success('Student removed from class.');
      loadStudents();
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        // skip header (name, email, phone, dateOfBirth)
        const newStudents: User[] = [];
        
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
              teacherId: teacher.id,
              school: teacher.organizationName,
              createdAt: new Date().toISOString()
            };
            newStudents.push(newStudent);
            saveUser(newStudent);
          }
        }
        
        // Optionally send batch emails here or just rely on local save
        toast.success(`${newStudents.length} students imported successfully.`);
        setIsBulkModalOpen(false);
        loadStudents();
      } catch (err) {
        toast.error('Error parsing CSV file');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">My Students</h2>
          <p className="text-muted-foreground">Manage your assigned students</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2" /> Bulk Upload
          </Button>
          <Button onClick={() => {
            setFormData({ id: '', name: '', email: '', phone: '', dateOfBirth: '' });
            setIsAddModalOpen(true);
          }} style={{ backgroundColor: '#6B4C9A' }}>
            <Plus className="w-4 h-4 mr-2" /> Add Student
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map(student => (
          <Card key={student.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{student.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => {
                    setFormData({
                      id: student.id,
                      name: student.name,
                      email: student.email,
                      phone: student.phone || '',
                      dateOfBirth: student.dateOfBirth || ''
                    });
                    setIsEditModalOpen(true);
                  }}>
                    <Edit className="w-4 h-4 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleRemove(student.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <CardDescription>{student.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <Badge variant="outline">
                  {getAssessmentsByUserId(student.id).filter(a => a.completedAt).length} Assessments
                </Badge>
                <Button variant="link" className="text-[#6B4C9A] p-0 h-auto">
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {students.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg">
            <p className="text-gray-500">No students found. Add a student to get started.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Add New Student</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Phone (Optional)</label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Date of Birth</label>
                <Input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isLoading} style={{ backgroundColor: '#6B4C9A' }}>
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Add & Send Invite'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Edit Student</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Date of Birth</label>
                <Input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" style={{ backgroundColor: '#6B4C9A' }}>Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-2">Bulk Upload Students</h3>
            <p className="text-sm text-gray-500 mb-4">Upload a CSV file containing your student roster.</p>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Expected Format:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                Name, Email, Phone, DateOfBirth{'\n'}
                John Doe, john@example.com, 1234567890, 2010-05-15
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
              <Input type="file" accept=".csv" className="hidden" id="csv-upload" onChange={handleBulkUpload} disabled={isLoading} />
              <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 font-medium">Click to upload CSV</span>
                <span className="text-xs text-gray-400 mt-1">Maximum 500 rows</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsBulkModalOpen(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
