import re

with open('src/app/components/InstitutionDashboard/BulkUploadModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

csv_parser = """  const handleBulkStudentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split(/\\r\\n|\\n|\\r/).filter(line => line.trim().length > 0);
        let imported = 0;
        
        if (lines.length < 2) {
          toast.error("CSV file seems empty or invalid.");
          setIsUploading(false);
          return;
        }

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
        const emailIdx = headers.findIndex(h => h.includes('email'));
        const phoneIdx = headers.findIndex(h => h.includes('phone'));
        const dobIdx = headers.findIndex(h => h.includes('dob') || h.includes('dateofbirth') || h.includes('birth'));

        const actualNameIdx = nameIdx >= 0 ? nameIdx : 0;
        const actualEmailIdx = emailIdx >= 0 ? emailIdx : 1;
        const actualPhoneIdx = phoneIdx >= 0 ? phoneIdx : 2;
        const actualDobIdx = dobIdx >= 0 ? dobIdx : 3;

        for (let i = 1; i < lines.length; i++) {
          const parts = parseLine(lines[i]);
          if (parts.length === 0) continue;

          const name = parts[actualNameIdx] || '';
          const email = parts[actualEmailIdx] || '';
          const phone = parts[actualPhoneIdx] || '';
          const dateOfBirth = parts[actualDobIdx] || '';
          
          if (name && email) {
            const newStudent: User = {
              id: `usr_${Date.now()}_${i}`,
              role: 'student',
              name: name,
              email: email,
              phone: phone,
              dateOfBirth: dateOfBirth,
              school: institutionName,
"""

content = re.sub(r'  const handleBulkStudentUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{.*?school: institutionName,\n', csv_parser, content, flags=re.DOTALL)

with open('src/app/components/InstitutionDashboard/BulkUploadModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated BulkUploadModal")
