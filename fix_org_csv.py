import re

with open('src/app/components/OrganizationBulkUploadModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

csv_parser = """  const handleBulkInvite = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setTotal(0);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split(/\\r\\n|\\n|\\r/).filter(line => line.trim().length > 0);
        
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
        const deptIdx = headers.findIndex(h => h.includes('department'));

        const actualNameIdx = nameIdx >= 0 ? nameIdx : 0;
        const actualEmailIdx = emailIdx >= 0 ? emailIdx : 1;
        const actualDeptIdx = deptIdx >= 0 ? deptIdx : 2;

        const validLines = lines.slice(1);
        setTotal(validLines.length);
        let imported = 0;
        let failed = 0;

        for (let i = 0; i < validLines.length; i++) {
          const parts = parseLine(validLines[i]);
          const name = parts[actualNameIdx] || '';
          const email = parts[actualEmailIdx] || '';
          const department = parts[actualDeptIdx] || '';
          
          if (name && email) {
            try {
              const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/send-professional-invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: email,
                  professionalName: name,
                  organizationName: organizationName,
                  organizationCode: organizationCode,
                  supervisorName: supervisorName,
                  department: department
                })
              });
              
              if (response.ok) {
                imported++;
              } else {
"""

content = re.sub(r'  const handleBulkInvite = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{.*?if \(response\.ok\) \{\n                imported\+\+;\n              \} else \{', csv_parser, content, flags=re.DOTALL)

with open('src/app/components/OrganizationBulkUploadModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated OrganizationBulkUploadModal")
