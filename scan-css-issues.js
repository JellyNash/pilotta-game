#!/usr/bin/env node

/**
 * CSS Issue Scanner for Pilotta Game
 * Scans CSS files for common issues and problematic patterns
 */

const fs = require('fs').promises;
const path = require('path');

class CSSIssueScanner {
  constructor() {
    this.issues = [];
    this.cssFiles = [];
  }

  async scanProject(projectPath) {
    console.log('Scanning CSS files for issues...\n');
    
    // Find all CSS files
    await this.findCSSFiles(projectPath);
    console.log(`Found ${this.cssFiles.length} CSS files\n`);

    // Scan each file
    for (const file of this.cssFiles) {
      await this.scanFile(file);
    }

    // Report results
    this.generateReport();
  }

  async findCSSFiles(dir, fileList = []) {
    const files = await fs.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist')) {
        await this.findCSSFiles(filePath, fileList);
      } else if (file.endsWith('.css')) {
        this.cssFiles.push(filePath);
      }
    }
  }

  async scanFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const issues = [];

    // Check for !important usage
    const importantMatches = content.match(/!important/g);
    if (importantMatches && importantMatches.length > 0) {
      issues.push({
        type: 'important',
        count: importantMatches.length,
        severity: 'warning',
        message: `Found ${importantMatches.length} !important declarations`
      });
    }

    // Check for absolute positioning without explicit dimensions
    const absoluteRegex = /position:\s*absolute[^}]*}/gs;
    const absoluteBlocks = content.match(absoluteRegex) || [];
    absoluteBlocks.forEach(block => {
      if (!block.includes('width') || !block.includes('height')) {
        const selector = this.extractSelector(content, block);
        issues.push({
          type: 'absolute-positioning',
          severity: 'warning',
          selector,
          message: 'Absolute positioning without explicit dimensions'
        });
      }
    });

    // Check for z-index values
    const zIndexRegex = /z-index:\s*(\d+)/g;
    let zIndexMatch;
    const zIndexValues = [];
    while ((zIndexMatch = zIndexRegex.exec(content)) !== null) {
      const value = parseInt(zIndexMatch[1]);
      zIndexValues.push(value);
      if (value > 1000) {
        issues.push({
          type: 'z-index',
          severity: 'warning',
          value,
          message: `Very high z-index value: ${value}`
        });
      }
    }

    // Check for fixed positioning
    const fixedCount = (content.match(/position:\s*fixed/g) || []).length;
    if (fixedCount > 0) {
      issues.push({
        type: 'fixed-positioning',
        count: fixedCount,
        severity: 'info',
        message: `${fixedCount} fixed position elements`
      });
    }

    // Check for transform without will-change
    const transformRegex = /transform:[^;}]+/g;
    const transformMatches = content.match(transformRegex) || [];
    transformMatches.forEach(match => {
      const blockStart = content.lastIndexOf('{', content.indexOf(match));
      const blockEnd = content.indexOf('}', content.indexOf(match));
      const block = content.substring(blockStart, blockEnd);
      
      if (!block.includes('will-change')) {
        const selector = this.extractSelector(content, block);
        issues.push({
          type: 'performance',
          severity: 'info',
          selector,
          message: 'Transform without will-change property'
        });
      }
    });

    // Check for undefined CSS variables
    const varRegex = /var\((--[a-zA-Z0-9-]+)\)/g;
    let varMatch;
    const usedVars = new Set();
    while ((varMatch = varRegex.exec(content)) !== null) {
      usedVars.add(varMatch[1]);
    }

    // Check for duplicate selectors
    const selectorRegex = /^([^{]+)\s*{/gm;
    const selectors = new Map();
    let selectorMatch;
    while ((selectorMatch = selectorRegex.exec(content)) !== null) {
      const selector = selectorMatch[1].trim();
      if (selectors.has(selector)) {
        issues.push({
          type: 'duplicate-selector',
          severity: 'warning',
          selector,
          message: 'Duplicate selector found'
        });
      } else {
        selectors.set(selector, true);
      }
    }

    // Check for overly specific selectors
    selectors.forEach((_, selector) => {
      const parts = selector.split(' ');
      if (parts.length > 4) {
        issues.push({
          type: 'specificity',
          severity: 'info',
          selector,
          message: `Overly specific selector (${parts.length} parts)`
        });
      }
    });

    // Check for pixel values that should be rem/em
    const pixelRegex = /(\d+)px/g;
    let pixelMatch;
    while ((pixelMatch = pixelRegex.exec(content)) !== null) {
      const value = parseInt(pixelMatch[1]);
      const context = content.substring(
        Math.max(0, pixelMatch.index - 50),
        Math.min(content.length, pixelMatch.index + 50)
      );
      
      // Check if it's used for typography
      if (context.includes('font-size') || context.includes('line-height')) {
        issues.push({
          type: 'units',
          severity: 'info',
          value: `${value}px`,
          context: 'typography',
          message: 'Consider using rem/em for typography'
        });
      }
    }

    if (issues.length > 0) {
      this.issues.push({
        file: fileName,
        path: filePath,
        issues
      });
    }
  }

  extractSelector(content, block) {
    const blockStart = content.lastIndexOf('{', content.indexOf(block));
    const selectorStart = content.lastIndexOf('\n', blockStart) + 1;
    return content.substring(selectorStart, blockStart).trim();
  }

  generateReport() {
    console.log('=== CSS Issue Report ===\n');

    if (this.issues.length === 0) {
      console.log('✅ No issues found!');
      return;
    }

    // Summary by issue type
    const summary = {};
    this.issues.forEach(file => {
      file.issues.forEach(issue => {
        if (!summary[issue.type]) {
          summary[issue.type] = 0;
        }
        summary[issue.type]++;
      });
    });

    console.log('Summary:');
    Object.entries(summary).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} occurrences`);
    });
    console.log('');

    // Detailed report
    console.log('Detailed Issues:\n');
    this.issues.forEach(file => {
      console.log(`📄 ${file.file}`);
      
      // Group by severity
      const bySeverity = {
        error: [],
        warning: [],
        info: []
      };
      
      file.issues.forEach(issue => {
        bySeverity[issue.severity].push(issue);
      });

      // Display errors first, then warnings, then info
      ['error', 'warning', 'info'].forEach(severity => {
        if (bySeverity[severity].length > 0) {
          const icon = severity === 'error' ? '❌' : severity === 'warning' ? '⚠️' : 'ℹ️';
          bySeverity[severity].forEach(issue => {
            console.log(`  ${icon} ${issue.message}`);
            if (issue.selector) {
              console.log(`     Selector: ${issue.selector}`);
            }
          });
        }
      });
      console.log('');
    });

    // Recommendations
    console.log('Recommendations:');
    if (summary['important'] > 0) {
      console.log('  - Review !important usage and replace with proper specificity');
    }
    if (summary['z-index'] > 0) {
      console.log('  - Standardize z-index values using CSS variables');
    }
    if (summary['performance'] > 0) {
      console.log('  - Add will-change property for animated elements');
    }
    if (summary['units'] > 0) {
      console.log('  - Consider using relative units (rem/em) for better scalability');
    }
  }
}

// Run the scanner
const scanner = new CSSIssueScanner();
const projectPath = path.join(__dirname, 'src');

scanner.scanProject(projectPath).catch(console.error);
