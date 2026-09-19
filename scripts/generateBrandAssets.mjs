import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function generateBrandAssets() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage();

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  // Function to crop transparent canvas to exact bounding box with optional padding
  async function cropAndSave(sourceFile, targetFile, targetWidth, targetHeight, bg = null) {
    const fPath = path.join(process.cwd(), 'Haziniy', 'Logo', 'PNG', sourceFile);
    const dataUrl = 'data:image/png;base64,' + fs.readFileSync(fPath).toString('base64');

    const base64Data = await page.evaluate(async (url, tw, th, bgColor) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

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

          const contentW = maxX - minX;
          const contentH = maxY - minY;

          // Target canvas
          const outCanvas = document.createElement('canvas');
          outCanvas.width = tw;
          outCanvas.height = th;
          const outCtx = outCanvas.getContext('2d');
          
          if (bgColor) {
            outCtx.fillStyle = bgColor;
            outCtx.fillRect(0, 0, tw, th);
          }

          // Fit contentW/contentH into tw/th with margin
          const padding = 4;
          const scale = Math.min((tw - padding * 2) / contentW, (th - padding * 2) / contentH);
          const drawW = contentW * scale;
          const drawH = contentH * scale;
          const drawX = (tw - drawW) / 2;
          const drawY = (th - drawH) / 2;

          outCtx.drawImage(img, minX, minY, contentW, contentH, drawX, drawY, drawW, drawH);
          resolve(outCanvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, ''));
        };
        img.src = url;
      });
    }, dataUrl, targetWidth, targetHeight, bg);

    fs.writeFileSync(path.join(publicDir, targetFile), Buffer.from(base64Data, 'base64'));
    console.log('Saved:', targetFile, targetWidth + 'x' + targetHeight);
  }

  // Generate:
  // 1. Navbar horizontal logo: haziniy-logo.png
  await cropAndSave('haziniy-14.png', 'haziniy-logo.png', 400, 140);
  
  // 2. Square icon for favicon and app: haziniy-icon.png
  await cropAndSave('haziniy-13.png', 'haziniy-icon.png', 256, 256);
  await cropAndSave('haziniy---11.png', 'haziniy-emblem.png', 256, 256);
  await cropAndSave('haziniy-13.png', 'favicon.png', 64, 64);
  await cropAndSave('haziniy-13.png', 'favicon.ico', 64, 64);

  // Let's also check haziniy-18 and 19
  for (const f of ['haziniy-14.png', 'haziniy-18.png', 'haziniy-19.png', 'haziniy-01.png']) {
    const fPath = path.join(process.cwd(), 'Haziniy', 'Logo', 'PNG', f);
    if (fs.existsSync(fPath)) {
      const dataUrl = 'data:image/png;base64,' + fs.readFileSync(fPath).toString('base64');
      const colors = await page.evaluate(async (url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const counts = {};
            for (let i = 0; i < data.length; i += 4) {
              if (data[i+3] > 128) {
                const hex = '#' + [data[i], data[i+1], data[i+2]].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
                counts[hex] = (counts[hex] || 0) + 1;
              }
            }
            resolve(Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 4));
          };
          img.src = url;
        });
      }, dataUrl);
      console.log('Colors in', f, colors);
    }
  }

  await browser.close();
}

generateBrandAssets().catch(console.error);
