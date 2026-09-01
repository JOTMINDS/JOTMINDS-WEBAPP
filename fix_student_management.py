import re

with open('src/app/components/InstitutionDashboard/GenerateStudentCodesModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Allow unassigned classes.
content = content.replace("if (!selectedClass) {", "if (!selectedClass && selectedClassId !== 'unassigned') {")

unassigned_logic = """    const validStudents = students.filter(s => s.name.trim().length > 0 && s.dob.trim().length > 0);
    
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
            classId: selectedClass?.id || 'unassigned',
            className: selectedClass?.name || 'Unassigned',
            teacherId,
            institutionId,
"""
# Need to replace carefully
content = re.sub(r'const validStudents = students\.filter.*?institutionId,', unassigned_logic, content, flags=re.DOTALL)

# Add "Unassigned" to class select
unassigned_option = """<SelectItem value="unassigned" className="italic font-medium">Unassigned (Generate codes only)</SelectItem>"""
if "value=\"unassigned\"" not in content:
    content = content.replace("</SelectContent>", f"  {unassigned_option}\n                    </SelectContent>")

# Improve CSV parsing to check headers
csv_parser = """
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split(/\\r\\n|\\n|\\r/).filter(line => line.trim().length > 0);
        
        if (lines.length < 2) {
          toast.error("CSV file seems empty or invalid.");
          return;
        }

        // Parse headers to find indexes
        const parseLine = (line: string) => {
          let parts = [];
          let current = '';
          let inQuotes = false;
          for (let j = 0; j < line.length; j++) {
            if (line[j] === '"') inQuotes = !inQuotes;
            else if (line[j] === ',' && !inQuotes) {
              parts.push(current);
              current = '';
            } else current += line[j];
          }
          parts.push(current);
          return parts.map(p => p.replace(/^"|"$/g, '').trim());
        };

        const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const nameIdx = headers.findIndex(h => h.includes('name'));
        const dobIdx = headers.findIndex(h => h.includes('dob') || h.includes('dateofbirth') || h.includes('birth'));

        const actualNameIdx = nameIdx >= 0 ? nameIdx : 0;
        const actualDobIdx = dobIdx >= 0 ? dobIdx : 1;

        const newStudents = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = parseLine(lines[i]);
          if (parts.length >= 1) {
            const name = parts[actualNameIdx] || '';
            const dob = parts.length > actualDobIdx ? parts[actualDobIdx] : '';
            if (name) {
              newStudents.push({ name, dob, id: generateId() });
            }
          }
        }

        if (newStudents.length > 0) {
          setStudents(prev => {
            const emptyRemoved = prev.filter(s => s.name.trim() !== '' || s.dob.trim() !== '');
            return [...emptyRemoved, ...newStudents];
          });
          toast.success(`Imported ${newStudents.length} students from CSV`);
        } else {
          toast.error("No valid students found in CSV");
        }
      } catch (err) {
        toast.error("Failed to parse CSV file");
        console.error(err);
      }
      
      e.target.value = '';
    };
    reader.readAsText(file);
  };
"""

content = re.sub(r'const handleCsvUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{.*?\n  };\n', csv_parser, content, flags=re.DOTALL)

with open('src/app/components/InstitutionDashboard/GenerateStudentCodesModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated GenerateStudentCodesModal")
