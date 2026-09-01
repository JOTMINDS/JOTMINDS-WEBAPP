import re

for file in [
    'src/app/components/OrganizationBulkUploadModal.tsx',
    'src/app/components/InstitutionDashboard/GenerateStudentCodesModal.tsx',
    'src/app/components/InstitutionDashboard/BulkUploadModal.tsx'
]:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Completely replace that section
    content = re.sub(r'const csv = event\.target\?\.result as string;.*?(if \(lines\.length < 2\))', 'const csv = event.target?.result as string;\n        const lines = csv.split(/\\r?\\n/).filter(line => line.trim().length > 0);\n        \n        \\1', content, flags=re.DOTALL)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
