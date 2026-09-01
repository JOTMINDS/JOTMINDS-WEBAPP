import re

for file in [
    'src/app/components/OrganizationBulkUploadModal.tsx',
    'src/app/components/InstitutionDashboard/GenerateStudentCodesModal.tsx',
    'src/app/components/InstitutionDashboard/BulkUploadModal.tsx'
]:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove the broken lines
    content = re.sub(r'const lines = csv\.split\(\/\\r\?\\n\/\);\|\n\|\n\/\)\.filter\(line => line\.trim\(\)\.length > 0\);', 'const lines = csv.split(/\\r?\\n/).filter(line => line.trim().length > 0);', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

