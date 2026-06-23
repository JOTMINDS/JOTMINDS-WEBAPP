const fs = require('fs');
const path = 'src/app/utils/storage.ts';
let content = fs.readFileSync(path, 'utf8');

// Add imports
if (!content.includes('JHSResults')) {
  content = content.replace("import { Assessment } from './teachingStyleScoring';", "import { Assessment } from './teachingStyleScoring';\nimport { JHSResults } from './jhsScoring';\nimport { SHSResults } from './shsScoring';\nimport { AdultResults } from './adultScoring';");
}

// Replace JHS any
content = content.replace(/export function getJHSResults\(userId: string\): any\[\] \{/g, 'export function getJHSResults(userId: string): JHSResults[] {');
content = content.replace(/safeParse<any\[\]>\(STORAGE_KEYS\.JHS_RESULTS, \[\]\)/g, 'safeParse<JHSResults[]>(STORAGE_KEYS.JHS_RESULTS, [])');
content = content.replace(/\(r: any\) => r\.userId === userId/g, '(r) => r.userId === userId');
content = content.replace(/export function saveJHSResult\(result: any\) \{/g, 'export function saveJHSResult(result: JHSResults) {');
content = content.replace(/\(r: any\) => r\.id === result\.id/g, '(r) => r.id === result.id');

// Replace SHS any
content = content.replace(/export function getSHSResults\(userId: string\): any\[\] \{/g, 'export function getSHSResults(userId: string): SHSResults[] {');
content = content.replace(/safeParse<any\[\]>\(STORAGE_KEYS\.SHS_RESULTS, \[\]\)/g, 'safeParse<SHSResults[]>(STORAGE_KEYS.SHS_RESULTS, [])');
content = content.replace(/export function saveSHSResult\(result: any\) \{/g, 'export function saveSHSResult(result: SHSResults) {');

// Replace Adult any
content = content.replace(/export function getAdultResults\(userId: string\): any\[\] \{/g, 'export function getAdultResults(userId: string): AdultResults[] {');
content = content.replace(/safeParse<any\[\]>\(STORAGE_KEYS\.ADULT_RESULTS, \[\]\)/g, 'safeParse<AdultResults[]>(STORAGE_KEYS.ADULT_RESULTS, [])');
content = content.replace(/export function saveAdultResult\(result: any\) \{/g, 'export function saveAdultResult(result: AdultResults) {');

fs.writeFileSync(path, content);
