#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find all page.tsx files
function findPageFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findPageFiles(fullPath, files);
    } else if (item === 'page.tsx') {
      files.push(fullPath);
    }
  }

  return files;
}

// Function to fix viewport metadata issues
function fixViewportMetadata(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has viewport export
    if (content.includes('export const viewport')) {
      return false;
    }

    // Check if file has viewport in metadata export
    if (content.includes('export const metadata') && content.includes('viewport')) {
      console.log(`Fixing viewport in: ${filePath}`);

      // Extract viewport value
      const viewportMatch = content.match(/viewport:\s*["']([^"']+)["']/);
      const viewportValue = viewportMatch ? viewportMatch[1] : 'width=device-width, initial-scale=1';

      // Remove viewport from metadata
      content = content.replace(/,\s*viewport:\s*["'][^"']*["']/g, '');

      // Add viewport export
      content += `\n\nexport const viewport = "${viewportValue}"\n`;

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
const srcDir = path.join(__dirname, 'src');
console.log('🔍 Scanning for page.tsx files...');

const pageFiles = findPageFiles(srcDir);
console.log(`📁 Found ${pageFiles.length} page files`);

let fixedCount = 0;
pageFiles.forEach(filePath => {
  if (fixViewportMetadata(filePath)) {
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files with viewport metadata issues`);
console.log('✅ Viewport metadata fix complete!');
