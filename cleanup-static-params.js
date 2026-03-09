const fs = require('fs');
const path = require('path');

const dynamicRoutePaths = [
  './app/dashboard/breaking-news/[id]/page.tsx',
  './app/dashboard/categories/edit/[id]/page.tsx',
  './app/dashboard/privacy-policy/edit/[id]/page.tsx',
  './app/dashboard/tags/edit/[id]/page.tsx',
  './app/dashboard/terms-of-use/edit/[id]/page.tsx',
  './app/dashboard/users/edit/[id]/page.tsx'
];

dynamicRoutePaths.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove the generateStaticParams function with more flexible matching
      const lines = content.split('\n');
      const newLines = [];
      let skipLines = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Start skipping when we find the comment
        if (line.includes('// For static export - return empty array')) {
          skipLines = true;
          continue;
        }
        
        // Stop skipping after the closing brace
        if (skipLines && line.trim() === '}') {
          skipLines = false;
          continue;
        }
        
        // Skip empty lines after the function
        if (skipLines || (skipLines === false && line.trim() === '' && newLines[newLines.length - 1] === '')) {
          continue;
        }
        
        if (!skipLines) {
          newLines.push(line);
        }
      }
      
      const newContent = newLines.join('\n');
      
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Cleaned generateStaticParams from: ${filePath}`);
      } else {
        console.log(`No changes needed in: ${filePath}`);
      }
    } else {
      console.log(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log('Cleanup completed!');