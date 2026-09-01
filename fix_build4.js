const fs = require('fs');

['src/app/components/OrganizationBulkUploadModal.tsx', 'src/app/components/InstitutionDashboard/GenerateStudentCodesModal.tsx', 'src/app/components/InstitutionDashboard/BulkUploadModal.tsx'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Using string replacement to avoid regex issues
    content = content.replace("csv.split(/?\n/)", "csv.split(/\\r?\\n/)");
    fs.writeFileSync(file, content);
});
console.log("Done");
