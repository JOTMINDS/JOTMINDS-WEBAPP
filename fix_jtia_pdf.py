with open('src/app/components/JTIAReport.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import for exportReportToPDF
if "import { exportReportToPDF } from '../utils/pdfGenerator';" not in content:
    content = content.replace("import React, { useState, useEffect } from \"react\";", 
                              "import React, { useState, useEffect } from \"react\";\nimport { exportReportToPDF } from '../utils/pdfGenerator';")
                              
# Add state for exportingPDF
if "const [exportingPDF, setExportingPDF] = useState(false);" not in content:
    content = content.replace('  const [activeTab, setActiveTab] = useState<',
                              '  const [exportingPDF, setExportingPDF] = useState(false);\n  const [activeTab, setActiveTab] = useState<')

# Replace handlePrint with handleExportPDF
old_func_start = "  const handlePrint = () => {"
old_func_end = "window.print();\n      }, 100);\n    }\n  };"
if old_func_start in content and old_func_end in content:
    start_idx = content.find(old_func_start)
    end_idx = content.find(old_func_end) + len(old_func_end)
    
    new_func = """  const handlePrint = async () => {
    setExportingPDF(true);
    toast.loading('Generating PDF report...', { id: 'pdf-export' });
    try {
      const success = await exportReportToPDF('jtia-printable-report', `Teaching_Insights_Report_${teacherName.replace(/\\s+/g, '_')}.pdf`);
      if (success) {
        toast.success('Report downloaded successfully!', { id: 'pdf-export' });
      } else {
        toast.error('Could not find the report container to export.', { id: 'pdf-export' });
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.error('An error occurred while generating the report.', { id: 'pdf-export' });
    } finally {
      setExportingPDF(false);
    }
  };"""
    content = content[:start_idx] + new_func + content[end_idx:]

with open('src/app/components/JTIAReport.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated PDF logic")
