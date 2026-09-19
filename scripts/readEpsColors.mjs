import fs from 'fs';
import path from 'path';

const epsPath = path.join(process.cwd(), 'Haziniy', 'Logo', 'Vector', 'Haziniy logo.eps');
const buffer = fs.readFileSync(epsPath);
const text = buffer.toString('latin1');

console.log('Total EPS size:', buffer.length);

// Extract color definitions and hexes
const matches = [];

// Look for RGB/CMYK in Illustrator Postscript blocks
const lines = text.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (
    line.includes('Color') ||
    line.includes('color') ||
    line.includes('RGB') ||
    line.includes('CMYK') ||
    line.includes('%%DocumentCustomColors') ||
    line.includes('%%DocumentProcessColors') ||
    line.includes('rg') ||
    line.includes('k') ||
    line.includes('g')
  ) {
    matches.push(line);
  }
}

console.log('=== MATCHING EPS COLOR LINES (Sample 50) ===');
console.log(matches.slice(0, 50).join('\n'));
