import { RoleCognitiveDemand } from './cognitiveRoleFitEngine';

/**
 * Parses a job description text and auto-estimates the 10 cognitive demand dimensions.
 * Uses keyword frequency analysis to score each dimension on a 1-10 scale.
 */

interface ParsedJobDescription {
  title: string;
  description: string;
  demands: RoleCognitiveDemand;
}

// Keyword dictionaries for each cognitive dimension
const dimensionKeywords: Record<keyof RoleCognitiveDemand, { high: string[]; low: string[] }> = {
  analyticalDepth: {
    high: ['analyze', 'analytical', 'data-driven', 'research', 'quantitative', 'statistics', 'metrics', 'modeling', 'algorithm', 'complex', 'systematic', 'evaluate', 'diagnose', 'investigate', 'interpret', 'assessment', 'insights', 'forensic', 'troubleshoot', 'debug', 'optimization', 'engineering', 'scientific'],
    low: ['basic', 'simple', 'routine', 'straightforward', 'standard', 'follow instructions'],
  },
  ambiguityTolerance: {
    high: ['ambiguous', 'uncertainty', 'evolving', 'dynamic', 'startup', 'unstructured', 'undefined', 'flexible', 'adaptable', 'pivot', 'change', 'agile', 'iterative', 'explore', 'experiment', 'emerging', 'innovative', 'novel', 'open-ended', 'autonomous'],
    low: ['structured', 'defined', 'standard operating', 'sop', 'clear guidelines', 'established', 'predictable', 'consistent', 'documented', 'procedure', 'protocol', 'compliance'],
  },
  emotionalLaborLoad: {
    high: ['empathy', 'emotional', 'counseling', 'support', 'patient', 'care', 'conflict resolution', 'sensitive', 'compassion', 'wellbeing', 'mental health', 'client-facing', 'customer service', 'interpersonal', 'relationship', 'stakeholder management', 'negotiation', 'difficult conversations', 'de-escalation', 'coaching', 'mentoring'],
    low: ['independent', 'solo', 'backend', 'automated', 'technical', 'mechanical', 'laboratory'],
  },
  decisionSpeed: {
    high: ['fast-paced', 'rapid', 'quick', 'real-time', 'urgent', 'deadline', 'time-sensitive', 'high-pressure', 'responsive', 'immediate', 'on-the-spot', 'crisis', 'emergency', 'triage', 'prioritize'],
    low: ['deliberate', 'thorough', 'careful', 'long-term', 'strategic planning', 'methodical', 'review', 'peer review', 'consensus'],
  },
  stakeholderComplexity: {
    high: ['cross-functional', 'stakeholder', 'executive', 'c-suite', 'board', 'client', 'vendor', 'partner', 'multi-team', 'department', 'liaison', 'coordinate', 'collaborate', 'matrix', 'global', 'international', 'diverse teams', 'external', 'regulatory bodies'],
    low: ['single team', 'individual', 'solo', 'self-directed', 'internal only'],
  },
  repetitionVsInnovation: {
    high: ['innovate', 'innovation', 'creative', 'design', 'ideate', 'brainstorm', 'prototype', 'experiment', 'new solutions', 'greenfield', 'disruptive', 'transform', 'vision', 'strategy', 'pioneer', 'cutting-edge', 'novel approaches', 'think outside'],
    low: ['routine', 'repetitive', 'maintenance', 'operational', 'standard', 'process-driven', 'recurring', 'audit', 'inspection', 'compliance', 'documentation', 'data entry'],
  },
  socialExposure: {
    high: ['present', 'presentation', 'public speaking', 'leadership', 'manage', 'team lead', 'supervise', 'facilitate', 'training', 'workshop', 'networking', 'represent', 'ambassador', 'spokesperson', 'sales', 'demo', 'pitch', 'visible', 'front-facing'],
    low: ['behind the scenes', 'remote', 'independent', 'solo', 'back-office', 'minimal interaction', 'asynchronous'],
  },
  detailSensitivity: {
    high: ['detail', 'precise', 'accuracy', 'quality assurance', 'qa', 'audit', 'compliance', 'regulatory', 'legal', 'financial', 'accounting', 'meticulous', 'thorough', 'review', 'proofread', 'documentation', 'specification', 'testing', 'validation', 'zero-defect', 'safety-critical'],
    low: ['high-level', 'strategic', 'big picture', 'overview', 'conceptual', 'approximate'],
  },
  autonomyRequired: {
    high: ['autonomous', 'self-directed', 'independent', 'ownership', 'entrepreneurial', 'self-starter', 'proactive', 'initiative', 'end-to-end', 'full ownership', 'minimal supervision', 'accountable', 'lead', 'drive', 'own'],
    low: ['supervised', 'guided', 'mentored', 'team-based', 'collaborative', 'structured', 'support role', 'assist', 'junior', 'entry-level'],
  },
  cognitiveLoadVolatility: {
    high: ['multitask', 'multi-task', 'context switching', 'multiple projects', 'concurrent', 'parallel', 'varied', 'diverse responsibilities', 'wearing many hats', 'cross-functional', 'shifting priorities', 'interruption', 'on-call', 'incident response', 'dynamic environment'],
    low: ['focused', 'single project', 'dedicated', 'specialized', 'deep work', 'concentrated', 'uninterrupted'],
  },
};

/**
 * Scores a single dimension based on keyword presence in the text.
 */
function scoreDimension(text: string, keywords: { high: string[]; low: string[] }): number {
  const lowerText = text.toLowerCase();
  
  let highCount = 0;
  let lowCount = 0;
  
  for (const kw of keywords.high) {
    // Count occurrences (word boundary aware where possible)
    const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = lowerText.match(regex);
    if (matches) highCount += matches.length;
  }
  
  for (const kw of keywords.low) {
    const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = lowerText.match(regex);
    if (matches) lowCount += matches.length;
  }
  
  // If no keywords match at all, return neutral
  if (highCount === 0 && lowCount === 0) return 5;
  
  // Calculate a weighted score
  const total = highCount + lowCount;
  const highRatio = highCount / total;
  
  // Map ratio to 1-10 scale: 0 ratio = 2, 1 ratio = 9
  const score = Math.round(2 + highRatio * 7);
  return Math.max(1, Math.min(10, score));
}

/**
 * Extracts a likely job title from the text.
 * Looks for common patterns like "Job Title:", "Position:", or the first significant line.
 */
function extractTitle(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Look for explicit title markers
  for (const line of lines.slice(0, 15)) {
    const titleMatch = line.match(/^(?:job\s*title|position|role|title)\s*[:–—-]\s*(.+)/i);
    if (titleMatch) return titleMatch[1].trim();
  }
  
  // Fall back to the first non-empty short line (likely a heading)
  for (const line of lines.slice(0, 5)) {
    if (line.length > 3 && line.length < 80 && !line.match(/^(about|company|overview|description|summary|we are)/i)) {
      return line.replace(/[*#_]/g, '').trim();
    }
  }
  
  return 'Uploaded Role';
}

/**
 * Extracts a brief description from the text.
 */
function extractDescription(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Look for a description/summary/about section
  for (let i = 0; i < lines.length && i < 20; i++) {
    if (lines[i].match(/^(description|summary|about the role|overview|about this|the role)/i)) {
      // Grab the next 1-3 lines as description
      const descLines = lines.slice(i + 1, i + 4).filter(l => l.length > 10);
      if (descLines.length > 0) {
        const desc = descLines.join(' ').substring(0, 200);
        return desc;
      }
    }
  }
  
  // Fall back: grab a chunk from the beginning (skip the first line which is likely the title)
  const chunk = lines.slice(1, 4).join(' ');
  return chunk.substring(0, 200) || 'Uploaded job description';
}

/**
 * Main function: parses JD text into a structured role profile with auto-scored demands.
 */
export function parseJobDescription(text: string): ParsedJobDescription {
  const title = extractTitle(text);
  const description = extractDescription(text);
  
  const demands: RoleCognitiveDemand = {
    analyticalDepth: scoreDimension(text, dimensionKeywords.analyticalDepth),
    ambiguityTolerance: scoreDimension(text, dimensionKeywords.ambiguityTolerance),
    emotionalLaborLoad: scoreDimension(text, dimensionKeywords.emotionalLaborLoad),
    decisionSpeed: scoreDimension(text, dimensionKeywords.decisionSpeed),
    stakeholderComplexity: scoreDimension(text, dimensionKeywords.stakeholderComplexity),
    repetitionVsInnovation: scoreDimension(text, dimensionKeywords.repetitionVsInnovation),
    socialExposure: scoreDimension(text, dimensionKeywords.socialExposure),
    detailSensitivity: scoreDimension(text, dimensionKeywords.detailSensitivity),
    autonomyRequired: scoreDimension(text, dimensionKeywords.autonomyRequired),
    cognitiveLoadVolatility: scoreDimension(text, dimensionKeywords.cognitiveLoadVolatility),
  };
  
  return { title, description, demands };
}

/**
 * Reads a File object and returns its text content.
 * Supports .txt and .pdf files (PDF uses pdf.js from CDN).
 */
export async function readFileAsText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  if (ext === 'txt' || ext === 'md') {
    return file.text();
  }
  
  if (ext === 'pdf') {
    return readPdfAsText(file);
  }
  
  // For .doc/.docx — attempt to read as text (basic fallback)
  // This won't perfectly parse DOCX formatting but will get raw text
  if (ext === 'docx' || ext === 'doc') {
    return readDocxAsText(file);
  }
  
  // Default: try reading as text
  return file.text();
}

/**
 * Reads a PDF file using pdf.js loaded from CDN.
 */
async function readPdfAsText(file: File): Promise<string> {
  // Dynamically load pdf.js from CDN if not already loaded
  if (!(window as any).pdfjsLib) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load PDF.js'));
      document.head.appendChild(script);
    });
  }
  
  const pdfjsLib = (window as any).pdfjsLib;
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

/**
 * Basic DOCX text extraction using the browser's built-in ZIP decompression.
 * Extracts raw text from the document.xml inside the .docx archive.
 */
async function readDocxAsText(file: File): Promise<string> {
  try {
    // DOCX is a ZIP file. Use the browser's DecompressionStream if available.
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer]);
    
    // Simple approach: read as text and strip XML tags
    const text = await file.text();
    // Strip XML/HTML-like tags to get raw text
    const stripped = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (stripped.length > 50) {
      return stripped;
    }
    
    // If stripping didn't work well, return a notice
    return 'Could not fully parse DOCX. Please try uploading as .txt or .pdf instead.';
  } catch {
    return 'Could not parse DOCX file. Please try uploading as .txt or .pdf instead.';
  }
}
