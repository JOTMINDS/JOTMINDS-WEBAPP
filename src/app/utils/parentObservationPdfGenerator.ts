import jsPDF from 'jspdf';
import { ParentObservationAssessment, User } from '../types';

export function generateParentObservationPDF(
  assessment: ParentObservationAssessment, 
  parentName: string, 
  childName: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header - JotMinds Branding
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('JotMinds', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Discover How You Think', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;
  
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Parent Observation Assessment Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Parent: ${parentName}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  doc.text(`Child: ${childName}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  doc.setFontSize(10);
  doc.text(`Date: ${new Date(assessment.completedAt).toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Overall Summary
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Overall Summary', 20, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const summaryLines = doc.splitTextToSize(assessment.score.overallSummary, pageWidth - 40);
  doc.text(summaryLines, 20, yPos);
  yPos += summaryLines.length * 5 + 12;

  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // Section A: Learning Habits
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Learning Habits', 20, yPos);
  yPos += 8;

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Style: ${assessment.score.sectionA.style}`, 25, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Score: ${assessment.score.sectionA.total}`, 25, yPos);
  yPos += 7;

  const sectionAInterpLines = doc.splitTextToSize(assessment.score.sectionA.interpretation, pageWidth - 50);
  doc.text(sectionAInterpLines, 25, yPos);
  yPos += sectionAInterpLines.length * 5 + 5;

  doc.setFontSize(9);
  doc.setFont(undefined, 'italic');
  const sectionAInsightLines = doc.splitTextToSize(assessment.score.sectionA.insights, pageWidth - 50);
  doc.text(sectionAInsightLines, 25, yPos);
  yPos += sectionAInsightLines.length * 5 + 10;

  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // Section B: Thinking Patterns
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Thinking Patterns', 20, yPos);
  yPos += 8;

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Style: ${assessment.score.sectionB.style}`, 25, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Score: ${assessment.score.sectionB.total}`, 25, yPos);
  yPos += 7;

  const sectionBInterpLines = doc.splitTextToSize(assessment.score.sectionB.interpretation, pageWidth - 50);
  doc.text(sectionBInterpLines, 25, yPos);
  yPos += sectionBInterpLines.length * 5 + 5;

  doc.setFontSize(9);
  doc.setFont(undefined, 'italic');
  const sectionBInsightLines = doc.splitTextToSize(assessment.score.sectionB.insights, pageWidth - 50);
  doc.text(sectionBInsightLines, 25, yPos);
  yPos += sectionBInsightLines.length * 5 + 10;

  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // Section C: Decision-Making Behavior
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Decision-Making Behavior', 20, yPos);
  yPos += 8;

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Style: ${assessment.score.sectionC.style}`, 25, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Score: ${assessment.score.sectionC.total}`, 25, yPos);
  yPos += 7;

  const sectionCInterpLines = doc.splitTextToSize(assessment.score.sectionC.interpretation, pageWidth - 50);
  doc.text(sectionCInterpLines, 25, yPos);
  yPos += sectionCInterpLines.length * 5 + 5;

  doc.setFontSize(9);
  doc.setFont(undefined, 'italic');
  const sectionCInsightLines = doc.splitTextToSize(assessment.score.sectionC.insights, pageWidth - 50);
  doc.text(sectionCInsightLines, 25, yPos);
  yPos += sectionCInsightLines.length * 5 + 10;

  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // Section D: Motivation & Engagement
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Motivation & Engagement', 20, yPos);
  yPos += 8;

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Style: ${assessment.score.sectionD.style}`, 25, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Score: ${assessment.score.sectionD.total}`, 25, yPos);
  yPos += 7;

  const sectionDInterpLines = doc.splitTextToSize(assessment.score.sectionD.interpretation, pageWidth - 50);
  doc.text(sectionDInterpLines, 25, yPos);
  yPos += sectionDInterpLines.length * 5 + 5;

  doc.setFontSize(9);
  doc.setFont(undefined, 'italic');
  const sectionDInsightLines = doc.splitTextToSize(assessment.score.sectionD.insights, pageWidth - 50);
  doc.text(sectionDInsightLines, 25, yPos);
  yPos += sectionDInsightLines.length * 5 + 10;

  // Harmony Score (if available)
  if (assessment.score.harmonyScore !== undefined) {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Parent-Child Alignment', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Harmony Score: ${assessment.score.harmonyScore}%`, 25, yPos);
    yPos += 7;

    const harmonyInterpretation = assessment.score.harmonyScore >= 80 
      ? 'High alignment between parent observation and child\'s self-assessment'
      : assessment.score.harmonyScore >= 60
      ? 'Moderate alignment - some differences in perception'
      : 'Lower alignment - consider discussing perceptions with your child';
    
    const harmonyLines = doc.splitTextToSize(harmonyInterpretation, pageWidth - 50);
    doc.text(harmonyLines, 25, yPos);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.text('Generated by JotMinds - Discover How You Think', pageWidth / 2, footerY, { align: 'center' });

  // Save
  const filename = `parent-observation-${childName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
