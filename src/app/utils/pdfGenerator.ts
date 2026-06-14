import jsPDF from 'jspdf';
import { Assessment, GhanaMapping } from '../types';
import { getStyleDescription } from './scoring';
import { getAssessmentInsights } from './insights';

export function generatePDF(assessment: Assessment, userName: string, ghanaMapping: GhanaMapping | null, isOrganizational: boolean = false) {
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
  const title = isOrganizational 
    ? 'Organizational Cognitive Assessment Report' 
    : 'Personal Cognitive Profile Report';
  doc.text(title, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(12);
  doc.text(userName || 'User', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  doc.setFontSize(10);
  doc.text(`Date: ${new Date(assessment.completedAt).toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Main Style
  const mainStyle = assessment.score.kolb?.style || assessment.score.sternberg?.style || assessment.score.dualProcess?.style || '';
  doc.setFontSize(16);
  doc.text(`Your Style: ${mainStyle}`, 20, yPos);
  yPos += 10;

  // Description
  const description = getStyleDescription(assessment.type, mainStyle);
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(description, pageWidth - 40);
  doc.text(descLines, 20, yPos);
  yPos += descLines.length * 5 + 15;

  // Executive Summary
  const insights = getAssessmentInsights(assessment);
  
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Executive Summary', 20, yPos);
  yPos += 10;
  doc.setFont(undefined, 'normal');

  // Top Strength
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Top Strength:', 20, yPos);
  yPos += 6;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const strengthLines = doc.splitTextToSize(insights.strengths[0] || 'N/A', pageWidth - 40);
  doc.text(strengthLines, 25, yPos);
  yPos += strengthLines.length * 5 + 5;

  // Priority Development Area
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Priority Development Area:', 20, yPos);
  yPos += 6;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const weaknessLines = doc.splitTextToSize(insights.weaknesses[0] || 'N/A', pageWidth - 40);
  doc.text(weaknessLines, 25, yPos);
  yPos += weaknessLines.length * 5 + 5;

  // Key Action
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Key Action for Improvement:', 20, yPos);
  yPos += 6;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const improvementLines = doc.splitTextToSize(insights.improvements[0] || 'N/A', pageWidth - 40);
  doc.text(improvementLines, 25, yPos);
  yPos += improvementLines.length * 5 + 5;

  // Organizational Fit (if applicable)
  if (isOrganizational && insights.organizationalFit.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Organizational Fit:', 20, yPos);
    yPos += 6;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    insights.organizationalFit.slice(0, 2).forEach((fit) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      const fitLines = doc.splitTextToSize(`• ${fit}`, pageWidth - 40);
      doc.text(fitLines, 25, yPos);
      yPos += fitLines.length * 5;
    });
    yPos += 5;
  }

  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  yPos += 5;

  // Scores
  doc.setFontSize(14);
  doc.text('Your Scores:', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  if (assessment.score.kolb) {
    const ceLabel = isOrganizational ? 'Hands-on Experience:' : 'Concrete Experience:';
    const roLabel = isOrganizational ? 'Reflective Analysis:' : 'Reflective Observation:';
    const acLabel = isOrganizational ? 'Conceptual Frameworks:' : 'Abstract Conceptualization:';
    const aeLabel = isOrganizational ? 'Active Implementation:' : 'Active Experimentation:';
    
    doc.text(`${ceLabel} ${assessment.score.kolb.scores.CE}`, 25, yPos);
    yPos += 6;
    doc.text(`${roLabel} ${assessment.score.kolb.scores.RO}`, 25, yPos);
    yPos += 6;
    doc.text(`${acLabel} ${assessment.score.kolb.scores.AC}`, 25, yPos);
    yPos += 6;
    doc.text(`${aeLabel} ${assessment.score.kolb.scores.AE}`, 25, yPos);
    yPos += 10;
  } else if (assessment.score.sternberg) {
    doc.text(`Analytical: ${assessment.score.sternberg.scores.analytical}`, 25, yPos);
    yPos += 6;
    doc.text(`Creative: ${assessment.score.sternberg.scores.creative}`, 25, yPos);
    yPos += 6;
    doc.text(`Practical: ${assessment.score.sternberg.scores.practical}`, 25, yPos);
    yPos += 10;
  } else if (assessment.score.dualProcess) {
    const system1Label = isOrganizational ? 'Intuitive/Rapid:' : 'Intuitive (System 1):';
    const system2Label = isOrganizational ? 'Analytical/Deliberate:' : 'Reflective (System 2):';
    
    doc.text(`${system1Label} ${assessment.score.dualProcess.scores.system1}`, 25, yPos);
    yPos += 6;
    doc.text(`${system2Label} ${assessment.score.dualProcess.scores.system2}`, 25, yPos);
    yPos += 10;
  }

  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Guidance Section (Educational or Organizational)
  if (isOrganizational) {
    // Organizational Insights
    doc.setFontSize(14);
    doc.text('Organizational Insights', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.text('Learning Agility Applications:', 20, yPos);
    yPos += 6;
    
    const learningApplications = [
      'Apply your learning style to team collaboration and project management',
      'Leverage your strengths when adapting to organizational changes',
      'Develop strategies for continuous professional development'
    ];
    
    learningApplications.forEach((app) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      const lines = doc.splitTextToSize(`• ${app}`, pageWidth - 50);
      doc.text(lines, 25, yPos);
      yPos += lines.length * 5;
    });
    yPos += 5;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.text('Thinking Diversity Strengths:', 20, yPos);
    yPos += 6;
    
    const thinkingStrengths = [
      'Use your cognitive profile to contribute unique perspectives',
      'Balance analytical, creative, and practical approaches in decision-making',
      'Build complementary teams based on cognitive diversity'
    ];
    
    thinkingStrengths.forEach((strength) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      const lines = doc.splitTextToSize(`• ${strength}`, pageWidth - 50);
      doc.text(lines, 25, yPos);
      yPos += lines.length * 5;
    });
    yPos += 5;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.text('Professional Development Tip:', 20, yPos);
    yPos += 6;
    const orgTip = 'Understanding your cognitive profile can help you communicate more effectively with colleagues who think differently, make better decisions under pressure, and create more innovative solutions to organizational challenges.';
    const orgTipLines = doc.splitTextToSize(orgTip, pageWidth - 40);
    doc.text(orgTipLines, 25, yPos);

  } else if (ghanaMapping) {
    // Ghana Education Guidance
    doc.setFontSize(14);
    doc.text('Ghana Education Guidance', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.text('Recommended SHS Tracks:', 20, yPos);
    yPos += 6;
    ghanaMapping.shsTrack.forEach((track) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`• ${track}`, 25, yPos);
      yPos += 5;
    });
    yPos += 5;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.text('Suggested Tertiary Focus Areas:', 20, yPos);
    yPos += 6;
    ghanaMapping.tertiaryFocus.forEach((area) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`• ${area}`, 25, yPos);
      yPos += 5;
    });
    yPos += 5;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.text('Career Suggestions:', 20, yPos);
    yPos += 6;
    ghanaMapping.careerSuggestions.forEach((career) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`• ${career}`, 25, yPos);
      yPos += 5;
    });
    yPos += 5;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.text('Decision-Making Tip:', 20, yPos);
    yPos += 6;
    const tipLines = doc.splitTextToSize(ghanaMapping.decisionTip, pageWidth - 40);
    doc.text(tipLines, 25, yPos);
  }

  // Save
  const filename = isOrganizational 
    ? `organizational-assessment-${userName.replace(/\s+/g, '-')}.pdf`
    : `thinking-styles-report-${userName.replace(/\s+/g, '-')}.pdf`;
  doc.save(filename);
}
