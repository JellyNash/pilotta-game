const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Test resolutions
const resolutions = [
  { width: 1280, height: 720, name: '1280px' },
  { width: 1600, height: 900, name: '1600px' },
  { width: 1920, height: 1080, name: '1920px' },
  { width: 2560, height: 1440, name: '2560px' }
];

// Tolerance for center deviation (in pixels)
const CENTER_TOLERANCE = 2;

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = [];

  for (const resolution of resolutions) {
    const page = await browser.newPage();
    await page.setViewport({
      width: resolution.width,
      height: resolution.height
    });

    // Navigate to the app
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle0'
    });

    // Wait for game to load
    await page.waitForSelector('.game-table', { timeout: 10000 });

    // Click start game button if present
    const startButton = await page.$('button:has-text("Start Game")');
    if (startButton) {
      await startButton.click();
      // Wait for game to initialize
      await page.waitForTimeout(2000);
    }

    // Take screenshot
    const screenshotPath = path.join(__dirname, 'screenshots', `layout-${resolution.name}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: false
    });

    // Get center circle position
    const centerCircle = await page.$eval('.center-circle', el => {
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    });

    // Get trick area position (played cards)
    const trickArea = await page.$eval('.trick-area-centered', el => {
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    });

    // Calculate viewport center
    const viewportCenter = {
      x: resolution.width / 2,
      y: resolution.height / 2
    };

    // Calculate deviations
    const circleDeviation = {
      x: Math.abs(centerCircle.x - viewportCenter.x),
      y: Math.abs(centerCircle.y - viewportCenter.y)
    };

    const trickDeviation = {
      x: Math.abs(trickArea.x - viewportCenter.x),
      y: Math.abs(trickArea.y - viewportCenter.y)
    };

    // Get player positions
    const playerPositions = await page.evaluate(() => {
      const positions = {};
      const seats = ['north', 'south', 'east', 'west'];
      
      seats.forEach(seat => {
        const element = document.querySelector(`.player-seat.${seat}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          positions[seat] = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
        }
      });
      
      return positions;
    });

    // Calculate distances from center for each player
    const playerDistances = {};
    Object.entries(playerPositions).forEach(([seat, pos]) => {
      playerDistances[seat] = Math.sqrt(
        Math.pow(pos.x - viewportCenter.x, 2) + 
        Math.pow(pos.y - viewportCenter.y, 2)
      );
    });

    results.push({
      resolution: resolution.name,
      viewportCenter,
      centerCircle,
      trickArea,
      circleDeviation,
      trickDeviation,
      playerPositions,
      playerDistances,
      passed: circleDeviation.x <= CENTER_TOLERANCE && 
              circleDeviation.y <= CENTER_TOLERANCE &&
              trickDeviation.x <= CENTER_TOLERANCE && 
              trickDeviation.y <= CENTER_TOLERANCE
    });

    await page.close();
  }

  await browser.close();
  return results;
}

async function runTests() {
  console.log('Starting visual regression tests...\n');
  
  try {
    // Create screenshots directory if it doesn't exist
    await fs.mkdir(path.join(__dirname, 'screenshots'), { recursive: true });
    
    const results = await captureScreenshots();
    
    // Print results
    console.log('Test Results:');
    console.log('=============\n');
    
    let allPassed = true;
    
    results.forEach(result => {
      console.log(`Resolution: ${result.resolution}`);
      console.log(`Viewport Center: (${result.viewportCenter.x}, ${result.viewportCenter.y})`);
      console.log(`Center Circle: (${result.centerCircle.x.toFixed(1)}, ${result.centerCircle.y.toFixed(1)})`);
      console.log(`Circle Deviation: x=${result.circleDeviation.x.toFixed(1)}px, y=${result.circleDeviation.y.toFixed(1)}px`);
      console.log(`Trick Area: (${result.trickArea.x.toFixed(1)}, ${result.trickArea.y.toFixed(1)})`);
      console.log(`Trick Deviation: x=${result.trickDeviation.x.toFixed(1)}px, y=${result.trickDeviation.y.toFixed(1)}px`);
      
      // Check player distances consistency
      const distances = Object.values(result.playerDistances);
      const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
      const maxDeviation = Math.max(...distances.map(d => Math.abs(d - avgDistance)));
      
      console.log(`Player Distances from Center:`);
      Object.entries(result.playerDistances).forEach(([seat, distance]) => {
        console.log(`  ${seat}: ${distance.toFixed(1)}px`);
      });
      console.log(`Max player distance deviation: ${maxDeviation.toFixed(1)}px`);
      
      if (result.passed) {
        console.log('✅ PASSED\n');
      } else {
        console.log('❌ FAILED - Center deviation exceeds tolerance\n');
        allPassed = false;
      }
    });
    
    // Save results to JSON
    await fs.writeFile(
      path.join(__dirname, 'visual-regression-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    if (allPassed) {
      console.log('✅ All tests passed!');
      process.exit(0);
    } else {
      console.log('❌ Some tests failed!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();