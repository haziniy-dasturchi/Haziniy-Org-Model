import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function parsePNG(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.toString('ascii', 1, 4) !== 'PNG') {
    throw new Error('Not a PNG');
  }

  let offset = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idatChunks = [];
  let palette = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'PLTE') {
      for (let i = 0; i < data.length; i += 3) {
        palette.push([data[i], data[i+1], data[i+2]]);
      }
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  const compressed = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressed);

  return { width, height, bitDepth, colorType, palette, decompressed };
}

function analyzeColors(filePath) {
  const { width, height, bitDepth, colorType, palette, decompressed } = parsePNG(filePath);
  const colorCounts = {};

  if (colorType === 6) { // RGBA (8-bit)
    const bytesPerPixel = 4;
    const stride = width * bytesPerPixel + 1;
    for (let y = 0; y < height; y++) {
      const rowOffset = y * stride + 1; // skip filter byte
      for (let x = 0; x < width; x++) {
        const px = rowOffset + x * bytesPerPixel;
        const r = decompressed[px];
        const g = decompressed[px + 1];
        const b = decompressed[px + 2];
        const a = decompressed[px + 3];
        if (a > 128) {
          const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
          colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }
      }
    }
  } else if (colorType === 2) { // RGB (8-bit)
    const bytesPerPixel = 3;
    const stride = width * bytesPerPixel + 1;
    for (let y = 0; y < height; y++) {
      const rowOffset = y * stride + 1;
      for (let x = 0; x < width; x++) {
        const px = rowOffset + x * bytesPerPixel;
        const r = decompressed[px];
        const g = decompressed[px + 1];
        const b = decompressed[px + 2];
        const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }
    }
  }

  const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  return { width, height, sorted };
}

const dir = path.join(process.cwd(), 'Haziniy', 'Logo', 'PNG');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

console.log('=== EXACT PIXEL COLOR EXTRACTION FROM HAZINIY LOGOS ===');
for (const f of files) {
  try {
    const res = analyzeColors(path.join(dir, f));
    console.log(`\nFile: ${f} (${res.width}x${res.height})`);
    for (const [hex, count] of res.sorted) {
      console.log(`  ${hex} : ${count} px`);
    }
  } catch (e) {
    console.log(`Error parsing ${f}:`, e.message);
  }
}
