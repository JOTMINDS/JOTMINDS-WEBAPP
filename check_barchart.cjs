const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
      callback(dirPath);
    }
  });
}

walkDir('./src', (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('BarChart3')) {
    // Check if it's imported
    const importMatch = content.match(/import\s+{([^}]*)}\s+from\s+['"]lucide-react['"]/);
    if (!importMatch || !importMatch[1].includes('BarChart3')) {
      console.log('MISSING IN:', filePath);
    }
  }
});
