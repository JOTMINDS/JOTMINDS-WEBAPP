import jsPDF from 'jspdf';
import { ParentObservationAssessment, User } from '../types';

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

// A light tint of a brand colour for card backgrounds.
function tint(rgb: [number, number, number], amount = 0.92): [number, number, number] {
  return [
    Math.round(rgb[0] + (255 - rgb[0]) * amount),
    Math.round(rgb[1] + (255 - rgb[1]) * amount),
    Math.round(rgb[2] + (255 - rgb[2]) * amount),
  ];
}

// Load the brand logo from /logo.png. Resolves to null if unavailable so the
// report still renders (falls back to the text wordmark).
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

export async function generateParentObservationPDF(
  assessment: ParentObservationAssessment,
  parentName: string,
  childName: string,
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

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
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('JotMinds', logoRight, 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Discover How You Think', logoRight, 26);

  // Report label on the right of the band
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PARENT OBSERVATION', pageWidth - margin, 17, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Assessment Report', pageWidth - margin, 23, { align: 'right' });

  let yPos = bandHeight + 12;

  // ── Subject / meta line ──────────────────────────────────────────────────────
  doc.setTextColor(...BRAND.dark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(childName, margin, yPos);
  yPos += 6;

  doc.setTextColor(...BRAND.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(
    `Observed by ${parentName}  ·  ${new Date(assessment.completedAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`,
    margin,
    yPos,
  );
  yPos += 9;

  // ── Helper: ensure vertical space, add page (with footer left to the end) ────
  const ensureSpace = (needed: number) => {
    if (yPos + needed > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }
  };

  // ── Overall summary card ─────────────────────────────────────────────────────
  const drawSummary = () => {
    const summaryLines = doc.splitTextToSize(assessment.score.overallSummary || '', contentWidth - 12);
    const cardH = 16 + summaryLines.length * 4.6;
    ensureSpace(cardH);
    doc.setFillColor(...tint(BRAND.indigo, 0.9));
    doc.setDrawColor(...BRAND.hairline);
    doc.roundedRect(margin, yPos, contentWidth, cardH, 2.5, 2.5, 'FD');
    // Accent bar
    doc.setFillColor(...BRAND.indigo);
    doc.roundedRect(margin, yPos, 2.5, cardH, 1.2, 1.2, 'F');

    doc.setTextColor(...BRAND.dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Overall Summary', margin + 8, yPos + 8);
    doc.setTextColor(...BRAND.ink);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(summaryLines, margin + 8, yPos + 14);
    yPos += cardH + 8;
  };
  if (assessment.score.overallSummary) drawSummary();

  // ── Section card renderer ────────────────────────────────────────────────────
  const sections: Array<{
    title: string;
    color: [number, number, number];
    data: { total: number; style: string; interpretation: string; insights: string; tags: string[] };
  }> = [
    { title: 'Learning Habits', color: BRAND.indigo, data: assessment.score.sectionA },
    { title: 'Thinking Patterns', color: BRAND.violet, data: assessment.score.sectionB },
    { title: 'Decision-Making Behavior', color: BRAND.purple, data: assessment.score.sectionC },
    { title: 'Motivation & Engagement', color: BRAND.coral, data: assessment.score.sectionD },
  ];

  const drawSection = (section: (typeof sections)[number]) => {
    const { title, color, data } = section;
    const interpLines = doc.splitTextToSize(data.interpretation || '', contentWidth - 16);
    const insightLines = data.insights ? doc.splitTextToSize(data.insights, contentWidth - 16) : [];
    const hasTags = Array.isArray(data.tags) && data.tags.length > 0;
    const cardH =
      22 + interpLines.length * 4.6 + (insightLines.length ? insightLines.length * 4.4 + 4 : 0) + (hasTags ? 9 : 0);

    ensureSpace(cardH + 4);

    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BRAND.hairline);
    doc.roundedRect(margin, yPos, contentWidth, cardH, 2.5, 2.5, 'FD');
    // Coloured header strip
    doc.setFillColor(...color);
    doc.roundedRect(margin, yPos, contentWidth, 9, 2.5, 2.5, 'F');
    doc.rect(margin, yPos + 5, contentWidth, 4, 'F'); // square off bottom of strip

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(title, margin + 6, yPos + 6);

    // Style + score row
    let innerY = yPos + 16;
    doc.setTextColor(...color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(data.style || '—', margin + 6, innerY);

    // Score pill on the right
    const scoreLabel = `Score ${data.total}`;
    doc.setFontSize(8.5);
    const pillW = doc.getTextWidth(scoreLabel) + 8;
    doc.setFillColor(...tint(color, 0.85));
    doc.roundedRect(pageWidth - margin - pillW - 6, innerY - 4.5, pillW, 6, 3, 3, 'F');
    doc.setTextColor(...color);
    doc.text(scoreLabel, pageWidth - margin - pillW - 6 + pillW / 2, innerY, { align: 'center' });

    innerY += 6;
    doc.setTextColor(...BRAND.ink);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(interpLines, margin + 6, innerY);
    innerY += interpLines.length * 4.6;

    if (insightLines.length) {
      innerY += 2;
      doc.setTextColor(...BRAND.muted);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.8);
      doc.text(insightLines, margin + 6, innerY);
      innerY += insightLines.length * 4.4;
    }

    // Tag pills
    if (hasTags) {
      innerY += 4;
      let tagX = margin + 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      data.tags.forEach((tag) => {
        const tagW = doc.getTextWidth(tag) + 7;
        if (tagX + tagW > pageWidth - margin - 6) return; // keep on one row
        doc.setFillColor(...tint(color, 0.8));
        doc.roundedRect(tagX, innerY - 3.8, tagW, 5.4, 2.7, 2.7, 'F');
        doc.setTextColor(...color);
        doc.text(tag, tagX + tagW / 2, innerY, { align: 'center' });
        tagX += tagW + 3;
      });
    }

    yPos += cardH + 6;
  };

  sections.forEach(drawSection);

  // ── Parent–child alignment (harmony) bar ─────────────────────────────────────
  if (assessment.score.harmonyScore !== undefined) {
    const harmony = assessment.score.harmonyScore;
    const interpretation =
      harmony >= 80
        ? "High alignment between your observations and your child's self-assessment."
        : harmony >= 60
        ? 'Moderate alignment — some differences in perception worth exploring.'
        : "Lower alignment — consider discussing these perceptions with your child.";
    const interpLines = doc.splitTextToSize(interpretation, contentWidth - 16);
    const cardH = 30 + interpLines.length * 4.6;
    ensureSpace(cardH + 4);

    doc.setFillColor(...tint(BRAND.purple, 0.9));
    doc.setDrawColor(...BRAND.hairline);
    doc.roundedRect(margin, yPos, contentWidth, cardH, 2.5, 2.5, 'FD');

    doc.setTextColor(...BRAND.dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Parent–Child Alignment', margin + 8, yPos + 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.purple);
    doc.text(`${harmony}%`, pageWidth - margin - 8, yPos + 9, { align: 'right' });

    // Progress track + fill
    const barX = margin + 8;
    const barY = yPos + 14;
    const barW = contentWidth - 16;
    doc.setFillColor(...BRAND.hairline);
    doc.roundedRect(barX, barY, barW, 3.5, 1.75, 1.75, 'F');
    doc.setFillColor(...BRAND.purple);
    doc.roundedRect(barX, barY, Math.max(2, (barW * Math.min(100, Math.max(0, harmony))) / 100), 3.5, 1.75, 1.75, 'F');

    doc.setTextColor(...BRAND.ink);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(interpLines, margin + 8, barY + 9);
    yPos += cardH + 6;
  }

  // ── Branded footer on every page ─────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const fy = pageHeight - 12;
    doc.setDrawColor(...BRAND.hairline);
    doc.line(margin, fy - 3, pageWidth - margin, fy - 3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text('Generated by JotMinds · Discover How You Think', margin, fy + 1);
    doc.setTextColor(...BRAND.indigo);
    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, fy + 1, { align: 'right' });
  }

  // ── Save ──────────────────────────────────────────────────────────────────────
  const filename = `parent-observation-${childName.replace(/\s+/g, '-')}-${new Date()
    .toISOString()
    .split('T')[0]}.pdf`;
  doc.save(filename);
}
