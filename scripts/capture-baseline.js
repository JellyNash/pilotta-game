#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Required breakpoints as per instructions
const breakpoints = [
  { name: 'iphone-se', width: 320, height: 568 },
  { name: 'iphone-8', width: 375, height: 667 },
  { name: 'ipad-portrait', width: 768, height: 1024 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'desktop-fhd', width: 1920, height: 1080 },
  { name: '4k-desktop', width: 3840, height: 2160 }
];

async function captureBaseline() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  const baselineDir = path.join(__dirname, '../test-results/baseline');
  if (!fs.existsSync(baselineDir)) {
    fs.mkdirSync(baselineDir, { recursive: true });
  }

  for (const { name, width, height } of breakpoints) {
    console.log(`Capturing baseline for ${name} (${width}x${height})`);
    
    const page = await context.newPage();
    await page.setViewportSize({ width, height });
    
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      
      // Wait for page to load and find Start Game button
      await page.waitForTimeout(2000); // Give React time to mount
      
      // Click Start Game button
      await page.click('button:has-text("Start Game")');
      
      // Wait for game table to appear
      await page.waitForSelector('.game-table-grid', { state: 'visible', timeout: 10000 });
      
      // Wait for animations to settle
      await page.waitForTimeout(1000);
      
      // Take screenshot
      await page.screenshot({
        path: path.join(baselineDir, `game-${name}.png`),
        fullPage: false,
        animations: 'disabled'
      });
      
      console.log(`✓ Captured ${name}`);
    } catch (error) {
      console.error(`✗ Failed to capture ${name}:`, error.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  
  // Generate baseline metadata
  const metadata = {
    date: new Date().toISOString(),
    commit: process.env.COMMIT_HASH || 'unknown',
    breakpoints: breakpoints,
    capturedFiles: fs.readdirSync(baselineDir).filter(f => f.endsWith('.png'))
  };
  
  fs.writeFileSync(
    path.join(baselineDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log('\nBaseline capture complete!');
  console.log(`Files saved to: ${baselineDir}`);
}

// Run the capture
captureBaseline().catch(console.error);