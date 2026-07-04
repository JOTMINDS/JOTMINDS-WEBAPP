import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Assessment, GhanaMapping } from '../types';
import { getStyleDescription } from './scoring';
import { getAssessmentInsights } from './insights';
import { poppinsBase64 } from './poppinsFont';
import { poppinsBoldBase64 } from './poppinsFontBold';

// ── JotMinds brand palette (RGB) ──────────────────────────────────────────────
const BRAND = {
  indigo: [91, 125, 177] as [number, number, number],   // #5B7DB1 primary
  dark: [35, 32, 99] as [number, number, number],        // #232063 deep
  purple: [107, 76, 154] as [number, number, number],    // #6B4C9A secondary
  coral: [255, 113, 91] as [number, number, number],     // #FF715B accent
  violet: [123, 97, 255] as [number, number, number],    // #7B61FF accent
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


export async function generatePDF(assessment: Assessment, userName: string, ghanaMapping: GhanaMapping | null, isOrganizational: boolean = false) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 20;

  // Load fonts
  doc.addFileToVFS('Poppins-Regular.ttf', poppinsBase64);
  doc.addFont('Poppins-Regular.ttf', 'Poppins', 'normal');
  doc.addFileToVFS('Poppins-Bold.ttf', poppinsBoldBase64);
  doc.addFont('Poppins-Bold.ttf', 'Poppins', 'bold');
  doc.setFont('Poppins', 'normal');

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
  doc.setFont('Poppins', 'bold');
  doc.setFontSize(22);
  doc.text('JotMinds', logoRight, 19);
  doc.setFont('Poppins', 'normal');
  doc.setFontSize(9);
  doc.text('Discover How You Think', logoRight, 26);

  // Report label on the right of the band
  doc.setFont('Poppins', 'bold');
  doc.setFontSize(10);
  const titleLine1 = isOrganizational ? 'ORGANIZATIONAL' : 'PERSONAL COGNITIVE';
  doc.text(titleLine1, pageWidth - margin, 17, { align: 'right' });
  doc.setFont('Poppins', 'normal');
  doc.setFontSize(9);
  doc.text('Assessment Report', pageWidth - margin, 23, { align: 'right' });

  yPos = bandHeight + 12;

  // ── Subject / meta line ──────────────────────────────────────────────────────
  doc.setTextColor(...BRAND.dark);
  doc.setFont('Poppins', 'bold');
  doc.setFontSize(15);
  doc.text(userName || 'User', margin, yPos);
  yPos += 6;

  doc.setTextColor(...BRAND.muted);
  doc.setFont('Poppins', 'normal');
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

  // Main Style
  const mainStyle = assessment.score.kolb?.style || assessment.score.sternberg?.style || assessment.score.dualProcess?.style || '';
  doc.setFontSize(16);
  doc.text(`Your Style: ${mainStyle}`, 20, yPos);
  yPos += 10;

  // Description
  const description = getStyleDescription(assessment.type as any, mainStyle);
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(description, pageWidth - 40);
  doc.text(descLines, 20, yPos);
  yPos += descLines.length * 5 + 15;

  // Executive Summary
  const insights = getAssessmentInsights(assessment);
  
  doc.setFontSize(16);
  doc.setFont('Poppins', 'bold');
  doc.text('Executive Summary', 20, yPos);
  yPos += 10;
  doc.setFont('Poppins', 'normal');

  // Top Strength
  doc.setFontSize(12);
  doc.setFont('Poppins', 'bold');
  doc.text('Top Strength:', 20, yPos);
  yPos += 6;
  doc.setFont('Poppins', 'normal');
  doc.setFontSize(10);
  const strengthLines = doc.splitTextToSize(insights.strengths[0] || 'N/A', pageWidth - 40);
  doc.text(strengthLines, 25, yPos);
  yPos += strengthLines.length * 5 + 5;

  // Priority Development Area
  doc.setFontSize(12);
  doc.setFont('Poppins', 'bold');
  doc.text('Priority Development Area:', 20, yPos);
  yPos += 6;
  doc.setFont('Poppins', 'normal');
  doc.setFontSize(10);
  const weaknessLines = doc.splitTextToSize(insights.weaknesses[0] || 'N/A', pageWidth - 40);
  doc.text(weaknessLines, 25, yPos);
  yPos += weaknessLines.length * 5 + 5;

  // Key Action
  doc.setFontSize(12);
  doc.setFont('Poppins', 'bold');
  doc.text('Key Action for Improvement:', 20, yPos);
  yPos += 6;
  doc.setFont('Poppins', 'normal');
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
    doc.setFont('Poppins', 'bold');
    doc.text('Organizational Fit:', 20, yPos);
    yPos += 6;
    doc.setFont('Poppins', 'normal');
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
  const safeUserName = userName || 'User';
  const filename = isOrganizational 
    ? `organizational-assessment-${safeUserName.replace(/\s+/g, '-')}.pdf`
    : `thinking-styles-report-${safeUserName.replace(/\s+/g, '-')}.pdf`;
  doc.save(filename);
}

export async function exportReportToPDF(elementId: string, filename: string = 'Jotminds_Report.pdf') {
  const element = document.getElementById(elementId);
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

    // Add new pages if the content is long
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
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
