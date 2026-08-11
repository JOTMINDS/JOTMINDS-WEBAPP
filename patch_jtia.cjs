const fs = require('fs');
let code = fs.readFileSync('src/app/utils/jtiaScoring.ts', 'utf8');

const mockDataBlock = `  if (!reports || reports.length === 0) {
    // Generate realistic simulated school cohort data for demonstration
    const simulatedReports: JTIAReportData[] = [
      calculateJTIAScore(Array(120).fill(5)),
      calculateJTIAScore(Array(120).fill(4)),
      calculateJTIAScore(Array(120).fill(4)),
      calculateJTIAScore(Array(120).fill(3)),
      calculateJTIAScore(Array(120).fill(4))
    ];
    reports = simulatedReports;
  }`;

const replacementBlock = `  if (!reports || reports.length === 0) {
    return {
      overallSchoolIntelligence: 0,
      domainAverages: { cognitive: 0, instructional: 0, leadership: 0, relationship: 0, professional: 0 },
      topStrengths: [],
      pdPriorities: [],
      growthPatterns: {
        highSynergyDomains: [],
        collaborativeOpportunities: [],
        workforceReadiness: 0
      }
    };
  }`;

if (code.includes(mockDataBlock)) {
  code = code.replace(mockDataBlock, replacementBlock);
  fs.writeFileSync('src/app/utils/jtiaScoring.ts', code);
  console.log("Patched jtiaScoring.ts mock data");
} else {
  console.log("Could not find mock data block in jtiaScoring.ts");
}
