import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function processLogos() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage();

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const files = ['haziniy-07.png', 'haziniy-08.png', 'haziniy-11.png', 'haziniy-13.png', 'haziniy-14.png', 'haziniy---11.png', 'haziniy-01.png', 'haziniy-02.png'];
  
  for (const f of files) {
    const fPath = path.join(process.cwd(), 'Haziniy', 'Logo', 'PNG', f);
    if (!fs.existsSync(fPath)) continue;
    const dataUrl = 'data:image/png;base64,' + fs.readFileSync(fPath).toString('base64');
    
    const info = await page.evaluate(async (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          
          let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              const a = data[(y * canvas.width + x) * 4 + 3];
              if (a > 20) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }
          resolve({ width: canvas.width, height: canvas.height, minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY });
        };
        img.src = url;
      });
    }, dataUrl);
    
    console.log(f, info);
  }

  await browser.close();
}

processLogos().catch(console.error);
