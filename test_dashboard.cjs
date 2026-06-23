const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to local dev server...");
  await page.goto('http://localhost:5173/signin', { waitUntil: 'networkidle' });

  console.log("Filling login form...");
  await page.fill('input[type="email"]', 'admin_1781776954893@jotminds.demo');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  console.log("Waiting for dashboard to load...");
  await page.waitForTimeout(3000); // Wait 3 seconds

  // Try to find the members counts
  const pageText = await page.evaluate(() => document.body.innerText);
  console.log("--- PAGE TEXT SNIPPET ---");
  console.log(pageText.substring(0, 1000));
  
  if (pageText.includes('Approved Members') || pageText.includes('Teachers')) {
    console.log("\nFOUND DASHBOARD CONTENT!");
    const lines = pageText.split('\n');
    const memberLines = lines.filter(l => l.includes('Members') || l.includes('Teachers') || l.includes('Students') || /\d+/.test(l));
    console.log(memberLines.slice(0, 20).join('\n'));
  } else {
    console.log("\nDASHBOARD NOT FOUND. The user might be seeing something else.");
  }

  await browser.close();
})();
