#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const EXCLUDE_FILES = ['tokens.css', 'tokens-generated.css'];
const OUTPUT_CSV = path.join(__dirname, '../docs/reports/tokens-usage-audit.csv');

// Patterns to find
const PATTERNS = {
  // Raw numeric values with units (excluding 0 without unit)
  numericValues: /(?<!var\([^)]*|calc\([^)]*|--[a-z-]+:\s*)(-?\d*\.?\d+)(px|rem|em|%|vh|vw|dvh|dvw|ch|ex|vmin|vmax)(?![^(]*\))/g,
  
  // Hardcoded clamp() outside of CSS variable definitions
  hardcodedClamp: /(?<!--[a-z-]+:\s*)clamp\([^)]+\)/g,
  
  // Raw z-index values (not in var())
  rawZIndex: /z-index:\s*(?!var\()(-?\d+)/g,
  
  // Fixed dimensions in specific properties
  fixedDimensions: /(width|height|top|left|right|bottom|margin|padding|gap|font-size|line-height|border-radius|border-width):\s*(?!var\(|0\s|inherit|auto|unset|initial)([^;]+)/g
};

// Special exclusions
const isExcluded = (property, value, context) => {
  // Exclude 0 without unit
  if (value === '0') return true;
  
  // Exclude percentages in opacity, transforms, gradients
  if (value.endsWith('%')) {
    if (context.includes('opacity') || 
        context.includes('transform') || 
        context.includes('gradient') ||
        context.includes('rgba') ||
        context.includes('hsl')) {
      return true;
    }
  }
  
  // Exclude line-height unitless values
  if (property === 'line-height' && !value.match(/px|rem|em|%/)) {
    return true;
  }
  
  // Exclude font-weight numeric values
  if (property === 'font-weight') {
    return true;
  }
  
  // Exclude stroke-width in SVG context
  if (property === 'stroke-width' && context.includes('svg')) {
    return true;
  }
  
  // Exclude fr units and repeat counts in grid
  if (context.includes('grid-template') && (value.includes('fr') || value.includes('repeat'))) {
    return true;
  }
  
  return false;
};

// Parse CSS file and find magic numbers
const parseFile = async (filePath) => {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  const findings = [];
  
  // Split by lines for line number tracking
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Skip comments
    if (line.trim().startsWith('/*') || line.trim().startsWith('*') || line.trim().startsWith('//')) {
      return;
    }
    
    // Check for numeric values
    let match;
    while ((match = PATTERNS.numericValues.exec(line)) !== null) {
      const [fullMatch, number, unit] = match;
      const value = number + unit;
      
      // Extract property name
      const propertyMatch = line.substring(0, match.index).match(/([a-z-]+):\s*$/);
      const property = propertyMatch ? propertyMatch[1] : 'unknown';
      
      if (!isExcluded(property, value, line)) {
        findings.push({
          file: relativePath,
          line: lineNumber,
          property,
          value,
          context: line.trim(),
          suggestion: suggestToken(property, value)
        });
      }
    }
    
    // Reset regex lastIndex
    PATTERNS.numericValues.lastIndex = 0;
    
    // Check for hardcoded clamp()
    if (PATTERNS.hardcodedClamp.test(line) && !line.includes('--')) {
      const clampMatch = line.match(/clamp\([^)]+\)/);
      if (clampMatch) {
        const propertyMatch = line.match(/([a-z-]+):\s*clamp/);
        const property = propertyMatch ? propertyMatch[1] : 'unknown';
        
        findings.push({
          file: relativePath,
          line: lineNumber,
          property,
          value: clampMatch[0],
          context: line.trim(),
          suggestion: 'Move to tokens.css as CSS variable'
        });
      }
    }
    
    // Reset regex lastIndex
    PATTERNS.hardcodedClamp.lastIndex = 0;
    
    // Check for raw z-index
    const zIndexMatch = PATTERNS.rawZIndex.exec(line);
    if (zIndexMatch) {
      findings.push({
        file: relativePath,
        line: lineNumber,
        property: 'z-index',
        value: zIndexMatch[1],
        context: line.trim(),
        suggestion: 'Use z-index token (e.g., --z-modal)'
      });
    }
    
    // Reset regex lastIndex
    PATTERNS.rawZIndex.lastIndex = 0;
  });
  
  return findings;
};

// Suggest appropriate token based on property and value
const suggestToken = (property, value) => {
  const numValue = parseFloat(value);
  
  // Font size suggestions
  if (property === 'font-size') {
    if (numValue <= 0.75) return 'Use --fs-3xs or --fs-2xs';
    if (numValue <= 0.875) return 'Use --fs-xs';
    if (numValue <= 1) return 'Use --fs-sm';
    if (numValue <= 1.25) return 'Use --fs-md';
    if (numValue <= 1.5) return 'Use --fs-lg';
    return 'Use appropriate --fs-* token';
  }
  
  // Spacing suggestions
  if (['margin', 'padding', 'gap', 'top', 'left', 'right', 'bottom'].includes(property)) {
    if (numValue <= 0.25) return 'Use --space-3xs';
    if (numValue <= 0.5) return 'Use --space-2xs';
    if (numValue <= 0.75) return 'Use --space-xs';
    if (numValue <= 1) return 'Use --space-sm';
    if (numValue <= 1.5) return 'Use --space-md';
    if (numValue <= 2) return 'Use --space-lg';
    return 'Use appropriate --space-* token';
  }
  
  // Width/height suggestions
  if (['width', 'height'].includes(property)) {
    return 'Consider creating a component-specific token with clamp()';
  }
  
  return 'Tokenize value';
};

// Find CSS files recursively
const findCSSFiles = async (dir, files = []) => {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules') {
        await findCSSFiles(fullPath, files);
      }
    } else if (entry.name.endsWith('.css') || entry.name.endsWith('.module.css')) {
      if (!EXCLUDE_FILES.includes(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
};

// Main execution
const main = async () => {
  // Ensure output directory exists
  const reportsDir = path.dirname(OUTPUT_CSV);
  if (!fs.existsSync(reportsDir)) {
    await fs.promises.mkdir(reportsDir, { recursive: true });
  }
  
  // Find all CSS files
  const cssFiles = await findCSSFiles(SRC_DIR);
  
  console.log(`Found ${cssFiles.length} CSS files to audit`);
  
  // Process all files
  const allFindings = [];
  for (const file of cssFiles) {
    const findings = await parseFile(file);
    allFindings.push(...findings);
  }
  
  // Sort findings by file and line number
  allFindings.sort((a, b) => {
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    return a.line - b.line;
  });
  
  // Generate CSV
  const csvHeader = 'File Path,Line Number,CSS Property,Detected Value,Context/Rule,Suggestion\n';
  const csvRows = allFindings.map(f => 
    `"${f.file}",${f.line},"${f.property}","${f.value}","${f.context.replace(/"/g, '""')}","${f.suggestion}"`
  ).join('\n');
  
  await fs.promises.writeFile(OUTPUT_CSV, csvHeader + csvRows);
  
  // Summary
  console.log(`\nAudit complete!`);
  console.log(`Total findings: ${allFindings.length}`);
  console.log(`Report saved to: ${OUTPUT_CSV}`);
  
  // Group by type for summary
  const byProperty = {};
  allFindings.forEach(f => {
    byProperty[f.property] = (byProperty[f.property] || 0) + 1;
  });
  
  console.log('\nFindings by property:');
  Object.entries(byProperty)
    .sort(([,a], [,b]) => b - a)
    .forEach(([prop, count]) => {
      console.log(`  ${prop}: ${count}`);
    });
};

// Run the audit
main().catch(console.error);