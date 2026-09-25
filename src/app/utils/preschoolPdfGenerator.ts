/**
 * JotMinds Preschool Developmental Assessment Framework (JM-PDAF v1.0)
 * Branded PDF Report Generator
 * Generates:
 * 1. Comprehensive Child Developmental Dossier
 * 2. Parent-Friendly Developmental Summary & Home Activity Guide
 * 3. Multidimensional School Readiness Transition Portfolio (Band P4)
 */

import jsPDF from 'jspdf';
import {
  ChildDevelopmentalProfile,
  SchoolReadinessProfile,
  ClassDevelopmentIntelligence,
  DEVELOPMENTAL_BANDS,
  DEVELOPMENTAL_DOMAINS,
  DevelopmentalDomainCode,
} from '../types/preschoolDevelopmental';

const BRAND = {
  indigo: [107, 76, 154] as [number, number, number], // #6B4C9A JotMinds Purple
  purple: [123, 97, 255] as [number, number, number],
  dark: [15, 23, 42] as [number, number, number],
  ink: [33, 37, 41] as [number, number, number],
  muted: [108, 117, 125] as [number, number, number],
  hairline: [225, 228, 235] as [number, number, number],
};

/**
 * 1. Comprehensive Child Developmental Dossier (Multi-page PDF)
 */
export async function generateChildDevelopmentReportPDF(profile: ChildDevelopmentalProfile): Promise<boolean> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let pageNumber = 1;

    const drawHeader = (subtitle: string) => {
      doc.setFillColor(...BRAND.indigo);
      doc.rect(0, 0, pageWidth, 28, 'F');
      doc.setFillColor(...BRAND.purple);
      doc.rect(0, 27.5, pageWidth, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text('JOTMINDS PRESCHOOL DEVELOPMENTAL INTELLIGENCE', margin, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(225, 230, 245);
      doc.text(`JM-PDAF v1.0 Framework · ${subtitle}`, margin, 19);
    };

    const drawFooter = () => {
      doc.setDrawColor(...BRAND.hairline);
      doc.setLineWidth(0.3);
      doc.line(margin, 282, pageWidth - margin, 282);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...BRAND.muted);
      doc.text('JotMinds Early Childhood Developmental System · Evidence-Led & Confidential', margin, 288);
      doc.text(`Page ${pageNumber}`, pageWidth - margin - 12, 288);
    };

    // PAGE 1: Executive Profile & 7 Domains
    drawHeader('Comprehensive Child Developmental Dossier');

    let currentY = 38;

    // Child Identification Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'F');
    doc.setDrawColor(...BRAND.hairline);
    doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.dark);
    doc.text(profile.child.name || 'Child Learner', margin + 5, currentY + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND.muted);
    const bandInfo = DEVELOPMENTAL_BANDS[profile.assignedBand];
    doc.text(
      `Age: ${profile.ageYears} yrs · Band: ${bandInfo.code} (${bandInfo.ageRange}) · Evidence Language: ${profile.dominantLanguageOfEvidence}`,
      margin + 5,
      currentY + 16
    );
    doc.text(
      `Total Evidence Events: ${profile.totalEvidenceEvents} · Last Observed: ${profile.lastObservationDate || 'Recent'}`,
      margin + 5,
      currentY + 22
    );

    currentY += 34;

    // Section 1: Multidimensional Domain Overview
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.indigo);
    doc.text('SEVEN CORE DEVELOPMENTAL DOMAINS (JM-PDAF)', margin, currentY);
    currentY += 2;
    doc.setDrawColor(...BRAND.indigo);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, margin + 55, currentY);
    currentY += 6;

    // Domains Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.dark);
    doc.text('Domain', margin + 3, currentY + 4.8);
    doc.text('Indicators', margin + 65, currentY + 4.8);
    doc.text('Avg Stage (1–4)', margin + 95, currentY + 4.8);
    doc.text('Developmental Stage', margin + 130, currentY + 4.8);
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

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.ink);
      doc.text(d.domainName, margin + 3, currentY + 5);

      doc.setFont('helvetica', 'normal');
      doc.text(`${d.observedCount} / ${d.totalIndicators}`, margin + 65, currentY + 5);
      doc.text(`${d.averageStage > 0 ? d.averageStage : '—'} / 4.0`, margin + 95, currentY + 5);

      // Stage label
      doc.setFont('helvetica', 'bold');
      if (d.averageStage >= 2.8) doc.setTextColor(16, 185, 129); // emerald
      else if (d.averageStage >= 1.8) doc.setTextColor(217, 119, 6); // amber
      else doc.setTextColor(239, 68, 68); // red
      doc.text(d.stageLabel, margin + 130, currentY + 5);

      currentY += 7.5;
    });

    currentY += 8;

    // Emerging Strengths Card
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(21, 128, 61);
    doc.text('Key Emerging Strengths (Achieving Independently)', margin + 4, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);
    let sY = currentY + 11;
    profile.overallEmergingStrengths.slice(0, 3).forEach(str => {
      doc.text(`• ${str}`, margin + 6, sY);
      sY += 4.5;
    });

    currentY += 32;

    // Priority Focus Areas
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'F');
    doc.setDrawColor(253, 230, 138);
    doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(180, 83, 9);
    doc.text('Priority Development Areas (Currently Consolidating)', margin + 4, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);
    let pY = currentY + 11;
    profile.priorityDevelopmentAreas.slice(0, 3).forEach(pri => {
      doc.text(`• ${pri}`, margin + 6, pY);
      pY += 4.5;
    });

    drawFooter();

    // PAGE 2: Teacher Next Steps & Home Activities
    doc.addPage();
    pageNumber++;
    drawHeader('Teacher Next Steps & Home Collaboration');
    currentY = 38;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.indigo);
    doc.text('RECOMMENDED TEACHER INSTRUCTIONAL NEXT STEPS', margin, currentY);
    currentY += 2;
    doc.setDrawColor(...BRAND.indigo);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, margin + 70, currentY);
    currentY += 8;

    const teacherActions = Object.values(profile.domains).flatMap(d => d.suggestedTeacherActions);
    const uniqueTeacherActions = [...new Set(teacherActions)].slice(0, 4);

    uniqueTeacherActions.forEach(act => {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, currentY, contentWidth, 14, 1.5, 1.5, 'F');
      doc.setDrawColor(...BRAND.hairline);
      doc.roundedRect(margin, currentY, contentWidth, 14, 1.5, 1.5, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.dark);
      doc.text('Classroom Strategy:', margin + 4, currentY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...BRAND.ink);
      const wrapped = doc.splitTextToSize(act, contentWidth - 40);
      doc.text(wrapped, margin + 35, currentY + 5.5);

      currentY += 17;
    });

    currentY += 6;

    // Home Collaboration Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.indigo);
    doc.text('SUGGESTED HOME COLLABORATION ACTIVITIES', margin, currentY);
    currentY += 2;
    doc.setDrawColor(...BRAND.indigo);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, margin + 65, currentY);
    currentY += 8;

    profile.parentSummary.recommendedHomeActivities.forEach(ha => {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, currentY, contentWidth, 20, 1.5, 1.5, 'F');
      doc.setDrawColor(...BRAND.hairline);
      doc.roundedRect(margin, currentY, contentWidth, 20, 1.5, 1.5, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...BRAND.purple);
      doc.text(ha.title, margin + 4, currentY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.ink);
      const wrappedDesc = doc.splitTextToSize(ha.description, contentWidth - 8);
      doc.text(wrappedDesc, margin + 4, currentY + 11);

      currentY += 23;
    });

    drawFooter();

    const fileName = `${(profile.child.name || 'Child').replace(/[^a-zA-Z0-9]/g, '_')}_JM_PDAF_Dossier.pdf`;
    doc.save(fileName);
    return true;
  } catch (err) {
    console.error('Failed to generate child developmental PDF:', err);
    return false;
  }
}

/**
 * 2. Parent-Friendly Developmental Summary & Home Activity Guide
 */
export async function generateParentSummaryPDF(profile: ChildDevelopmentalProfile): Promise<boolean> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;

    // Soft header
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setFillColor(129, 140, 248);
    doc.rect(0, 27.5, pageWidth, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('FAMILY DEVELOPMENTAL SUMMARY & HOME GUIDE', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(224, 231, 255);
    doc.text(`Celebrating Growth & Playful Learning at Home · ${profile.child.name}`, margin, 19);

    let currentY = 38;

    // Warm greeting
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...BRAND.ink);
    const greetingWrapped = doc.splitTextToSize(profile.parentSummary.greeting, contentWidth);
    doc.text(greetingWrapped, margin, currentY);
    currentY += greetingWrapped.length * 5 + 4;

    const narrativeWrapped = doc.splitTextToSize(profile.parentSummary.narrativeSummary, contentWidth);
    doc.text(narrativeWrapped, margin, currentY);
    currentY += narrativeWrapped.length * 5 + 6;

    // What your child is enjoying & doing well
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(21, 128, 61);
    doc.text("What We Are Celebrating in School:", margin + 5, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(22, 101, 52);
    let sY = currentY + 13;
    profile.parentSummary.highlightStrengths.forEach(str => {
      doc.text(`🌟 ${str}`, margin + 6, sY);
      sY += 5;
    });

    currentY += 38;

    // What we are practicing together
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'F');
    doc.setDrawColor(253, 230, 138);
    doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(180, 83, 9);
    doc.text("What We Are Practicing Right Now:", margin + 5, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(146, 64, 14);
    let pY = currentY + 13;
    profile.parentSummary.whatWeArePracticing.forEach(str => {
      doc.text(`🌱 ${str}`, margin + 6, pY);
      pY += 5;
    });

    currentY += 40;

    // Fun Home Activities
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    doc.text('3 FUN & PLAYFUL ACTIVITIES TO TRY AT HOME', margin, currentY);
    currentY += 2;
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, margin + 65, currentY);
    currentY += 7;

    profile.parentSummary.recommendedHomeActivities.forEach(ha => {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'F');
      doc.setDrawColor(...BRAND.hairline);
      doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...BRAND.dark);
      doc.text(ha.title, margin + 5, currentY + 6.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.ink);
      const descWrapped = doc.splitTextToSize(ha.description, contentWidth - 10);
      doc.text(descWrapped, margin + 5, currentY + 12);

      currentY += 25;
    });

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND.muted);
    doc.text('Thank you for partnering with us in your child\'s early learning journey! · JotMinds Early Years', margin, 286);

    const fileName = `${(profile.child.name || 'Child').replace(/[^a-zA-Z0-9]/g, '_')}_Parent_Developmental_Guide.pdf`;
    doc.save(fileName);
    return true;
  } catch (err) {
    console.error('Failed to generate parent summary PDF:', err);
    return false;
  }
}

/**
 * 3. Multidimensional School Readiness Transition Portfolio (Band P4)
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

    doc.setFillColor(217, 119, 6); // Amber 600
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setFillColor(251, 191, 36);
    doc.rect(0, 27.5, pageWidth, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('MULTIDIMENSIONAL SCHOOL READINESS PORTFOLIO', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(254, 243, 199);
    doc.text(`Kindergarten to Primary 1 Transition · JM-PDAF Band P4 (Ages 5–6) · ${childName}`, margin, 19);

    let currentY = 38;

    // Narrative Summary Card
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'F');
    doc.setDrawColor(253, 230, 138);
    doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(180, 83, 9);
    doc.text('Developmental Readiness Narrative:', margin + 4, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);
    const narrWrapped = doc.splitTextToSize(readiness.overallReadinessSummary, contentWidth - 8);
    doc.text(narrWrapped, margin + 4, currentY + 11);

    currentY += 30;

    // 7 Dimensions Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(217, 119, 6);
    doc.text('SEVEN FOUNDATIONAL SCHOOL READINESS DIMENSIONS', margin, currentY);
    currentY += 2;
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, margin + 65, currentY);
    currentY += 6;

    readiness.dimensions.forEach((dim, idx) => {
      doc.setFillColor(idx % 2 === 0 ? 248 : 255, 250, 252);
      doc.roundedRect(margin, currentY, contentWidth, 13, 1.5, 1.5, 'F');
      doc.setDrawColor(...BRAND.hairline);
      doc.roundedRect(margin, currentY, contentWidth, 13, 1.5, 1.5, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...BRAND.dark);
      doc.text(dim.dimension, margin + 4, currentY + 5);

      // Score progress indicator
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      if (dim.score >= 80) doc.setTextColor(16, 185, 129);
      else if (dim.score >= 65) doc.setTextColor(217, 119, 6);
      else doc.setTextColor(239, 68, 68);
      doc.text(`${dim.stageLabel} (${dim.score}%)`, margin + 55, currentY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...BRAND.muted);
      doc.text(`Evidence: ${dim.keyEvidence.substring(0, 75)}`, margin + 4, currentY + 9.5);

      currentY += 15;
    });

    currentY += 4;

    // Transition Checklist
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
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

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.ink);
      doc.text(item.title, margin + 8, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...BRAND.muted);
      doc.text(`[${item.domain}]`, margin + 140, currentY);

      currentY += 6;
    });

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND.muted);
    doc.text('JotMinds Kindergarten to Primary Transition Portfolio · Confidential Diagnostic Profile', margin, 286);

    const fileName = `${childName.replace(/[^a-zA-Z0-9]/g, '_')}_School_Readiness_Portfolio.pdf`;
    doc.save(fileName);
    return true;
  } catch (err) {
    console.error('Failed to generate school readiness PDF:', err);
    return false;
  }
}
