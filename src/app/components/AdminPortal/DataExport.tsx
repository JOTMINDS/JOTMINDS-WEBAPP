import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

export const DataExport: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simulate API call for fetching anonymized data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const csvHeader = "Age range,School level,Assessment responses,Domain scores,Report category,Parent observation scores,Child-parent alignment score,Completion date\n";
      const dummyRow1 = "15-18,SHS,\"Q1:A, Q2:B\",Learning:30/Thinking:20,Student Assessment,Learning:25/Thinking:20,High Alignment,2026-07-01\n";
      const dummyRow2 = "12-14,JHS,\"Q1:B, Q2:A\",Learning:15/Thinking:10,Student Assessment,Learning:10/Thinking:15,Moderate Alignment,2026-07-02\n";
      
      const csvContent = csvHeader + dummyRow1 + dummyRow2;
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `jotminds_anonymized_data_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Anonymized data exported successfully");
    } catch (error) {
      console.error("Export failed", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="mt-8 border-2 border-indigo-100 bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
          Scientific Validation Data Export
        </CardTitle>
        <CardDescription>
          Export anonymized platform data for future research and construct validation. 
          All personally identifying information is automatically scrubbed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <p><strong>Included fields:</strong> Age range, School level, Assessment responses, Domain scores, Report category, Parent observation scores, Child-parent alignment score, Completion date.</p>
          </div>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-700"
          >
            {isExporting ? (
              <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> Processing...</span>
            ) : (
              <span className="flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
