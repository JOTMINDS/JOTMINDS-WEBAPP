import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Assessment, GhanaMapping } from '../types';
import { getStyleDescription } from './scoring';
import { getAssessmentInsights } from './insights';
import { registerPoppins } from './pdfFonts';

// ── JotMinds brand palette (RGB) ──────────────────────────────────────────────
const BRAND = {
  indigo: [107, 76, 154] as [number, number, number],     // #6B4C9A JotMinds Primary Purple
  dark: [15, 23, 42] as [number, number, number],         // #0F172A Slate 900
  purple: [123, 97, 255] as [number, number, number],    // #7B61FF Violet secondary
  coral: [255, 113, 91] as [number, number, number],     // #FF715B Coral accent
  violet: [123, 97, 255] as [number, number, number],    // #7B61FF Violet accent
  aqua: [31, 200, 225] as [number, number, number],      // #1FC8E1 Aqua Blue accent
  ink: [33, 37, 41] as [number, number, number],         // body text
  muted: [108, 117, 125] as [number, number, number],    // secondary text
  hairline: [225, 228, 235] as [number, number, number], // borders
};

function tint(rgb: [number, number, number], amount = 0.92): [number, number, number] {
  return [
    Math.round(rgb[0] + (255 - rgb[0]) * amount),
    Math.round(rgb[1] + (255 - rgb[1]) * amount),
    Math.round(rgb[2] + (255 - rgb[2]) * amount),
  ];
}

function loadLogo(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = '/logo.png';
    } catch {
      resolve(null);
    }
  });
}


export async function generatePDF(assessment: Assessment, userName: string, ghanaMapping: GhanaMapping | null, isOrganizational: boolean = false): Promise<boolean> {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16;
    let yPos = 20;

    // Load fonts safely
    const hasPoppins = await registerPoppins(doc);
    const font = hasPoppins ? 'Poppins' : 'helvetica';

    const logo = await loadLogo();

    // ── Header band ─────────────────────────────────────────────────────────────
    const bandHeight = 40;
    doc.setFillColor(...BRAND.indigo);
    doc.rect(0, 0, pageWidth, bandHeight, 'F');
    // Thin accent strip under the band
    doc.setFillColor(...BRAND.coral);
    doc.rect(0, bandHeight, pageWidth, 1.5, 'F');

    let logoRight = margin;
    if (logo && logo.naturalWidth > 0) {
      const logoH = 20;
      const logoW = (logo.naturalWidth / logo.naturalHeight) * logoH;
      doc.addImage(logo, 'PNG', margin, (bandHeight - logoH) / 2, logoW, logoH);
      logoRight = margin + logoW + 6;
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont(font, 'bold');
    doc.setFontSize(22);
    doc.text('JotMinds', logoRight, 19);
    doc.setFont(font, 'normal');
    doc.setFontSize(9);
    doc.text('Your brain has a manual, we built it', logoRight, 26);

    yPos = bandHeight + 12;

    // ── Subject / meta line ──────────────────────────────────────────────────────
    doc.setTextColor(...BRAND.dark);
    doc.setFont(font, 'bold');
    doc.setFontSize(15);
    doc.text(userName || 'User', margin, yPos);
    yPos += 6;

    doc.setTextColor(...BRAND.muted);
    doc.setFont(font, 'normal');
    doc.setFontSize(9.5);
    doc.text(
      `Completed on ${new Date(assessment.completedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`,
      margin,
      yPos,
    );
    yPos += 12;
  
  doc.setTextColor(...BRAND.ink);

  // Main Style Section
  const score = assessment.score || {};
  const mainStyle = score.kolb?.style || score.sternberg?.style || score.dualProcess?.style || score['teaching-style']?.primaryStyle || '';
  
  // Style Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 24, 3, 3, 'FD');
  
  doc.setFont(font, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.indigo);
  doc.text(`Your Style: ${mainStyle || 'N/A'}`, margin + 6, yPos + 10);
  
  let description = '';
  try {
    description = mainStyle ? getStyleDescription(assessment.type as any, mainStyle) : 'Assessment completed successfully.';
  } catch {
    description = 'Assessment completed successfully.';
  }
  doc.setFont(font, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.ink);
  const descLines = doc.splitTextToSize(description, pageWidth - (margin * 2) - 12);
  doc.text(descLines, margin + 6, yPos + 18);
  yPos += Math.max(30, descLines.length * 5 + 24);

  // Executive Summary Card
  let insights: any;
  try {
    insights = getAssessmentInsights(assessment);
  } catch {
    insights = { strengths: ['Assessment completed'], weaknesses: ['N/A'], improvements: ['Continue learning'], organizationalFit: [] };
  }
  
  doc.setFontSize(15);
  doc.setFont(font, 'bold');
  doc.text('Executive Summary', margin, yPos);
  yPos += 8;

  const drawInsightBox = (title: string, text: string, color: [number, number, number]) => {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    const lines = doc.splitTextToSize(text, pageWidth - (margin * 2) - 12);
    const boxHeight = lines.length * 5 + 16;
    
    // Box background
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), boxHeight, 3, 3, 'F');
    
    // Title
    doc.setFontSize(11);
    doc.setFont(font, 'bold');
    doc.setTextColor(...BRAND.dark);
    doc.text(title, margin + 6, yPos + 8);
    
    // Text
    doc.setFont(font, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.ink);
    doc.text(lines, margin + 6, yPos + 16);
    
    yPos += boxHeight + 6;
  };

  // Top Strength (Light Green/Emerald)
  drawInsightBox('Top Strength:', insights.strengths[0] || 'N/A', [236, 253, 245]);
  // Priority Development Area (Light Amber)
  drawInsightBox('Priority Development Area:', insights.weaknesses[0] || 'N/A', [255, 251, 235]);
  // Key Action (Light Indigo)
  drawInsightBox('Key Action for Improvement:', insights.improvements[0] || 'N/A', [238, 242, 255]);

  // Organizational Fit (if applicable)
  if (isOrganizational && insights.organizationalFit.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont(font, 'bold');
    doc.text('Organizational Fit:', margin, yPos);
    yPos += 6;
    doc.setFont(font, 'normal');
    doc.setFontSize(10);
    
    insights.organizationalFit.slice(0, 2).forEach((fit: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      const fitLines = doc.splitTextToSize(`• ${fit}`, pageWidth - (margin * 2));
      doc.text(fitLines, margin + 2, yPos);
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
  if (score.kolb) {
    const ceLabel = isOrganizational ? 'Hands-on Experience:' : 'Concrete Experience:';
    const roLabel = isOrganizational ? 'Reflective Analysis:' : 'Reflective Observation:';
    const acLabel = isOrganizational ? 'Conceptual Frameworks:' : 'Abstract Conceptualization:';
    const aeLabel = isOrganizational ? 'Active Implementation:' : 'Active Experimentation:';
    
    doc.text(`${ceLabel} ${score.kolb.scores?.CE ?? 'N/A'}`, 25, yPos);
    yPos += 6;
    doc.text(`${roLabel} ${score.kolb.scores?.RO ?? 'N/A'}`, 25, yPos);
    yPos += 6;
    doc.text(`${acLabel} ${score.kolb.scores?.AC ?? 'N/A'}`, 25, yPos);
    yPos += 6;
    doc.text(`${aeLabel} ${score.kolb.scores?.AE ?? 'N/A'}`, 25, yPos);
    yPos += 10;
  } else if (score.sternberg) {
    doc.text(`Analytical: ${score.sternberg.scores?.analytical ?? 'N/A'}`, 25, yPos);
    yPos += 6;
    doc.text(`Creative: ${score.sternberg.scores?.creative ?? 'N/A'}`, 25, yPos);
    yPos += 6;
    doc.text(`Practical: ${score.sternberg.scores?.practical ?? 'N/A'}`, 25, yPos);
    yPos += 10;
  } else if (score.dualProcess) {
    const system1Label = isOrganizational ? 'Intuitive/Rapid:' : 'Intuitive (System 1):';
    const system2Label = isOrganizational ? 'Analytical/Deliberate:' : 'Reflective (System 2):';
    
    doc.text(`${system1Label} ${score.dualProcess.scores?.system1 ?? 'N/A'}`, 25, yPos);
    yPos += 6;
    doc.text(`${system2Label} ${score.dualProcess.scores?.system2 ?? 'N/A'}`, 25, yPos);
    yPos += 10;
  } else if (score['teaching-style']) {
    doc.text(`Primary Style: ${score['teaching-style'].primaryStyle || 'N/A'}`, 25, yPos);
    yPos += 6;
    doc.text(`Secondary Style: ${score['teaching-style'].secondaryStyle || 'N/A'}`, 25, yPos);
    yPos += 10;
  } else {
    // Generic fallback for any other assessment type
    try {
      const scoreEntries = Object.entries(score);
      if (scoreEntries.length > 0) {
        scoreEntries.slice(0, 6).forEach(([key, value]) => {
          doc.text(`${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`, 25, yPos);
          yPos += 6;
        });
        yPos += 4;
      } else {
        doc.text('Score details not available', 25, yPos);
        yPos += 10;
      }
    } catch {
      doc.text('Score details not available', 25, yPos);
      yPos += 10;
    }
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
    const safeUserName = userName || 'User';
    const filename = isOrganizational 
      ? `organizational-assessment-${safeUserName.replace(/\s+/g, '-')}.pdf`
      : `thinking-styles-report-${safeUserName.replace(/\s+/g, '-')}.pdf`;
    doc.save(filename);
    return true;
  } catch (err) {
    console.error('[PDF Generator] Error generating direct PDF:', err);
    return false;
  }
}

export async function exportReportToPDF(elementId: string, filename: string = 'Jotminds_Report.pdf'): Promise<boolean> {
  const element = document.getElementById(elementId) || document.querySelector(elementId) || document.querySelector('.max-w-4xl') || document.body;
  if (!element) return false;

  try {
    // Hide buttons or elements not meant for PDF (using a specific class if necessary)
    const noPrintElements = element.querySelectorAll('.no-print');
    noPrintElements.forEach(el => (el as HTMLElement).style.display = 'none');

    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
    });

    noPrintElements.forEach(el => (el as HTMLElement).style.display = '');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Load watermark image
    const addWatermark = async () => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = '/logo.png'; // Assuming logo is in public folder
        img.onload = () => {
          try {
            const totalPages = Math.ceil(imgHeight / pdfHeight);
            for (let i = 1; i <= totalPages; i++) {
              pdf.setPage(i);
              
              try {
                pdf.saveGraphicsState();
                pdf.setGState(new (pdf as any).GState({opacity: 0.1}));
              } catch (e) {
                console.warn('GState not supported or failed', e);
              }
              
              const watermarkSize = 100;
              pdf.addImage(img, 'PNG', (pdfWidth - watermarkSize) / 2, (pdfHeight - watermarkSize) / 2, watermarkSize, watermarkSize);
              
              try {
                pdf.restoreGraphicsState();
              } catch (e) {
                // Ignore
              }
            }
          } catch (e) {
            console.error('Error adding watermark', e);
          } finally {
            resolve();
          }
        };
        img.onerror = () => {
          console.warn("Watermark image not found, proceeding without it.");
          resolve();
        };
      });
    };

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add new pages if the content is long without cutting off content
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Add watermarks
    await addWatermark();

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}

export async function generateSchoolSummaryPDF(
  institutionName: string,
  stats: {
    totalStudents: number;
    totalAssessments: number;
    studentCount: number;
    teacherCount: number;
  },
  assessmentRecords: Array<{
    date: string;
    studentName: string;
    className: string;
    teacherName: string;
    type: string;
  }>
): Promise<boolean> {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16;
    let yPos = 20;

    // Header bar
    doc.setFillColor(...BRAND.dark);
    doc.rect(0, 0, pageWidth, 36, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(institutionName, margin, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 210, 230);
    doc.text('Official Cognitive & Educational Summary Report', margin, 28);

    doc.setTextColor(255, 255, 255);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin - 40, 28);

    yPos = 48;

    // Stats Grid Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(...BRAND.hairline);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 28, 3, 3, 'FD');

    const colWidth = (pageWidth - (margin * 2)) / 4;
    const statItems = [
      { label: 'Total Students', val: stats.studentCount.toString() },
      { label: 'Total Teachers', val: stats.teacherCount.toString() },
      { label: 'Completed Tests', val: stats.totalAssessments.toString() },
      { label: 'School Status', val: 'Active' },
    ];

    statItems.forEach((item, idx) => {
      const x = margin + (idx * colWidth) + 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...BRAND.muted);
      doc.text(item.label.toUpperCase(), x, yPos + 10);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...BRAND.dark);
      doc.text(item.val, x, yPos + 22);
    });

    yPos += 38;

    // Table Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND.dark);
    doc.text(`Assessment Activity Log (${assessmentRecords.length} records)`, margin, yPos);
    yPos += 8;

    // Table Header
    doc.setFillColor(...BRAND.indigo);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);

    doc.text('Date', margin + 4, yPos + 7);
    doc.text('Student', margin + 30, yPos + 7);
    doc.text('Class', margin + 85, yPos + 7);
    doc.text('Teacher', margin + 120, yPos + 7);
    doc.text('Assessment Type', margin + 155, yPos + 7);

    yPos += 10;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND.ink);

    const maxRows = Math.min(25, assessmentRecords.length);
    for (let i = 0; i < maxRows; i++) {
      const rec = assessmentRecords[i];
      const rowY = yPos + (i * 8);

      if (rowY > 270) break; // page overflow guard

      if (i % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, rowY - 5, pageWidth - (margin * 2), 8, 'F');
      }

      doc.text(rec.date, margin + 4, rowY);
      doc.text(rec.studentName.substring(0, 22), margin + 30, rowY);
      doc.text(rec.className.substring(0, 15), margin + 85, rowY);
      doc.text(rec.teacherName.substring(0, 16), margin + 120, rowY);
      doc.text(rec.type.substring(0, 20), margin + 155, rowY);
    }

    // Footer
    const footerY = 285;
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text('JotMinds Educational Cognitive Platform · Confidential Official Report', margin, footerY);

    doc.save(`${institutionName.replace(/[^a-zA-Z0-9]/g, '_')}_School_Report.pdf`);
    return true;
  } catch (err) {
    console.error('Failed to generate school summary PDF:', err);
    return false;
  }
}
