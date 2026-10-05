import puppeteer from 'puppeteer-core';
import path from 'path';

const artifactDir = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\b41a74b2-eb1c-4b2b-9a5d-a2c5d53b7cab';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1050, deviceScaleFactor: 1.5 });

  console.log('1. Navigating to homepage...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Scroll to org chart section
  await page.evaluate(() => {
    const el = document.getElementById('org-chart-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 800));

  // Capture Screenshot 1: "Umumiy" view
  await page.screenshot({
    path: path.join(artifactDir, 'screenshot_1_umumiy_view.png'),
    fullPage: false
  });
  console.log('✓ Captured screenshot_1_umumiy_view.png');

  // Select "Xazina filial" in branch-selector
  console.log('2. Selecting Xazina filial...');
  await page.evaluate(() => {
    const sel = document.getElementById('branch-selector');
    if (sel) {
      const opt = Array.from(sel.options).find(o => o.text.includes('Xazina'));
      if (opt) {
        sel.value = opt.value;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  // Capture Screenshot 2: Filtered view ("Xazina filial" with vacant slots)
  await page.screenshot({
    path: path.join(artifactDir, 'screenshot_2_xazina_filial_filtered.png'),
    fullPage: false
  });
  console.log('✓ Captured screenshot_2_xazina_filial_filtered.png');

  // Select "Asosiy filial" in branch-selector
  console.log('3. Selecting Asosiy filial...');
  await page.evaluate(() => {
    const sel = document.getElementById('branch-selector');
    if (sel) {
      const opt = Array.from(sel.options).find(o => o.text.includes('Asosiy'));
      if (opt) {
        sel.value = opt.value;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  // Capture Screenshot 2b: Asosiy filial
  await page.screenshot({
    path: path.join(artifactDir, 'screenshot_2b_asosiy_filial_filtered.png'),
    fullPage: false
  });
  console.log('✓ Captured screenshot_2b_asosiy_filial_filtered.png');

  // 4. Employee Profile with Branch Badge
  console.log('4. Navigating to employee profile...');
  await page.goto('http://localhost:3000/xodim/asoschi-test-emp', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(artifactDir, 'screenshot_3_employee_profile_branch_badge.png'),
    fullPage: false
  });
  console.log('✓ Captured screenshot_3_employee_profile_branch_badge.png');

  // 5. Admin Panel - Employee Modal with Branch Dropdown
  console.log('5. Navigating to admin panel...');
  await page.setCookie({
    name: 'haziniy_admin_session',
    value: encodeURIComponent(JSON.stringify({ role: 'admin', id: 'admin-muhammad-said-hasan' })),
    domain: 'localhost',
    path: '/'
  });

  await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1500));

  // Click on "Xodimlar" tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const empTab = tabs.find(t => t.textContent && t.textContent.includes('Xodimlar'));
    if (empTab) empTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click "Xodim qo'shish" button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const addBtn = buttons.find(b => b.textContent && b.textContent.includes('Xodim qo\'shish'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({
    path: path.join(artifactDir, 'screenshot_4_admin_employee_modal.png'),
    fullPage: false
  });
  console.log('✓ Captured screenshot_4_admin_employee_modal.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

main().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
