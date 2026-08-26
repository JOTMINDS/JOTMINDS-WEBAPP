import re

with open("src/app/components/InstitutionDashboard/GenerateStudentCodesModal.tsx", "r") as f:
    content = f.read()

# Add imports
content = content.replace(
    "import { Plus, X, Copy, CheckCircle2, UserPlus, RefreshCw } from 'lucide-react';",
    "import { Plus, X, Copy, CheckCircle2, UserPlus, RefreshCw, Upload, Download } from 'lucide-react';"
)

# Add handler functions
handler_code = """
  const downloadTemplate = () => {
    const csvContent = "Name,DateOfBirth\\nJohn Doe,2010-05-15\\nJane Smith,2011-08-22";
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
        const lines = csv.split('\\n').filter(line => line.trim().length > 0);
        
        if (lines.length < 2) {
          toast.error("CSV file seems empty or invalid.");
          return;
        }

        const newStudents = [];
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',');
          if (parts.length >= 1) {
            const name = parts[0].trim();
            const dob = parts.length > 1 ? parts[1].trim() : '';
            if (name) {
              newStudents.push({ name, dob, id: generateId() });
            }
          }
        }

        if (newStudents.length > 0) {
          // Check if current row is just the empty default row
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
      
      // Reset input
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const generateCodes = async () => {
"""

content = content.replace("  const generateCodes = async () => {", handler_code)

# Replace the button UI
old_button_ui = """            <Button
              variant="outline"
              size="sm"
              onClick={addStudentRow}
              className="w-full border-dashed border-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Another Student
            </Button>"""

new_button_ui = """            <div className="flex gap-2 w-full">
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
            </div>"""

content = content.replace(old_button_ui, new_button_ui)

with open("src/app/components/InstitutionDashboard/GenerateStudentCodesModal.tsx", "w") as f:
    f.write(content)

