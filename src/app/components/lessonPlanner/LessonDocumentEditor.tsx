import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Save, Download, FileText, CheckCircle2 } from 'lucide-react';
import { LessonPlan } from '../../types/lessonPlannerTypes';
import { saveLessonPlan } from '../../utils/lessonPlannerStorage';
import { toast } from 'sonner';

interface LessonDocumentEditorProps {
  plan?: LessonPlan;
  onUpdate: (plan: LessonPlan) => void;
  onCompleteRequest?: () => void;
}

export const LessonDocumentEditor: React.FC<LessonDocumentEditorProps> = ({ plan, onUpdate, onCompleteRequest }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (plan) {
      // Convert JSON plan to a document-like text structure
      let docText = `# Lesson Plan: ${plan.subject} - ${plan.topic}\n`;
      docText += `**Grade:** ${plan.gradeClass}\n`;
      docText += `**Curriculum:** ${plan.curriculumFramework}\n`;
      docText += `**Duration:** ${plan.durationMinutes} mins\n`;
      docText += `**Date:** ${plan.date}\n\n`;
      
      docText += `## Objectives\n`;
      plan.objectives?.knowledge?.forEach((o) => docText += `- Knowledge: ${o}\n`);
      plan.objectives?.skills?.forEach((o) => docText += `- Skills: ${o}\n`);
      plan.objectives?.applications?.forEach((o) => docText += `- Application: ${o}\n`);
      
      docText += `\n## Lesson Phases\n`;
      plan.phases?.forEach((p) => {
        docText += `### ${p.name} (${p.durationMinutes} mins)\n${p.activity}\n\n`;
      });
      
      setContent(docText);
    }
  }, [plan]);

  if (!plan) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border">
        Please create or select a lesson plan first.
      </div>
    );
  }

  const handleSave = () => {
    const updatedPlan: LessonPlan = {
      ...plan,
      existingPlanText: content,
      uploadText: content,
      updatedAt: new Date().toISOString()
    };
    saveLessonPlan(updatedPlan);
    onUpdate(updatedPlan);
    toast.success('Lesson document saved successfully.');
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LessonPlan_${plan.topic.replace(/ /g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Document downloaded!');
  };

  const handleMarkCompleted = () => {
    if (onCompleteRequest) {
      onCompleteRequest();
    } else {
      const updatedPlan = { ...plan, status: 'completed' as const, updatedAt: new Date().toISOString() };
      saveLessonPlan(updatedPlan);
      onUpdate(updatedPlan);
      toast.success('Marked as Completed!');
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex items-center gap-2 text-indigo-900 font-bold">
          <FileText className="w-5 h-5 text-indigo-600" />
          Document Editor
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleMarkCompleted} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Completed
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Save className="w-4 h-4 mr-2" /> Save Document
          </Button>
        </div>
      </div>
      <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[70vh] border-0 focus-visible:ring-0 p-8 font-mono text-sm leading-relaxed resize-y bg-slate-50"
          />
        </CardContent>
      </Card>
    </div>
  );
};
