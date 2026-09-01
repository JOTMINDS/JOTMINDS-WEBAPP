with open('src/app/components/JTIAReport.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_func_start = "  const handleExportCSV = () => {"
old_func_end = "document.body.removeChild(link);\n  };"

if old_func_start in content and old_func_end in content:
    start_idx = content.find(old_func_start)
    end_idx = content.find(old_func_end) + len(old_func_end)
    
    new_func = """  const handleExportCSV = () => {
    let csvRows = [];
    csvRows.push(["Teaching Insights Assessment Report"]);
    csvRows.push(["Teacher Name", teacherName]);
    csvRows.push(["Date", new Date().toLocaleDateString()]);
    csvRows.push(["Overall Score", report.overallScore?.toString() || "N/A"]);
    csvRows.push([]);
    
    csvRows.push(["Domain Scores"]);
    csvRows.push(["Domain", "Score"]);
    radarData.forEach((d) => {
      csvRows.push([d.full, d.score.toString()]);
    });
    csvRows.push([]);

    if (report.subCompetencies) {
      csvRows.push(["Sub-Competency Scores"]);
      csvRows.push(["Competency", "Score"]);
      Object.entries(report.subCompetencies).forEach(([comp, score]) => {
        csvRows.push([comp, score.toString()]);
      });
      csvRows.push([]);
    }

    if (report.strengths && report.strengths.length > 0) {
      csvRows.push(["Professional Strengths"]);
      csvRows.push(["Domain", "Competency", "Title", "Description"]);
      report.strengths.forEach((s) => {
        csvRows.push([s.domain, s.competency || "", s.title, s.description || ""]);
      });
      csvRows.push([]);
    }

    if (report.growthOpportunities && report.growthOpportunities.length > 0) {
      csvRows.push(["Growth Opportunities"]);
      csvRows.push(["Domain", "Competency", "Title", "Description"]);
      report.growthOpportunities.forEach((s) => {
        csvRows.push([s.domain, s.competency || "", s.title, s.description || ""]);
      });
      csvRows.push([]);
    }

    // Escape CSV values
    const escapeCSV = (val: string | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvContent = csvRows.map(row => row.map(escapeCSV).join(",")).join("\\n");
    const blob = new Blob(["\\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Teaching_Insights_Report_${teacherName.replace(/\\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };"""

    new_content = content[:start_idx] + new_func + content[end_idx:]
    with open('src/app/components/JTIAReport.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Updated handleExportCSV successfully")
else:
    print("Could not find boundaries")
