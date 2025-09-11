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

// Function to fix metadata viewport issues
function fixMetadataViewport(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if file has viewport in metadata export
    if (content.includes('viewport') && content.includes('export const metadata')) {
      console.log(`Fixing viewport in: ${filePath}`);

      // Extract viewport value
      const viewportMatch = content.match(/viewport:\s*["']([^"']+)["']/);
      const viewportValue = viewportMatch ? viewportMatch[1] : 'width=device-width, initial-scale=1';

      // Remove viewport from metadata
      content = content.replace(/,\s*viewport:\s*["'][^"']*["']/g, '');

      // Add viewport export
      if (!content.includes('export const viewport')) {
        // Find the end of the file and add viewport export
        content += `\n\nexport const viewport = "${viewportValue}"\n`;
      }

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main execution
const srcDir = path.join(__dirname, 'src');
console.log('🔍 Scanning for page.tsx files...');

const pageFiles = findPageFiles(srcDir);
console.log(`📁 Found ${pageFiles.length} page files`);

let fixedCount = 0;
pageFiles.forEach(filePath => {
  const originalContent = fs.readFileSync(filePath, 'utf8');
  fixMetadataViewport(filePath);

  const newContent = fs.readFileSync(filePath, 'utf8');
  if (originalContent !== newContent) {
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files with viewport metadata issues`);
console.log('✅ Metadata viewport fix complete!');
