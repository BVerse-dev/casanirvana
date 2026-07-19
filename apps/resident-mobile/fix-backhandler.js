const fs = require('fs');
const path = require('path');

// Get all JS files that contain BackHandler.removeEventListener
const findFiles = (dir, pattern) => {
  const files = [];
  const dirFiles = fs.readdirSync(dir);
  
  dirFiles.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules') {
      files.push(...findFiles(filePath, pattern));
    } else if (file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(pattern)) {
        files.push(filePath);
      }
    }
  });
  
  return files;
};

// Fix the BackHandler usage
const files = findFiles('./screens', 'BackHandler.removeEventListener');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace removeEventListener with remove() method
  const oldPattern = /BackHandler\.removeEventListener\("hardwareBackPress",\s*([^)]+)\);/g;
  const newContent = content.replace(oldPattern, (match, handler) => {
    // Check if the handler variable exists and add proper cleanup
    return `if (${handler.trim()}) {
        const subscription = BackHandler.addEventListener("hardwareBackPress", ${handler.trim()});
        subscription?.remove();
      }`;
  });
  
  if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    console.log(\`Fixed: \${file}\`);
  }
});

console.log('BackHandler fix completed!');
