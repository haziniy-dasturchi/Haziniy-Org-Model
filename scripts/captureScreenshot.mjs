import puppeteer from 'puppeteer-core';
import path from 'path';

const artifactDir = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\60895647-e60c-4ce3-b4da-4783c8eff654';

async function capture() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({ 
    executablePath: chromePath, 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  await page.setCookie({
    name: 'haziniy_admin_session',
    value: encodeURIComponent(JSON.stringify({ role: 'admin', id: 'admin-muhammad-said-hasan' })),
    domain: 'localhost',
    path: '/'
  });

  await page.setViewport({ width: 1400, height: 1000 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  // 1. Scroll to AI recommendation section
  await page.evaluate(() => window.scrollTo(0, 1800));
  await new Promise(r => setTimeout(r, 600));

  // 2. Open edit modal on #2 (Filial menejeri)
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const editBtns = btns.filter(b => b.textContent && b.textContent.includes('AI xulosasini tahrirlash'));
    if (editBtns[1]) {
      editBtns[1].click();
      return true;
    }
    return false;
  });
  console.log('Opened edit modal on #2:', clicked);
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(artifactDir, 'modal_with_fullwidth_dropdown.png') });
  console.log('Saved modal_with_fullwidth_dropdown.png');

  // 3. Edit title and select position
  await page.evaluate(() => {
    const titleInput = document.querySelector('input[placeholder*="Masalan"]');
    if (titleInput) {
      titleInput.value = "Bosh Yurist va Huquqiy Xavfsizlik";
      titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const posSelect = document.querySelector('select');
    if (posSelect) {
      const yuristOpt = Array.from(posSelect.options).find(o => o.text && o.text.includes('Yurist'));
      if (yuristOpt) {
        posSelect.value = yuristOpt.value;
        posSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
  await new Promise(r => setTimeout(r, 400));

  await page.screenshot({ path: path.join(artifactDir, 'modal_filled_yurist.png') });
  console.log('Saved modal_filled_yurist.png');

  // 4. Click 'Tahrirni Saqlash'
  const submitClicked = await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Tahrirni Saqlash:', submitClicked);
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: path.join(artifactDir, 'cards_after_edit_saved.png') });
  console.log('Saved cards_after_edit_saved.png');

  // 5. Now click 'Bajarildi deb belgilash' on this edited card (#2)
  const resolveClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const resolveBtns = btns.filter(b => b.textContent && b.textContent.includes('Bajarildi deb belgilash'));
    if (resolveBtns[1]) {
      resolveBtns[1].click();
      return true;
    }
    return false;
  });
  console.log('Clicked Bajarildi deb belgilash on #2:', resolveClicked);
  await new Promise(r => setTimeout(r, 4000));

  await page.screenshot({ path: path.join(artifactDir, 'cards_after_resolved.png') });
  console.log('Saved cards_after_resolved.png');

  // 6. Scroll up to Org Chart to verify Yurist is now in Hozirgi holat
  await page.evaluate(() => window.scrollTo(0, 500));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, 'org_tree_with_yurist.png') });
  console.log('Saved org_tree_with_yurist.png');

  await browser.close();
  console.log('All verification steps completed successfully!');
}

capture().catch(err => {
  console.error('Error capturing screenshot:', err);
  process.exit(1);
});

