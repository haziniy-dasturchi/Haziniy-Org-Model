import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function verifyResponsive() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({ 
    executablePath: chromePath, 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();

  const artifactDir = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\60895647-e60c-4ce3-b4da-4783c8eff654';

  // Set admin cookie
  await page.setCookie({
    name: 'haziniy_admin_session',
    value: JSON.stringify({ role: 'admin', userId: 'admin-1', timestamp: Date.now() }),
    domain: 'localhost',
    path: '/'
  });

  const viewports = [
    { name: 'mobile_375', width: 375, height: 812 },
    { name: 'tablet_768', width: 768, height: 1024 },
    { name: 'desktop_1280', width: 1280, height: 900 }
  ];

  const routes = [
    { path: '/', label: 'home_org_ai' },
    { path: '/admin', label: 'admin_no_moliya' }
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1.5 });
    
    for (const r of routes) {
      console.log(`Testing ${r.label} on ${vp.name}...`);
      await page.goto(`http://localhost:3000${r.path}`, { waitUntil: 'networkidle0', timeout: 30000 });
      
      const shotPath = path.join(artifactDir, `${r.label}_${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`  Screenshot saved: ${shotPath}`);
    }
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

verifyResponsive().catch(console.error);

