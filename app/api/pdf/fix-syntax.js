/**
 * Script to fix syntax issues in PDF API routes
 * 
 * Run with: node app/api/pdf/fix-syntax.js
 */

const fs = require('fs');
const path = require('path');

// Routes to update
const apiRoutesDir = path.join(process.cwd(), 'app', 'api', 'pdf');

// Function to process a file
function fixRouteFile(filePath) {
  if (!filePath.endsWith('route.ts')) return;
  
  console.log(`Checking: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix comment syntax issues
  if (content.includes('/ Function to parse')) {
    content = content.replace(/\/\s+Function to parse/g, '// Function to parse');
    modified = true;
    console.log(`  Fixed comment syntax in: ${filePath}`);
  }
  
  // Fix double parseForm issues
  if (content.includes('import { parseForm') && content.includes('async function parseForm')) {
    content = content.replace(
      /async function parseForm\(req: NextRequest\)/g, 
      `async function parse${path.basename(path.dirname(filePath))}Form(req: NextRequest)`
    );
    
    // Also update the function call
    content = content.replace(
      /await parseForm\(req\)/g, 
      `await parse${path.basename(path.dirname(filePath))}Form(req)`
    );
    
    modified = true;
    console.log(`  Fixed duplicate parseForm function in: ${filePath}`);
  }
  
  // Save the updated file if modified
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Updated: ${filePath}`);
  }
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
      fixRouteFile(itemPath);
    }
  }
}

// Start processing
processDirectory(apiRoutesDir);
console.log('Done fixing route files!'); 