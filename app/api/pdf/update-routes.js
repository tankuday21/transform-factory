/**
 * Script to update all PDF API routes to use the new parse-form utility
 * 
 * Run with: node app/api/pdf/update-routes.js
 */

const fs = require('fs');
const path = require('path');

// Routes to update
const apiRoutesDir = path.join(process.cwd(), 'app', 'api', 'pdf');

// Template for imports
const importTemplate = `import { parseForm, readFileAsBuffer } from '@/app/lib/parse-form';\n`;

// Function to process a file
function updateRouteFile(filePath) {
  if (!filePath.endsWith('route.ts')) return;
  
  console.log(`Updating: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip files that have already been updated
  if (content.includes('import { parseForm') || 
      content.includes('import { parseSimpleForm') ||
      filePath.includes('update-routes.js')) {
    console.log(`Skipping already updated file: ${filePath}`);
    return;
  }
  
  // Replace formidable import if exists
  if (content.includes('* as formidable')) {
    content = content.replace(/import \* as formidable from ['"]formidable['"];(\r?\n|\r)?/, '');
  } else if (content.includes('from \'formidable\'')) {
    content = content.replace(/import (\w+) from ['"]formidable['"];(\r?\n|\r)?/, '');
  }
  
  // Remove PassThrough import if exists
  if (content.includes('PassThrough')) {
    content = content.replace(/import \{ PassThrough \} from ['"]stream['"];(\r?\n|\r)?/, '');
  }
  
  // Add new import after the last import
  const lastImportIndex = content.lastIndexOf('import ');
  if (lastImportIndex > -1) {
    const importEndIndex = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, importEndIndex + 1) + 
              importTemplate + 
              content.slice(importEndIndex + 1);
  }
  
  // Remove the parseForm function
  const parseFormStartPattern = /\/\/ Function to parse form data.*?\n.*?const parseForm/s;
  const parseFormEndPattern = /};/;
  
  if (content.match(parseFormStartPattern)) {
    const parseFormStart = content.match(parseFormStartPattern).index;
    const parseFormDeclaration = content.match(parseFormStartPattern)[0];
    
    // Find the end of the parseForm function
    const parseFormFuncStart = content.indexOf(parseFormDeclaration);
    const parseFormFuncAfter = content.substring(parseFormFuncStart);
    const bracketCount = (parseFormDeclaration.match(/\{/g) || []).length;
    
    let bracketIndex = parseFormFuncStart;
    let remainingBrackets = bracketCount;
    
    for (let i = 0; i < bracketCount; i++) {
      bracketIndex = content.indexOf('{', bracketIndex + 1);
    }
    
    let endIndex = bracketIndex;
    let currChar;
    
    while (remainingBrackets > 0 && endIndex < content.length) {
      endIndex++;
      currChar = content[endIndex];
      
      if (currChar === '{') {
        remainingBrackets++;
      } else if (currChar === '}') {
        remainingBrackets--;
      }
    }
    
    // Remove the function
    const beforeFunc = content.substring(0, parseFormStart);
    const afterFunc = content.substring(endIndex + 1).trim();
    content = beforeFunc + afterFunc;
  }
  
  // Add error logging
  if (!content.includes('console.error')) {
    content = content.replace(
      /return NextResponse\.json\(\s*\{\s*error: ['"]([^'"]+)['"]\s*\},\s*\{\s*status: (\d+)\s*\}\s*\);/g,
      (match, errorMsg, status) => {
        const routeName = path.basename(path.dirname(filePath));
        return `console.error('${routeName}: ${errorMsg}');\n      return NextResponse.json({ error: '${errorMsg}' }, { status: ${status} });`;
      }
    );
  }
  
  // Save the updated file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// Recursively process all files
function processDirectory(directory) {
  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      processDirectory(itemPath);
    } else if (stats.isFile() && item.endsWith('.ts')) {
      updateRouteFile(itemPath);
    }
  }
}

// Start processing
processDirectory(apiRoutesDir);
console.log('Done updating route files!'); 