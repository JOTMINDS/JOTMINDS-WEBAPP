import { getAllUsers, saveUser, getAllClasses, saveClass } from './storage';
import { v4 as uuidv4 } from 'uuid';

const MIGRATION_KEY = 'ts_class_migration_run';

export function runClassMigration() {
  const hasRun = localStorage.getItem(MIGRATION_KEY);
  if (hasRun) return;

  console.log('Running Student-Class migration...');
  const users = getAllUsers();
  
  // Find all unique teacher IDs from students
  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');
  
  const teacherClassMap = new Map<string, string>(); // teacherId -> classId
  
  // Create classes for existing teachers who have students assigned to them
  teachers.forEach(teacher => {
    // Check if this teacher has students assigned
    const hasStudents = students.some(s => s.teacherId === teacher.id || (s.linkedTeachers && s.linkedTeachers.includes(teacher.id)));
    
    if (hasStudents) {
      const classId = uuidv4();
      const newClass = {
        id: classId,
        name: `${teacher.name}'s Class`,
        academicYear: new Date().getFullYear().toString(),
        classTeacherId: teacher.id,
        createdAt: new Date().toISOString()
      };
      saveClass(newClass);
      teacherClassMap.set(teacher.id, classId);
    }
  });

  // Migrate students to new classes
  let migratedCount = 0;
  students.forEach(student => {
    let changed = false;
    
    // If student has a primary teacherId
    if (student.teacherId && teacherClassMap.has(student.teacherId)) {
      student.classId = teacherClassMap.get(student.teacherId);
      changed = true;
    } 
    // If no primary teacherId but has linkedTeachers, just grab the first one for their primary class
    else if (!student.classId && student.linkedTeachers && student.linkedTeachers.length > 0) {
      const firstTeacher = student.linkedTeachers[0];
      if (teacherClassMap.has(firstTeacher)) {
        student.classId = teacherClassMap.get(firstTeacher);
        changed = true;
      }
    }
    
    if (changed) {
      saveUser(student);
      migratedCount++;
    }
  });

  console.log(`Migration complete. Created ${teacherClassMap.size} classes, migrated ${migratedCount} students.`);
  localStorage.setItem(MIGRATION_KEY, 'true');
}
