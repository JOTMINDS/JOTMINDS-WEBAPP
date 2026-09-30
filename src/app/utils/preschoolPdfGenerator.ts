/**
 * JotMinds Early Childhood Framework
 * Branded PDF Report Generator
 *
 * Generates:
 * 1. JotMinds Early Childhood Growth Report
 * 2. JotMinds Family Growth Guide & Playful Activities
 * 3. JotMinds Primary School Readiness Profile (Ages 5–6)
 */

import jsPDF from 'jspdf';
import {
  ChildDevelopmentalProfile,
  SchoolReadinessProfile,
  DEVELOPMENTAL_BANDS,
  DEVELOPMENTAL_DOMAINS,
  DevelopmentalDomainCode,
} from '../types/preschoolDevelopmental';
import { registerPoppins } from './pdfFonts';

// ── Official JotMinds brand palette (RGB) ──────────────────────────────────────
const BRAND = {
  indigo: [107, 76, 154] as [number, number, number], // #6B4C9A JotMinds Purple
  purple: [123, 97, 255] as [number, number, number], // #7B61FF Violet accent
  coral: [255, 113, 91] as [number, number, number],  // #FF715B Coral accent
  dark: [15, 23, 42] as [number, number, number],      // #0F172A Slate 900
  ink: [33, 37, 41] as [number, number, number],       // #212529 body text
  muted: [108, 117, 125] as [number, number, number],  // secondary text
  hairline: [225, 228, 235] as [number, number, number], // borders
  emerald: [16, 185, 129] as [number, number, number],
  amber: [217, 119, 6] as [number, number, number],
};

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

function drawJotMindsHeader(
  doc: jsPDF,
  reportTitle: string,
  pageWidth: number,
  margin: number,
  logo: HTMLImageElement | null,
  font: string
) {
  const bandHeight = 36;
  doc.setFillColor(...BRAND.indigo);
  doc.rect(0, 0, pageWidth, bandHeight, 'F');

  // Coral accent line
  doc.setFillColor(...BRAND.coral);
  doc.rect(0, bandHeight, pageWidth, 1.5, 'F');

  let logoRight = margin;
  if (logo && logo.naturalWidth > 0) {
    const logoH = 18;
    const logoW = (logo.naturalWidth / logo.naturalHeight) * logoH;
    doc.addImage(logo, 'PNG', margin, (bandHeight - logoH) / 2, logoW, logoH);
    logoRight = margin + logoW + 6;
  }

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont(font, 'bold');
  doc.setFontSize(18);
  doc.text('JotMinds', logoRight, 16);

  // Brand Tagline
  doc.setFont(font, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(230, 230, 245);
  doc.text('Your brain has a manual, we built it', logoRight, 22);

  // Subtitle / Report Title
  doc.setFont(font, 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(reportTitle.toUpperCase(), logoRight, 30);
}

function drawJotMindsFooter(
  doc: jsPDF,
  pageNumber: number,
  pageWidth: number,
  margin: number,
  font: string
) {
  doc.setDrawColor(...BRAND.hairline);
  doc.setLineWidth(0.3);
  doc.line(margin, 282, pageWidth - margin, 282);

  doc.setFont(font, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...BRAND.muted);
  doc.text('JotMinds Early Childhood Developmental System · Confidential', margin, 288);
  doc.text(`Page ${pageNumber}`, pageWidth - margin - 14, 288);
}

/**
 * 1. JotMinds Early Childhood Growth Report (Multi-page PDF)
 */
export async function generateChildDevelopmentReportPDF(profile: ChildDevelopmentalProfile): Promise<boolean> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let pageNumber = 1;

    const hasPoppins = await registerPoppins(doc);
    const font = hasPoppins ? 'Poppins' : 'helvetica';
    const logo = await loadLogo();

    // PAGE 1: Child Overview & Learning Areas
    drawJotMindsHeader(doc, 'Early Childhood Growth Report', pageWidth, margin, logo, font);

    let currentY = 46;

    // Child Identification Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'F');
    doc.setDrawColor(...BRAND.hairline);
    doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'S');

    doc.setFont(font, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.dark);
    doc.text(profile.child.name || 'Child Learner', margin + 6, currentY + 9);

    doc.setFont(font, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND.muted);
    const bandInfo = DEVELOPMENTAL_BANDS[profile.assignedBand];
    const ageGroupLabel = bandInfo ? `${bandInfo.ageRange} (${bandInfo.title})` : `${profile.ageYears} years`;
    doc.text(
      `Age: ${profile.ageYears} yrs · Age Group: ${ageGroupLabel} · Class: ${profile.child.className || 'Early Years'}`,
      margin + 6,
      currentY + 16
    );
    doc.text(
      `Total Observations Recorded: ${profile.totalEvidenceEvents} · Last Observed: ${profile.lastObservationDate || 'Recent'}`,
      margin + 6,
      currentY + 22
    );

    currentY += 34;

    // Section 1: Learning & Growth Areas
    doc.setFont(font, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.indigo);
    doc.text('LEARNING & GROWTH AREAS', margin, currentY);
    currentY += 2;
    doc.setFillColor(...BRAND.coral);
    doc.rect(margin, currentY, 40, 0.8, 'F');
    currentY += 6;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, currentY, contentWidth, 7, 'F');
    doc.setFont(font, 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.dark);
    doc.text('Learning Area', margin + 4, currentY + 4.8);
    doc.text('Milestones Noted', margin + 70, currentY + 4.8);
    doc.text('Progress Stage', margin + 120, currentY + 4.8);
    currentY += 7;

    const domainList: DevelopmentalDomainCode[] = [
      'JM-CD',
      'JM-LC',
      'JM-EN',
      'JM-SE',
      'JM-PM',
      'JM-CE',
      'JM-IL',
    ];

    domainList.forEach((dCode, idx) => {
      const d = profile.domains[dCode];
      if (idx % 2 === 1) {
        doc.setFillColor(250, 250, 252);
        doc.rect(margin, currentY, contentWidth, 7.5, 'F');
      }

      doc.setFont(font, 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.ink);
      doc.text(d.domainName, margin + 4, currentY + 5);

      doc.setFont(font, 'normal');
      doc.text(`${d.observedCount} of ${d.totalIndicators} observed`, margin + 70, currentY + 5);

      // Stage label
      doc.setFont(font, 'bold');
      if (d.averageStage >= 2.8) doc.setTextColor(16, 185, 129); // emerald
      else if (d.averageStage >= 1.8) doc.setTextColor(217, 119, 6); // amber
      else doc.setTextColor(79, 70, 229); // indigo
      doc.text(d.stageLabel, margin + 120, currentY + 5);

      currentY += 7.5;
    });

    currentY += 8;

    // Strengths We Celebrate Box
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'S');

    doc.setFont(font, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(21, 128, 61);
    doc.text('🌟 Strengths We Celebrate (Doing on their own):', margin + 5, currentY + 6);

    doc.setFont(font, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);
    let sY = currentY + 11;
    (profile.overallEmergingStrengths.length ? profile.overallEmergingStrengths : ['Enjoys exploring learning materials', 'Interacts warmly with classmates']).slice(0, 3).forEach(str => {
      doc.text(`• ${str}`, margin + 6, sY);
      sY += 4.5;
    });

    currentY += 32;

    // What We Are Practicing Next Box
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'F');
    doc.setDrawColor(253, 230, 138);
    doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'S');

    doc.setFont(font, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(180, 83, 9);
    doc.text('🌱 Practicing & Exploring Next:', margin + 5, currentY + 6);

    doc.setFont(font, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);
    let pY = currentY + 11;
    (profile.priorityDevelopmentAreas.length ? profile.priorityDevelopmentAreas : ['Expanding expressive vocabulary', 'Refining fine motor control during creative play']).slice(0, 3).forEach(pri => {
      doc.text(`• ${pri}`, margin + 6, pY);
      pY += 4.5;
    });

    drawJotMindsFooter(doc, pageNumber, pageWidth, margin, font);

    // PAGE 2: Classroom Next Steps & Home Play
    doc.addPage();
    pageNumber++;
    drawJotMindsHeader(doc, 'Classroom Support & Home Activities', pageWidth, margin, logo, font);
    currentY = 46;

    doc.setFont(font, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.indigo);
    doc.text('HELPFUL CLASSROOM NEXT STEPS', margin, currentY);
    currentY += 2;
    doc.setFillColor(...BRAND.coral);
    doc.rect(margin, currentY, 40, 0.8, 'F');
    currentY += 7;

    const teacherActions = Object.values(profile.domains).flatMap(d => d.suggestedTeacherActions);
    const uniqueTeacherActions = [...new Set(teacherActions)].slice(0, 3);
    const actionsToRender = uniqueTeacherActions.length ? uniqueTeacherActions : [
      'Encourage playful turn-taking during morning play and circle time.',
      'Provide open-ended building and counting items during free choice stations.',
      'Ask open questions about story characters to build confidence in speaking.',
    ];

    actionsToRender.forEach(act => {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, currentY, contentWidth, 14, 1.5, 1.5, 'F');
      doc.setDrawColor(...BRAND.hairline);
      doc.roundedRect(margin, currentY, contentWidth, 14, 1.5, 1.5, 'S');

      doc.setFont(font, 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.dark);
      doc.text('Classroom Idea:', margin + 4, currentY + 5.5);

      doc.setFont(font, 'normal');
      doc.setTextColor(...BRAND.ink);
      const wrapped = doc.splitTextToSize(act, contentWidth - 36);
      doc.text(wrapped, margin + 30, currentY + 5.5);

      currentY += 17;
    });

    currentY += 6;

    // Home Activities Section
    doc.setFont(font, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.indigo);
    doc.text('PLAYFUL ACTIVITIES FOR HOME', margin, currentY);
    currentY += 2;
    doc.setFillColor(...BRAND.coral);
    doc.rect(margin, currentY, 40, 0.8, 'F');
    currentY += 7;

    profile.parentSummary.recommendedHomeActivities.forEach(ha => {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, currentY, contentWidth, 20, 1.5, 1.5, 'F');
      doc.setDrawColor(...BRAND.hairline);
      doc.roundedRect(margin, currentY, contentWidth, 20, 1.5, 1.5, 'S');

      doc.setFont(font, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...BRAND.purple);
      doc.text(ha.title, margin + 5, currentY + 6);

      doc.setFont(font, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.ink);
      const wrappedDesc = doc.splitTextToSize(ha.description, contentWidth - 10);
      doc.text(wrappedDesc, margin + 5, currentY + 11.5);

      currentY += 23;
    });

    drawJotMindsFooter(doc, pageNumber, pageWidth, margin, font);

    const fileName = `${(profile.child.name || 'Child').replace(/[^a-zA-Z0-9]/g, '_')}_JotMinds_Growth_Report.pdf`;
    doc.save(fileName);
    return true;
  } catch (err) {
    console.error('Failed to generate child growth report PDF:', err);
    return false;
  }
}

/**
 * 2. JotMinds Family Growth Guide & Playful Activities
 */
export async function generateParentSummaryPDF(profile: ChildDevelopmentalProfile): Promise<boolean> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;

    const hasPoppins = await registerPoppins(doc);
    const font = hasPoppins ? 'Poppins' : 'helvetica';
    const logo = await loadLogo();

    drawJotMindsHeader(doc, 'Family Growth Guide & Playful Activities', pageWidth, margin, logo, font);

    let currentY = 46;

    // Greeting box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'F');
    doc.setDrawColor(...BRAND.hairline);
    doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'S');

    doc.setFont(font, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.dark);
    doc.text(`A Special Note About ${profile.child.name || 'Your Child'}`, margin + 5, currentY + 7);

    doc.setFont(font, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND.muted);
    doc.text(profile.parentSummary.greeting, margin + 5, currentY + 13.5);

    currentY += 26;

    // What your child is enjoying & doing well
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'S');

    doc.setFont(font, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(21, 128, 61);
    doc.text('🌟 What We Are Celebrating in School:', margin + 5, currentY + 7);

    doc.setFont(font, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(22, 101, 52);
    let sY = currentY + 13;
    profile.parentSummary.highlightStrengths.forEach(str => {
      doc.text(`• ${str}`, margin + 6, sY);
      sY += 5;
    });

    currentY += 38;

    // What we are practicing together
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'F');
    doc.setDrawColor(253, 230, 138);
    doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'S');

    doc.setFont(font, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(180, 83, 9);
    doc.text('🌱 What We Are Practicing Right Now:', margin + 5, currentY + 7);

    doc.setFont(font, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(146, 64, 14);
    let pY = currentY + 13;
    profile.parentSummary.whatWeArePracticing.forEach(str => {
      doc.text(`• ${str}`, margin + 6, pY);
      pY += 5;
    });

    currentY += 40;

    // Fun Home Activities
    doc.setFont(font, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.indigo);
    doc.text('FUN & PLAYFUL ACTIVITIES TO TRY AT HOME', margin, currentY);
    currentY += 2;
    doc.setFillColor(...BRAND.coral);
    doc.rect(margin, currentY, 40, 0.8, 'F');
    currentY += 7;

    profile.parentSummary.recommendedHomeActivities.forEach(ha => {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'F');
      doc.setDrawColor(...BRAND.hairline);
      doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'S');

      doc.setFont(font, 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...BRAND.dark);
      doc.text(ha.title, margin + 5, currentY + 6.5);

      doc.setFont(font, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.ink);
      const descWrapped = doc.splitTextToSize(ha.description, contentWidth - 10);
      doc.text(descWrapped, margin + 5, currentY + 12);

      currentY += 25;
    });

    drawJotMindsFooter(doc, 1, pageWidth, margin, font);

    const fileName = `${(profile.child.name || 'Child').replace(/[^a-zA-Z0-9]/g, '_')}_JotMinds_Family_Guide.pdf`;
    doc.save(fileName);
    return true;
  } catch (err) {
    console.error('Failed to generate family guide PDF:', err);
    return false;
  }
}

/**
 * 3. JotMinds Primary School Readiness Profile (Ages 5–6)
 */
export async function generateSchoolReadinessPDF(
  childName: string,
  readiness: SchoolReadinessProfile
): Promise<boolean> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;

    const hasPoppins = await registerPoppins(doc);
    const font = hasPoppins ? 'Poppins' : 'helvetica';
    const logo = await loadLogo();

    drawJotMindsHeader(doc, 'Primary School Readiness Profile', pageWidth, margin, logo, font);

    let currentY = 46;

    // Child Banner
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'F');
    doc.setDrawColor(253, 230, 138);
    doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'S');

    doc.setFont(font, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9);
    doc.text(`Kindergarten to Primary 1 Transition · ${childName} (Ages 5–6)`, margin + 5, currentY + 7);

    doc.setFont(font, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);
    const narrWrapped = doc.splitTextToSize(readiness.overallReadinessSummary, contentWidth - 10);
    doc.text(narrWrapped, margin + 5, currentY + 13);

    currentY += 30;

    // 7 Readiness Dimensions
    doc.setFont(font, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.indigo);
    doc.text('FOUNDATIONAL SCHOOL READINESS AREAS', margin, currentY);
    currentY += 2;
    doc.setFillColor(...BRAND.coral);
    doc.rect(margin, currentY, 40, 0.8, 'F');
    currentY += 6;

    readiness.dimensions.forEach((dim, idx) => {
      doc.setFillColor(idx % 2 === 0 ? 248 : 255, 250, 252);
      doc.roundedRect(margin, currentY, contentWidth, 13, 1.5, 1.5, 'F');
      doc.setDrawColor(...BRAND.hairline);
      doc.roundedRect(margin, currentY, contentWidth, 13, 1.5, 1.5, 'S');

      doc.setFont(font, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...BRAND.dark);
      doc.text(dim.dimension, margin + 5, currentY + 5);

      // Score progress indicator
      doc.setFont(font, 'bold');
      doc.setFontSize(8);
      if (dim.score >= 80) doc.setTextColor(16, 185, 129);
      else if (dim.score >= 65) doc.setTextColor(217, 119, 6);
      else doc.setTextColor(239, 68, 68);
      doc.text(`${dim.stageLabel} (${dim.score}%)`, margin + 65, currentY + 5);

      doc.setFont(font, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...BRAND.muted);
      doc.text(`Observed: ${dim.keyEvidence.substring(0, 80)}`, margin + 5, currentY + 9.5);

      currentY += 15;
    });

    currentY += 4;

    // Transition Checklist
    doc.setFont(font, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.dark);
    doc.text('PRIMARY 1 CLASSROOM ROUTINES CHECKLIST', margin, currentY);
    currentY += 6;

    readiness.classroomPreparationChecklist.forEach(item => {
      doc.setDrawColor(...BRAND.indigo);
      doc.setLineWidth(0.3);
      doc.rect(margin + 2, currentY - 2.5, 3, 3, 'S');

      if (item.isConsolidated) {
        doc.setFillColor(16, 185, 129);
        doc.rect(margin + 2.5, currentY - 2, 2, 2, 'F');
      }

      doc.setFont(font, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.ink);
      doc.text(item.title, margin + 8, currentY);

      doc.setFont(font, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...BRAND.muted);
      doc.text(`[${item.domain}]`, margin + 140, currentY);

      currentY += 6;
    });

    drawJotMindsFooter(doc, 1, pageWidth, margin, font);

    const fileName = `${childName.replace(/[^a-zA-Z0-9]/g, '_')}_JotMinds_School_Readiness.pdf`;
    doc.save(fileName);
    return true;
  } catch (err) {
    console.error('Failed to generate school readiness PDF:', err);
    return false;
  }
}
